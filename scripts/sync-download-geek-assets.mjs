import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { strFromU8, unzipSync } from "fflate";
import manifest from "../data/catalog-photo-manifest.json" with { type: "json" };
import validationReport from "../CATALOG_VALIDATION_REPORT.json" with { type: "json" };

const root = process.cwd();
const downloadDir = path.join(process.env.USERPROFILE || "C:\\Users\\markm", "Downloads", "geek");
const catalogDir = path.join(root, "public", "products", "catalog");
const galleryDir = path.join(root, "public", "products", "gallery");
const modelDir = path.join(root, "public", "products", "models");
const manifestPath = path.join(root, "data", "catalog-photo-manifest.json");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MODEL_EXTS = new Set([".3mf"]);
const IGNORE_FILENAMES = new Set(["install league of legends br.exe"]);

const NAME_ALIASES = new Map([
  ["porta joias", "caixa para joias"],
  ["porta joais", "caixa para joias"],
]);

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function canonicalizeLookupName(value) {
  const withoutMeta = normalizeText(value)
    .replace(/\b(oriignal|original|modelo)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+\d+$/, "")
    .trim();

  return NAME_ALIASES.get(withoutMeta) || withoutMeta;
}

function sortById(a, b) {
  const aMatch = a.id.match(/(\d+)$/);
  const bMatch = b.id.match(/(\d+)$/);
  const aNumber = aMatch ? Number(aMatch[1]) : Number.MAX_SAFE_INTEGER;
  const bNumber = bMatch ? Number(bMatch[1]) : Number.MAX_SAFE_INTEGER;
  return aNumber - bNumber || a.id.localeCompare(b.id);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeOptimizedWebp(inputPath, outputPath) {
  await sharp(inputPath, { failOn: "none" })
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86, effort: 5 })
    .toFile(outputPath);
}

function toPublicPath(absolutePath) {
  return `/${path.relative(path.join(root, "public"), absolutePath).replace(/\\/g, "/")}`;
}

function getMetadataValue(xmlBlock, key) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xmlBlock.match(new RegExp(`<metadata\\s+key="${escapedKey}"\\s+value="([^"]*)"\\s*/?>`, "i"));
  return match?.[1] || "";
}

async function writeBinaryAsset(outputPath, bytes) {
  await ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, Buffer.from(bytes));
  return toPublicPath(outputPath);
}

