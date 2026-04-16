import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "input", "real-photos");
const MANIFEST_PATH = path.join(ROOT, "data", "catalog-photo-manifest.json");
const OUTPUT_CATALOG_DIR = path.join(ROOT, "public", "products", "catalog");
const OUTPUT_GALLERY_DIR = path.join(ROOT, "public", "products", "gallery");
const REPORT_PATH = path.join(ROOT, "reports", "import-real-photos-report.json");

function extractProductId(fileName) {
  const match = String(fileName).toLowerCase().match(/(mdh-\d{3})/);
  return match ? match[1] : "";
}

function extractOrder(fileName) {
  const match = String(fileName).toLowerCase().match(/(?:^|[_-])(\d+)(?=\.[a-z]+$)/);
  return match ? Number(match[1]) : 1;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readManifest() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function listSourceFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(dir, entry.name))
      .filter((filePath) => /\.(jpg|jpeg|png|webp)$/i.test(filePath));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function convertToWebp(inputPath, outputPath, width = 1600) {
  await ensureDir(path.dirname(outputPath));
  await sharp(inputPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88 })
    .toFile(outputPath);
}

function mergeEntry(existing, nextEntry) {
  return {
    ...existing,
    ...nextEntry,
  };
}

async function main() {
  const report = {
    inputDir: INPUT_DIR,
    manifestPath: MANIFEST_PATH,
    processedAt: new Date().toISOString(),
    importedProducts: [],
    unmatchedFiles: [],
    summary: {
      sourceFiles: 0,
      importedProducts: 0,
      importedImages: 0,
      unmatchedFiles: 0
    }
  };

  await ensureDir(INPUT_DIR);
  await ensureDir(OUTPUT_CATALOG_DIR);
  await ensureDir(OUTPUT_GALLERY_DIR);
  await ensureDir(path.dirname(REPORT_PATH));

  const manifest = await readManifest();
  const sourceFiles = await listSourceFiles(INPUT_DIR);
  report.summary.sourceFiles = sourceFiles.length;

  const grouped = new Map();

  for (const filePath of sourceFiles) {
    const fileName = path.basename(filePath);
    const productId = extractProductId(fileName);

    if (!productId) {
      report.unmatchedFiles.push({ file: fileName, reason: "arquivo sem id mdh-### no nome" });
      continue;
    }

    const list = grouped.get(productId) || [];
    list.push({
      filePath,
      fileName,
      order: extractOrder(fileName)
    });
    grouped.set(productId, list);
  }

  const manifestMap = new Map(
    manifest.map((entry) => [String(entry.id || "").toLowerCase(), entry])
  );

  for (const [productId, items] of grouped.entries()) {
    const sorted = items.sort((a, b) => a.order - b.order || a.fileName.localeCompare(b.fileName));
    const gallery = [];

    for (let index = 0; index < sorted.length; index += 1) {
      const item = sorted[index];
      const imageNumber = String(index + 1).padStart(2, "0");
      const galleryOutputPath = path.join(OUTPUT_GALLERY_DIR, productId, `${imageNumber}.webp`);
      await convertToWebp(item.filePath, galleryOutputPath, 1600);
      gallery.push(`/products/gallery/${productId}/${imageNumber}.webp`);
      report.summary.importedImages += 1;
    }

    const coverOutputPath = path.join(OUTPUT_CATALOG_DIR, `${productId}.webp`);
    await convertToWebp(sorted[0].filePath, coverOutputPath, 1600);

    const existing = manifestMap.get(productId) || {};
    const currentName =
      existing.name ||
      String(sorted[0].fileName)
        .replace(/\.[a-z0-9]+$/i, "")
        .replace(/mdh-\d{3}[-_ ]*/i, "")
        .replace(/[-_]+/g, " ")
        .trim() ||
      productId.toUpperCase();

    const nextEntry = mergeEntry(existing, {
      id: productId,
      name: currentName,
      sourceFilename: sorted[0].fileName,
      kind: "foto-real",
      gallery: [`/products/catalog/${productId}.webp`, ...gallery.slice(1)],
    });

    manifestMap.set(productId, nextEntry);

    report.importedProducts.push({
      productId,
      cover: `/products/catalog/${productId}.webp`,
      galleryCount: nextEntry.gallery.length,
      sourceFiles: sorted.map((item) => item.fileName)
    });
  }

  const nextManifest = Array.from(manifestMap.values()).sort((a, b) =>
    String(a.id || "").localeCompare(String(b.id || ""))
  );

  report.summary.importedProducts = report.importedProducts.length;
  report.summary.unmatchedFiles = report.unmatchedFiles.length;

  await writeJson(MANIFEST_PATH, nextManifest);
  await writeJson(REPORT_PATH, report);

  console.log(
    JSON.stringify(
      {
        ok: true,
        importedProducts: report.summary.importedProducts,
        importedImages: report.summary.importedImages,
        unmatchedFiles: report.summary.unmatchedFiles,
        report: "reports/import-real-photos-report.json",
        manifest: "data/catalog-photo-manifest.json"
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
