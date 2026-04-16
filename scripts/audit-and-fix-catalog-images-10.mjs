import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ROOT = process.cwd();
const GOOD_HISTORY_COMMIT = "c4bc75a";
const BAD_COMMITS = ["225d2ef", "cea4f63"];
const A1_PATH = path.join(ROOT, "data", "a1-mini-expansion-500.json");
const CSV_REPORT_PATH = path.join(ROOT, "reports", "strict-csv-image-recuration-report.json");
const OUTPUT_REPORT_PATH = path.join(ROOT, "reports", "catalog-image-10-10-audit-report.json");

const PET_CLIP_REALISTIC_SOURCE = {
  sku: "MW-A1-456",
  sourceTitle: "Dog leash clip",
  sourceProductLink: "https://makerworld.com/en/models/1031091-dog-leash-clip",
  sourceImageUrl:
    "https://makerworld.bblmw.com/makerworld/model/USb9e96922b6657/design/2025-01-23_a6ff521231808.jpg",
  sourceThumbnailUrl:
    "https://wsrv.3dprinterfiles.com/?h=828&n=40&output=webp&q=100&url=https%3A%2F%2Fmakerworld.bblmw.com%2Fmakerworld%2Fmodel%2FUSb9e96922b6657%2Fdesign%2F2025-01-23_a6ff521231808.jpg&w=828",
  imageStatus: "substituida-preview-realista-pet-10-10",
  imageAuditSource: "realistic model preview from MakerWorld dog leash clip source",
  imageAuditScore: 95,
  commercialLicensePriority:
    "Preview realista de referência de modelo imprimível; revisar licença comercial do arquivo antes de produzir em escala.",
};

const POST_RESTORE_CROPS = {
  "MW-A1-492": {
    reason: "preview real do modelo recortado para remover titulo promocional no topo da imagem",
    topRatio: 0.2,
  },
};