async function extractBambuPlatePreview(modelPath, productId) {
  const archive = unzipSync(new Uint8Array(await fs.readFile(modelPath)));
  const modelSettings = archive["Metadata/model_settings.config"];
  if (!modelSettings) return null;

  const plateDir = path.join(modelDir, "plates", productId);
  await fs.rm(plateDir, { recursive: true, force: true });
  await ensureDir(plateDir);

  const xml = strFromU8(modelSettings);
  const plateBlocks = [...xml.matchAll(/<plate>([\s\S]*?)<\/plate>/gi)].map((match) => match[1]);

  const previewFromMetadata = [];

  for (let index = 0; index < plateBlocks.length; index += 1) {
    const block = plateBlocks[index];
    const plateNumber = index + 1;
    const thumbnailFile = getMetadataValue(block, "thumbnail_file");
    const thumbnailNoLightFile = getMetadataValue(block, "thumbnail_no_light_file");
    const topFile = getMetadataValue(block, "top_file");
    const pickFile = getMetadataValue(block, "pick_file");

    const preview = thumbnailFile && archive[thumbnailFile]
      ? await writeBinaryAsset(path.join(plateDir, `plate-${plateNumber}.png`), archive[thumbnailFile])
      : "";
    const previewNoLight = thumbnailNoLightFile && archive[thumbnailNoLightFile]
      ? await writeBinaryAsset(path.join(plateDir, `plate-no-light-${plateNumber}.png`), archive[thumbnailNoLightFile])
      : "";
    const top = topFile && archive[topFile]
      ? await writeBinaryAsset(path.join(plateDir, `top-${plateNumber}.png`), archive[topFile])
      : "";
    const pick = pickFile && archive[pickFile]
      ? await writeBinaryAsset(path.join(plateDir, `pick-${plateNumber}.png`), archive[pickFile])
      : "";

    if (preview || previewNoLight || top || pick) {
      previewFromMetadata.push({
        index: plateNumber,
        preview: preview || previewNoLight || top || pick,
        ...(previewNoLight ? { previewNoLight } : {}),
        ...(top ? { top } : {}),
        ...(pick ? { pick } : {}),
      });
    }
  }

  if (previewFromMetadata.length) {
    return {
      source: "bambu-3mf",
      plateCount: previewFromMetadata.length,
      plates: previewFromMetadata,
    };
  }

  const fallbackPlates = Object.keys(archive)
    .filter((name) => /^Metadata\/plate_\d+\.png$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (!fallbackPlates.length) return null;

  const plates = [];
  for (let index = 0; index < fallbackPlates.length; index += 1) {
    const plateNumber = index + 1;
    const preview = await writeBinaryAsset(path.join(plateDir, `plate-${plateNumber}.png`), archive[fallbackPlates[index]]);
    const noLightName = `Metadata/plate_no_light_${plateNumber}.png`;
    const topName = `Metadata/top_${plateNumber}.png`;
    const pickName = `Metadata/pick_${plateNumber}.png`;
    const previewNoLight = archive[noLightName]
      ? await writeBinaryAsset(path.join(plateDir, `plate-no-light-${plateNumber}.png`), archive[noLightName])
      : "";
    const top = archive[topName] ? await writeBinaryAsset(path.join(plateDir, `top-${plateNumber}.png`), archive[topName]) : "";
    const pick = archive[pickName] ? await writeBinaryAsset(path.join(plateDir, `pick-${plateNumber}.png`), archive[pickName]) : "";

    plates.push({
      index: plateNumber,
      preview,
      ...(previewNoLight ? { previewNoLight } : {}),
      ...(top ? { top } : {}),
      ...(pick ? { pick } : {}),
    });
  }

  return {
    source: "bambu-3mf",
    plateCount: plates.length,
    plates,
  };
}

const catalogItems = Array.isArray(validationReport.validItems) ? validationReport.validItems : [];
const productNameMap = new Map();

for (const item of catalogItems) {
  productNameMap.set(canonicalizeLookupName(item.name), {
    id: item.id,
    name: item.name,
  });
}

for (const entry of manifest) {
  if (!productNameMap.has(canonicalizeLookupName(entry.name))) {
    productNameMap.set(canonicalizeLookupName(entry.name), {
      id: entry.id,
      name: entry.name,
    });
  }
}

const groupedFiles = new Map();
const sourceFiles = await fs.readdir(downloadDir, { withFileTypes: true });

for (const entry of sourceFiles) {
  if (!entry.isFile()) continue;
  const ext = path.extname(entry.name).toLowerCase();
  const lowerName = entry.name.toLowerCase();

  if (IGNORE_FILENAMES.has(lowerName)) continue;
  if (!IMAGE_EXTS.has(ext) && !MODEL_EXTS.has(ext)) continue;

  const absolutePath = path.join(downloadDir, entry.name);
  const baseName = path.parse(entry.name).name;
  const lookupName = canonicalizeLookupName(baseName);
  if (!lookupName) continue;

  const descriptor = {
    name: entry.name,
    baseName,
    absolutePath,
    ext,
    isOriginal: /\b(original|oriignal)\b/i.test(baseName),
    isModel: MODEL_EXTS.has(ext),
  };

  const bucket = groupedFiles.get(lookupName) || [];
  bucket.push(descriptor);
  groupedFiles.set(lookupName, bucket);
}

await ensureDir(catalogDir);
await ensureDir(galleryDir);
await ensureDir(modelDir);

const manifestMap = new Map(manifest.map((entry) => [entry.id, { ...entry }]));
const imported = [];
const unmatched = [];

for (const [lookupName, files] of groupedFiles.entries()) {
  const product = productNameMap.get(lookupName);

  if (!product) {
    unmatched.push({
      lookupName,
      files: files.map((file) => file.name),
    });
    continue;
  }

  const entry = manifestMap.get(product.id) || {
    id: product.id,
    name: product.name,
    sourceFilename: files[0]?.name || "",
    kind: "imagem-conceitual",
  };

  entry.name = product.name;

  const images = files
    .filter((file) => !file.isModel)
    .sort((a, b) => Number(a.isOriginal) - Number(b.isOriginal) || a.name.localeCompare(b.name));
  const models = files.filter((file) => file.isModel).sort((a, b) => a.name.localeCompare(b.name));

  if (images.length) {
    const productCatalogPath = path.join(catalogDir, `${product.id}.webp`);
    const productGalleryPath = path.join(galleryDir, product.id);
    await fs.rm(productGalleryPath, { recursive: true, force: true });
    await ensureDir(productGalleryPath);

    await writeOptimizedWebp(images[0].absolutePath, productCatalogPath);
    entry.sourceFilename = images[0].name;
    entry.gallery = [`/products/catalog/${product.id}.webp`];
    entry.kind = "foto-real";

    let extraIndex = 2;
    for (const image of images.slice(1)) {
      const outputPath = path.join(productGalleryPath, `${extraIndex}.webp`);
      await writeOptimizedWebp(image.absolutePath, outputPath);
      entry.gallery.push(`/products/gallery/${product.id}/${extraIndex}.webp`);
      extraIndex += 1;
    }
  }

  if (models.length) {
    const outputPath = path.join(modelDir, `${product.id}.3mf`);
    await fs.copyFile(models[0].absolutePath, outputPath);
    entry.model3mf = `/products/models/${product.id}.3mf`;
    entry.modelPreview = await extractBambuPlatePreview(models[0].absolutePath, product.id);
    if (!images.length && entry.kind !== "foto-real") {
      entry.kind = "render-fiel";
      entry.sourceFilename = entry.sourceFilename || models[0].name;
    }
  }

  manifestMap.set(product.id, entry);
  imported.push({
    id: product.id,
    name: product.name,
    imageCount: images.length,
    modelCount: models.length,
    gallery: entry.gallery || [],
    model3mf: entry.model3mf || null,
  });
}

const nextManifest = Array.from(manifestMap.values()).sort(sortById);
await fs.writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      importedCount: imported.length,
      unmatchedCount: unmatched.length,
      imported,
      unmatched,
    },
    null,
    2
  )
);
