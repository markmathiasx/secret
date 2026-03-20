#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const reportPath = path.resolve(root, "CATALOG_VALIDATION_REPORT.json");
const sourceUrl = process.env.CATALOG_SOURCE_URL || "https://mdh-3d-store.vercel.app/api/catalog?scope=all";
const sourceFile = process.env.CATALOG_SOURCE_FILE || "";
const placeholderCandidates = [
  path.resolve(root, "public", "catalog-assets", "product-placeholder.webp"),
  path.resolve(root, "public", "catalog-assets", "product-placeholder.jpg"),
  path.resolve(root, "catalog-assets", "product-placeholder.webp"),
];
const placeholderThreshold = 8;

function resolveLocalPath(imagePath) {
  return path.resolve(root, "public", imagePath.replace(/^\//, ""));
}

function getPrimaryImage(item) {
  return item.image || (Array.isArray(item.images) ? item.images[0] : "") || "";
}

function getVisualKind(imagePath) {
  if (imagePath.startsWith("/products/foto-")) return "foto-real";
  if (imagePath.startsWith("/products/render-")) return "render-fiel";
  return "imagem-conceitual";
}

async function getRaw32(filePath) {
  return sharp(filePath)
    .resize(32, 32, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();
}

function meanAbsoluteDifference(bufferA, bufferB) {
  let total = 0;
  for (let index = 0; index < bufferA.length; index += 1) {
    total += Math.abs(bufferA[index] - bufferB[index]);
  }
  return total / bufferA.length;
}

async function fetchCatalog() {
  if (sourceFile) {
    const filePath = path.resolve(root, sourceFile);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (Array.isArray(raw)) {
      return { items: raw, sourceLabel: filePath };
    }
    if (Array.isArray(raw?.items)) {
      return { items: raw.items, sourceLabel: filePath };
    }
    throw new Error(`Arquivo de catálogo inválido: ${filePath}`);
  }

  const response = await fetch(sourceUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Falha ao carregar catálogo em ${sourceUrl}: ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data?.items)) {
    throw new Error(`Resposta inesperada do catálogo em ${sourceUrl}`);
  }
  return { items: data.items, sourceLabel: sourceUrl };
}

async function main() {
  console.log("\n📋 VALIDAÇÃO DE CATÁLOGO + IMAGENS PUBLICADAS\n");
  console.log("=".repeat(72));
  console.log(`Fonte do catálogo: ${sourceFile ? path.resolve(root, sourceFile) : sourceUrl}`);

  const placeholderPath = placeholderCandidates.find((candidate) => fs.existsSync(candidate));
  if (!placeholderPath) {
    throw new Error("Nenhum arquivo product-placeholder foi encontrado em public/catalog-assets ou catalog-assets.");
  }

  const placeholderRaw = await getRaw32(placeholderPath);
  const { items, sourceLabel } = await fetchCatalog();

  const missing = [];
  const placeholderRisk = [];
  const valid = [];

  const summary = {
    timestamp: new Date().toISOString(),
    source: sourceLabel,
    total: items.length,
    valid: 0,
    missing: 0,
    placeholderRisk: 0,
    visualKinds: {
      "foto-real": 0,
      "render-fiel": 0,
      "imagem-conceitual": 0,
    },
    missingIds: [],
    placeholderRiskIds: [],
  };

  for (const item of items) {
    const imagePath = getPrimaryImage(item);
    const visualKind = getVisualKind(imagePath);
    summary.visualKinds[visualKind] += 1;

    if (!imagePath) {
      missing.push({ id: item.id, name: item.name, imagePath, reason: "Sem imagem primária" });
      continue;
    }

    const localPath = resolveLocalPath(imagePath);
    if (!fs.existsSync(localPath)) {
      missing.push({ id: item.id, name: item.name, imagePath, reason: "Arquivo não encontrado em public/" });
      continue;
    }

    const imageRaw = await getRaw32(localPath);
    const distance = meanAbsoluteDifference(placeholderRaw, imageRaw);

    if (imagePath === "/catalog-assets/product-placeholder.webp" || distance <= placeholderThreshold) {
      placeholderRisk.push({
        id: item.id,
        name: item.name,
        imagePath,
        placeholderDistance: Number(distance.toFixed(2)),
      });
      continue;
    }

    valid.push({
      id: item.id,
      name: item.name,
      imagePath,
      visualKind,
      placeholderDistance: Number(distance.toFixed(2)),
    });
  }

  summary.valid = valid.length;
  summary.missing = missing.length;
  summary.placeholderRisk = placeholderRisk.length;
  summary.missingIds = missing.map((item) => item.id);
  summary.placeholderRiskIds = placeholderRisk.map((item) => item.id);

  const passRate = Math.round((valid.length / items.length) * 100);

  console.log(`\n✅ Produtos auditados: ${items.length}`);
  console.log(`✅ Visuais publicados e aceitos: ${valid.length}`);
  console.log(`⚠️  Imagens ausentes: ${missing.length}`);
  console.log(`⚠️  Placeholder ou risco visual: ${placeholderRisk.length}`);
  console.log(`📊 Taxa de sucesso real: ${passRate}%`);
  console.log(`📷 Foto real: ${summary.visualKinds["foto-real"]}`);
  console.log(`🧊 Render fiel: ${summary.visualKinds["render-fiel"]}`);
  console.log(`🎯 Imagem conceitual: ${summary.visualKinds["imagem-conceitual"]}`);

  if (missing.length > 0) {
    console.log("\nARQUIVOS AUSENTES");
    console.log("-".repeat(72));
    missing.slice(0, 20).forEach((item, index) => {
      console.log(`${index + 1}. ${item.id} | ${item.name}`);
      console.log(`   ${item.reason}: ${item.imagePath || "(vazio)"}`);
    });
  }

  if (placeholderRisk.length > 0) {
    console.log("\nPLACEHOLDER OU RISCO VISUAL");
    console.log("-".repeat(72));
    placeholderRisk.slice(0, 20).forEach((item, index) => {
      console.log(`${index + 1}. ${item.id} | ${item.name}`);
      console.log(`   ${item.imagePath} | distância ${item.placeholderDistance}`);
    });
  }

  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        ...summary,
        passRate: `${passRate}%`,
        validItems: valid,
        missingItems: missing,
        placeholderRiskItems: placeholderRisk,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\n✅ Relatório salvo em: ${reportPath}`);
  console.log("=".repeat(72) + "\n");

  process.exit(missing.length === 0 && placeholderRisk.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