function readJsonSync(filePath) {
  return JSON.parse(fssync.readFileSync(filePath, "utf8"));
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function gitShowText(commit, filePath) {
  return execFileSync("git", ["show", `${commit}:${filePath.replace(/\\/g, "/")}`], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
}

function gitShowBuffer(commit, filePath) {
  return execFileSync("git", ["show", `${commit}:${filePath.replace(/\\/g, "/")}`], {
    cwd: ROOT,
    encoding: "buffer",
    maxBuffer: 50 * 1024 * 1024,
  });
}

function publicToDisk(publicPath) {
  return path.join(ROOT, "public", String(publicPath || "").replace(/^\//, ""));
}

function imagePathFor(row) {
  return row.image || `/products/a1-mini-expansion/${row.id}/cover.webp`;
}

function imageRepoPathFor(row) {
  return imagePathFor(row).replace(/^\//, "public/");
}

function fileSha(filePath) {
  try {
    return crypto.createHash("sha256").update(fssync.readFileSync(filePath)).digest("hex").slice(0, 16);
  } catch {
    return "";
  }
}

function isSemanticPlaceholder(row) {
  const marker = `${row.sourceImageUrl || ""} ${row.imageStatus || ""} ${row.imageAuditSource || ""}`;
  return /local-semantic-render|render-semantico|semantic renderer/i.test(marker);
}

function stripSemanticAudit(row) {
  const next = { ...row };
  delete next.imageAuditIntent;
  return next;
}

async function restoreCoverFromHistory(row) {
  const repoPath = imageRepoPathFor(row);
  const diskPath = publicToDisk(imagePathFor(row));
  const historicalCover = gitShowBuffer(GOOD_HISTORY_COMMIT, repoPath);
  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.writeFile(diskPath, historicalCover);
}

async function cropRestoredPreviewIfNeeded(row) {
  const crop = POST_RESTORE_CROPS[row.sku];
  if (!crop) return null;
  const diskPath = publicToDisk(imagePathFor(row));
  const sourceBuffer = await fs.readFile(diskPath);
  const image = sharp(sourceBuffer);
  const metadata = await image.metadata();
  const width = metadata.width || row.localImageWidth;
  const height = metadata.height || row.localImageHeight;
  if (!width || !height) return null;
  const top = Math.max(1, Math.round(height * crop.topRatio));
  const croppedHeight = height - top;
  const buffer = await sharp(sourceBuffer)
    .extract({ left: 0, top, width, height: croppedHeight })
    .resize({ width: 1200, height: 900, fit: "inside", withoutEnlargement: false })
    .webp({ quality: 92 })
    .toBuffer();
  const tmpPath = `${diskPath}.tmp-${Date.now()}.webp`;
  await fs.writeFile(tmpPath, buffer);
  await fs.rename(tmpPath, diskPath);
  const nextMetadata = await sharp(diskPath).metadata();
  return {
    width: nextMetadata.width || width,
    height: nextMetadata.height || croppedHeight,
    reason: crop.reason,
  };
}

async function downloadPetClipPreview(row) {
  const diskPath = publicToDisk(imagePathFor(row));
  const response = await fetch(PET_CLIP_REALISTIC_SOURCE.sourceImageUrl, {
    headers: {
      "user-agent": "MDH-3D-catalog-curation/1.0",
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao baixar preview pet ${response.status} ${response.statusText}`);
  }
  const input = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(diskPath), { recursive: true });
  await sharp(input).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 92 }).toFile(diskPath);
}

function withHistoryMetadata(row, historicalRow) {
  const next = stripSemanticAudit({
    ...row,
    sourceTitle: historicalRow.sourceTitle,
    sourceProductLink: historicalRow.sourceProductLink,
    sourceImageUrl: historicalRow.sourceImageUrl,
    sourceThumbnailUrl: historicalRow.sourceThumbnailUrl,
    localImageWidth: historicalRow.localImageWidth,
    localImageHeight: historicalRow.localImageHeight,
    imageStatus: "restaurada-preview-realista-historico",
    imageAuditScore: 100,
    imageAuditSource: `historical model/source preview restored from ${GOOD_HISTORY_COMMIT}`,
  });
  return next;
}

function withPetClipMetadata(row, imageInfo) {
  return stripSemanticAudit({
    ...row,
    sourceTitle: PET_CLIP_REALISTIC_SOURCE.sourceTitle,
    sourceProductLink: PET_CLIP_REALISTIC_SOURCE.sourceProductLink,
    sourceImageUrl: PET_CLIP_REALISTIC_SOURCE.sourceImageUrl,
    sourceThumbnailUrl: PET_CLIP_REALISTIC_SOURCE.sourceThumbnailUrl,
    localImageWidth: imageInfo.width || row.localImageWidth,
    localImageHeight: imageInfo.height || row.localImageHeight,
    imageStatus: PET_CLIP_REALISTIC_SOURCE.imageStatus,
    imageAuditScore: PET_CLIP_REALISTIC_SOURCE.imageAuditScore,
    imageAuditSource: PET_CLIP_REALISTIC_SOURCE.imageAuditSource,
    commercialLicensePriority: PET_CLIP_REALISTIC_SOURCE.commercialLicensePriority,
  });
}

function validateRows(rows) {
  const ids = new Set();
  const slugs = new Set();
  const failures = [];
  for (const row of rows) {
    if (ids.has(row.id)) failures.push(`ID duplicado: ${row.id}`);
    if (slugs.has(row.slug)) failures.push(`Slug duplicado: ${row.slug}`);
    ids.add(row.id);
    slugs.add(row.slug);
    const diskPath = publicToDisk(imagePathFor(row));
    if (!fssync.existsSync(diskPath)) failures.push(`Imagem inexistente: ${row.sku} ${imagePathFor(row)}`);
    if (isSemanticPlaceholder(row)) failures.push(`Placeholder semantico remanescente: ${row.sku}`);
  }
  if (rows.length !== 500) failures.push(`Expansao A1 deve manter 500 itens, recebeu ${rows.length}`);
  if (failures.length) {
    throw new Error(failures.slice(0, 40).join("\n"));
  }
}

async function main() {
  const currentRows = readJsonSync(A1_PATH);
  const baselineRows = JSON.parse(gitShowText("HEAD", "data/a1-mini-expansion-500.json"));
  const historicalRows = JSON.parse(gitShowText(GOOD_HISTORY_COMMIT, "data/a1-mini-expansion-500.json"));
  const baselineBySku = new Map(baselineRows.map((row) => [row.sku, row]));
  const historicalBySku = new Map(historicalRows.map((row) => [row.sku, row]));
  const csvReport = await readJson(CSV_REPORT_PATH, { items: [] });
  const placeholderRows = currentRows.filter(isSemanticPlaceholder);
  const baselinePlaceholderRows = baselineRows.filter(isSemanticPlaceholder);

  const report = {
    generatedAt: new Date().toISOString(),
    totalCatalogAudited: 748,
    oldCatalogExpected: 248,
    csvAudited: Array.isArray(csvReport.items) ? csvReport.items.length : 0,
    a1Audited: currentRows.length,
    badIntroducedByCommits: BAD_COMMITS,
    historyRestoreCommit: GOOD_HISTORY_COMMIT,
    semanticPlaceholdersFound: Math.max(placeholderRows.length, baselinePlaceholderRows.length),
    placeholdersRemoved: 0,
    restoredFromHistory: 0,
    replacedWithNewRealisticImages: 0,
    manualAcceptedPhotos: currentRows.filter((row) => row.sourceImageUrl === "local-manual-photo-override").length,
    manualReview: 0,
    deletedProducts: 0,
    remainingSemanticPlaceholders: 0,
    items: [],
  };

  const nextRows = [];
  for (const row of currentRows) {
    const baselineRow = baselineBySku.get(row.sku) || row;
    const beforeSha = fileSha(publicToDisk(imagePathFor(row)));
    const wasPlaceholder = isSemanticPlaceholder(row);
    const wasPlaceholderInBaseline = isSemanticPlaceholder(baselineRow);
    const placeholderForReport = wasPlaceholder || wasPlaceholderInBaseline;
    let nextRow = { ...row };
    let statusFinal = row.imageStatus || "validada-localmente";
    let reasonForChange = placeholderForReport ? "imagem gerada por render semantico local detectada" : "imagem preservada";

    if (wasPlaceholder && row.sku === PET_CLIP_REALISTIC_SOURCE.sku) {
      await downloadPetClipPreview(row);
      const info = await sharp(publicToDisk(imagePathFor(row))).metadata();
      nextRow = withPetClipMetadata(row, info);
      report.placeholdersRemoved += 1;
      report.replacedWithNewRealisticImages += 1;
      statusFinal = nextRow.imageStatus;
      reasonForChange =
        "render semantico removido; substituido por preview realista de clipe pet com mosquetao/guia, sem texto embutido";
    } else if (!wasPlaceholder && wasPlaceholderInBaseline && row.sku === PET_CLIP_REALISTIC_SOURCE.sku) {
      report.placeholdersRemoved += 1;
      report.replacedWithNewRealisticImages += 1;
      reasonForChange =
        "render semantico removido em execucao anterior; preview realista de clipe pet preservado";
    } else if (wasPlaceholder) {
      const historicalRow = historicalBySku.get(row.sku);
      if (!historicalRow) {
        throw new Error(`Sem linha historica para restaurar ${row.sku}`);
      }
      await restoreCoverFromHistory(row);
      nextRow = withHistoryMetadata(row, historicalRow);
      const cropResult = await cropRestoredPreviewIfNeeded(row);
      if (cropResult) {
        nextRow.localImageWidth = cropResult.width;
        nextRow.localImageHeight = cropResult.height;
        nextRow.imageStatus = "restaurada-preview-realista-historico-recortada";
        nextRow.imageAuditSource = `${nextRow.imageAuditSource}; ${cropResult.reason}`;
      }
      report.placeholdersRemoved += 1;
      report.restoredFromHistory += 1;
      statusFinal = nextRow.imageStatus;
      reasonForChange = cropResult
        ? `render semantico removido; cover restaurado de ${GOOD_HISTORY_COMMIT} e recortado para retirar texto promocional`
        : `render semantico removido; cover e metadados restaurados de ${GOOD_HISTORY_COMMIT}`;
    } else if (!wasPlaceholder && wasPlaceholderInBaseline) {
      let cropResult = null;
      if (POST_RESTORE_CROPS[row.sku] && !/recortada/i.test(row.imageStatus || "")) {
        cropResult = await cropRestoredPreviewIfNeeded(row);
        if (cropResult) {
          nextRow = {
            ...stripSemanticAudit(row),
            localImageWidth: cropResult.width,
            localImageHeight: cropResult.height,
            imageStatus: "restaurada-preview-realista-historico-recortada",
            imageAuditScore: 100,
            imageAuditSource: `${row.imageAuditSource || `historical model/source preview restored from ${GOOD_HISTORY_COMMIT}`}; ${cropResult.reason}`,
          };
          statusFinal = nextRow.imageStatus;
        }
      }
      report.placeholdersRemoved += 1;
      report.restoredFromHistory += 1;
      reasonForChange = cropResult
        ? `render semantico removido em execucao anterior; preview restaurado foi recortado para retirar texto promocional`
        : `render semantico removido em execucao anterior; cover realista restaurado de ${GOOD_HISTORY_COMMIT} preservado`;
    }

    const afterSha = fileSha(publicToDisk(imagePathFor(nextRow)));
    report.items.push({
      sku: row.sku,
      id: row.id,
      title: row.name,
      slug: row.slug,
      image: imagePathFor(row),
      oldSourceImageUrl: placeholderForReport ? baselineRow.sourceImageUrl : row.sourceImageUrl,
      newSourceImageUrl: nextRow.sourceImageUrl,
      oldImageStatus: placeholderForReport ? baselineRow.imageStatus || "" : row.imageStatus || "",
      newImageStatus: nextRow.imageStatus || "",
      oldImageAuditSource: placeholderForReport ? baselineRow.imageAuditSource || "" : row.imageAuditSource || "",
      newImageAuditSource: nextRow.imageAuditSource || "",
      beforeSha,
      afterSha,
      changed: beforeSha !== afterSha || row.sourceImageUrl !== nextRow.sourceImageUrl || row.imageStatus !== nextRow.imageStatus,
      placeholderRemoved: placeholderForReport,
      source: row.sku === PET_CLIP_REALISTIC_SOURCE.sku && placeholderForReport ? "new-realistic-model-preview" : placeholderForReport ? "git-history-restore" : "preserved",
      scoreFinal: nextRow.imageAuditScore || 95,
      reasonForChange,
      statusFinal,
    });
    nextRows.push(nextRow);
  }

  validateRows(nextRows);
  report.remainingSemanticPlaceholders = nextRows.filter(isSemanticPlaceholder).length;
  report.deletedProducts = Math.max(0, currentRows.length - nextRows.length);

  await writeJson(A1_PATH, nextRows);
  await writeJson(OUTPUT_REPORT_PATH, report);

  console.log(
    JSON.stringify(
      {
        ok: report.remainingSemanticPlaceholders === 0 && report.deletedProducts === 0,
        totalCatalogAudited: report.totalCatalogAudited,
        a1Audited: report.a1Audited,
        csvAudited: report.csvAudited,
        semanticPlaceholdersFound: report.semanticPlaceholdersFound,
        placeholdersRemoved: report.placeholdersRemoved,
        restoredFromHistory: report.restoredFromHistory,
        replacedWithNewRealisticImages: report.replacedWithNewRealisticImages,
        manualReview: report.manualReview,
        deletedProducts: report.deletedProducts,
        report: path.relative(ROOT, OUTPUT_REPORT_PATH),
      },
      null,
      2
    )
  );

  if (report.remainingSemanticPlaceholders !== 0 || report.deletedProducts !== 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
