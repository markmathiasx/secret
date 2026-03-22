import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { strFromU8, unzipSync } from "fflate";
import { XMLParser } from "fast-xml-parser";
import { Matrix4, Vector3 } from "three";
import manifest from "../data/catalog-photo-manifest.json" with { type: "json" };
import validationReport from "../CATALOG_VALIDATION_REPORT.json" with { type: "json" };

const root = process.cwd();
const downloadDir = path.join(process.env.USERPROFILE || "C:\\Users\\markm", "Downloads", "geek");
const catalogDir = path.join(root, "public", "products", "catalog");
const galleryDir = path.join(root, "public", "products", "gallery");
const modelDir = path.join(root, "public", "products", "models");
const manifestPath = path.join(root, "data", "catalog-photo-manifest.json");
const modelSceneDir = path.join(modelDir, "scenes");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MODEL_EXTS = new Set([".3mf"]);
const IGNORE_FILENAMES = new Set(["install league of legends br.exe"]);
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: true,
  isArray: (name) =>
    [
      "vertex",
      "triangle",
      "component",
      "item",
      "object",
      "part",
      "plate",
      "model_instance",
      "assemble_item",
      "filament",
      "warning",
      "metadata",
      "header_item",
    ].includes(name),
});

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

function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function parseXmlDocument(bytes) {
  return xmlParser.parse(strFromU8(bytes));
}

function metadataArrayToMap(metadata) {
  return new Map(
    ensureArray(metadata).map((item) => [
      String(item.key),
      typeof item.value === "number" ? item.value : typeof item.value === "boolean" ? item.value : String(item.value ?? ""),
    ])
  );
}

function roundValue(value, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function parseTransformMatrix(transform) {
  const values = String(transform || "1 0 0 0 1 0 0 0 1 0 0 0")
    .trim()
    .split(/\s+/)
    .map(Number)
    .filter((value) => Number.isFinite(value));

  if (values.length === 12) {
    const [m00, m01, m02, m10, m11, m12, m20, m21, m22, tx, ty, tz] = values;
    return new Matrix4().set(
      m00, m01, m02, tx,
      m10, m11, m12, ty,
      m20, m21, m22, tz,
      0, 0, 0, 1
    );
  }

  if (values.length === 16) {
    return new Matrix4().set(...values);
  }

  return new Matrix4();
}

function parsePrintableArea(projectSettings) {
  const points = ensureArray(projectSettings?.printable_area)
    .map((point) => String(point))
    .map((point) => point.split("x").map(Number))
    .filter((pair) => pair.length === 2 && pair.every((value) => Number.isFinite(value)));

  if (!points.length) {
    return {
      width: 256,
      depth: 256,
      height: Number(projectSettings?.printable_height) || 256,
    };
  }

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);

  return {
    width: Math.max(...xs) - Math.min(...xs),
    depth: Math.max(...ys) - Math.min(...ys),
    height: Number(projectSettings?.printable_height) || 256,
  };
}

function extractSliceMetrics(sliceInfoText) {
  if (!sliceInfoText?.trim()) return new Map();

  const parsed = parseXmlDocument(Buffer.from(sliceInfoText));
  const plates = ensureArray(parsed?.config?.plate);
  const plateMetrics = new Map();

  for (const plate of plates) {
    const metadata = metadataArrayToMap(plate.metadata);
    const filament = ensureArray(plate.filament)[0] || {};
    const index = Number(metadata.get("index"));
    if (!Number.isFinite(index)) continue;

    plateMetrics.set(index, {
      predictionSeconds: Number(metadata.get("prediction")) || undefined,
      weightGrams: Number(metadata.get("weight")) || undefined,
      filamentMeters: Number(filament.used_m) || undefined,
      filamentType: filament.type ? String(filament.type) : undefined,
      filamentColor: filament.color ? String(filament.color) : undefined,
    });
  }

  return plateMetrics;
}

function applyMatrixToGeometry(mesh, matrix) {
  const positions = [];
  const indices = [];
  const vertices = ensureArray(mesh?.vertices?.vertex);
  const triangles = ensureArray(mesh?.triangles?.triangle);

  for (const vertex of vertices) {
    const point = new Vector3(Number(vertex.x) || 0, Number(vertex.y) || 0, Number(vertex.z) || 0).applyMatrix4(matrix);
    positions.push(roundValue(point.x), roundValue(point.y), roundValue(point.z));
  }

  for (const triangle of triangles) {
    indices.push(Number(triangle.v1) || 0, Number(triangle.v2) || 0, Number(triangle.v3) || 0);
  }

  return {
    positions,
    indices,
  };
}

function buildPositionBounds(meshes) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const mesh of meshes) {
    const { positions } = mesh;
    for (let index = 0; index < positions.length; index += 3) {
      const x = positions[index];
      const y = positions[index + 1];
      const z = positions[index + 2];
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (z < minZ) minZ = z;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (z > maxZ) maxZ = z;
    }
  }

  return {
    minX,
    minY,
    minZ,
    maxX,
    maxY,
    maxZ,
  };
}

function shiftMeshes(meshes, offsetX, offsetY, offsetZ = 0) {
  for (const mesh of meshes) {
    for (let index = 0; index < mesh.positions.length; index += 3) {
      mesh.positions[index] = roundValue(mesh.positions[index] + offsetX);
      mesh.positions[index + 1] = roundValue(mesh.positions[index + 1] + offsetY);
      mesh.positions[index + 2] = roundValue(mesh.positions[index + 2] + offsetZ);
    }
  }
}

function plateNeedsBedCenterOffset(bounds, printableArea) {
  if (!Number.isFinite(bounds.minX)) return false;
  const halfWidth = printableArea.width / 2;
  const halfDepth = printableArea.depth / 2;
  return (
    bounds.maxX > halfWidth ||
    bounds.minX < -halfWidth ||
    bounds.maxY > halfDepth ||
    bounds.minY < -halfDepth
  );
}

function getObjectMap(modelDocument) {
  return new Map(ensureArray(modelDocument?.model?.resources?.object).map((object) => [Number(object.id), object]));
}

function collectMeshesForObject({
  fileKey,
  objectId,
  archive,
  parsedFileCache,
  matrix,
  targetMeshes,
}) {
  const cacheKey = fileKey.replace(/^\//, "");
  let modelDocument = parsedFileCache.get(cacheKey);

  if (!modelDocument) {
    const bytes = archive[cacheKey];
    if (!bytes) return;
    modelDocument = parseXmlDocument(bytes);
    parsedFileCache.set(cacheKey, modelDocument);
  }

  const objectMap = getObjectMap(modelDocument);
  const objectNode = objectMap.get(Number(objectId));
  if (!objectNode) return;

  if (objectNode.mesh) {
    targetMeshes.push(applyMatrixToGeometry(objectNode.mesh, matrix));
  }

  for (const component of ensureArray(objectNode?.components?.component)) {
    const targetFile = String(component["p:path"] || cacheKey).replace(/^\//, "");
    const nextObjectId = Number(component.objectid);
    const componentMatrix = parseTransformMatrix(component.transform);
    const nextMatrix = matrix.clone().multiply(componentMatrix);
    collectMeshesForObject({
      fileKey: targetFile,
      objectId: nextObjectId,
      archive,
      parsedFileCache,
      matrix: nextMatrix,
      targetMeshes,
    });
  }
}

async function extractBambuSceneData(modelPath, productId) {
  const archive = unzipSync(new Uint8Array(await fs.readFile(modelPath)));
  const rootModel = parseXmlDocument(archive["3D/3dmodel.model"]);
  const modelSettingsDocument = parseXmlDocument(archive["Metadata/model_settings.config"]);
  const projectSettings = archive["Metadata/project_settings.config"]
    ? JSON.parse(strFromU8(archive["Metadata/project_settings.config"]))
    : {};
  const sliceMetrics = archive["Metadata/slice_info.config"]
    ? extractSliceMetrics(strFromU8(archive["Metadata/slice_info.config"]))
    : new Map();
  const printableArea = parsePrintableArea(projectSettings);
  const rootObjectMap = getObjectMap(rootModel);
  const assembleItems = new Map(
    ensureArray(modelSettingsDocument?.config?.assemble?.assemble_item).map((item) => [
      `${Number(item.object_id)}:${Number(item.instance_id) || 0}`,
      parseTransformMatrix(item.transform),
    ])
  );
  const parsedFileCache = new Map([["3D/3dmodel.model", rootModel]]);

  const plates = ensureArray(modelSettingsDocument?.config?.plate).map((plate) => {
    const metadata = metadataArrayToMap(plate.metadata);
    const index = Number(metadata.get("plater_id")) || Number(metadata.get("index")) || 1;
    const name = String(metadata.get("plater_name") || "");
    const modelInstances = ensureArray(plate.model_instance).map((instance) => metadataArrayToMap(instance.metadata));
    const meshes = [];

    for (const instanceMetadata of modelInstances) {
      const objectId = Number(instanceMetadata.get("object_id"));
      const instanceId = Number(instanceMetadata.get("instance_id")) || 0;
      const rootObject = rootObjectMap.get(objectId);
      if (!rootObject) continue;

      const instanceMatrix = assembleItems.get(`${objectId}:${instanceId}`) || new Matrix4();
      collectMeshesForObject({
        fileKey: "3D/3dmodel.model",
        objectId,
        archive,
        parsedFileCache,
        matrix: instanceMatrix,
        targetMeshes: meshes,
      });
    }

    const bounds = buildPositionBounds(meshes);
    if (plateNeedsBedCenterOffset(bounds, printableArea)) {
      shiftMeshes(meshes, -printableArea.width / 2, -printableArea.depth / 2, 0);
    }

    const metrics = sliceMetrics.get(index) || {};

    return {
      index,
      name,
      metrics,
      meshes,
    };
  });

  const outputPath = path.join(modelSceneDir, `${productId}.json`);
  await ensureDir(modelSceneDir);
  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        source: "bambu-3mf",
        printerModel: String(projectSettings?.printer_model || ""),
        printableArea,
        plates,
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    sceneUrl: toPublicPath(outputPath),
    printerModel: String(projectSettings?.printer_model || ""),
    printableArea,
    metricsByPlate: sliceMetrics,
    plates,
  };
}

async function extractBambuPlatePreview(modelPath, productId, sceneData = null) {
  const archive = unzipSync(new Uint8Array(await fs.readFile(modelPath)));
  const modelSettings = archive["Metadata/model_settings.config"];
  if (!modelSettings) return null;

  const plateDir = path.join(modelDir, "plates", productId);
  await fs.rm(plateDir, { recursive: true, force: true });
  await ensureDir(plateDir);

  const xml = strFromU8(modelSettings);
  const plateBlocks = [...xml.matchAll(/<plate>([\s\S]*?)<\/plate>/gi)].map((match) => match[1]);

  const previewFromMetadata = [];
  const metricsByPlate = sceneData?.metricsByPlate || new Map();
  const scenePlatesByIndex = new Map((sceneData?.plates || []).map((plate) => [plate.index, plate]));

  for (let index = 0; index < plateBlocks.length; index += 1) {
    const block = plateBlocks[index];
    const plateNumber = index + 1;
    const platerName = getMetadataValue(block, "plater_name");
    const thumbnailFile = getMetadataValue(block, "thumbnail_file");
    const thumbnailNoLightFile = getMetadataValue(block, "thumbnail_no_light_file");
    const topFile = getMetadataValue(block, "top_file");
    const pickFile = getMetadataValue(block, "pick_file");
    const metrics = metricsByPlate.get(plateNumber) || scenePlatesByIndex.get(plateNumber)?.metrics || {};

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
        ...(platerName ? { name: platerName } : {}),
        preview: preview || previewNoLight || top || pick,
        ...(previewNoLight ? { previewNoLight } : {}),
        ...(top ? { top } : {}),
        ...(pick ? { pick } : {}),
        ...(Number.isFinite(metrics?.predictionSeconds) ? { predictionSeconds: metrics.predictionSeconds } : {}),
        ...(Number.isFinite(metrics?.weightGrams) ? { weightGrams: metrics.weightGrams } : {}),
        ...(Number.isFinite(metrics?.filamentMeters) ? { filamentMeters: metrics.filamentMeters } : {}),
        ...(metrics?.filamentType ? { filamentType: metrics.filamentType } : {}),
        ...(metrics?.filamentColor ? { filamentColor: metrics.filamentColor } : {}),
      });
    }
  }

  if (previewFromMetadata.length) {
    return {
      source: "bambu-3mf",
      ...(sceneData?.printerModel ? { printerModel: sceneData.printerModel } : {}),
      ...(sceneData?.printableArea ? { printableArea: sceneData.printableArea } : {}),
      plateCount: previewFromMetadata.length,
      plates: previewFromMetadata,
      ...(sceneData?.sceneUrl ? { sceneUrl: sceneData.sceneUrl } : {}),
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

    const metrics = metricsByPlate.get(plateNumber) || scenePlatesByIndex.get(plateNumber)?.metrics || {};

    plates.push({
      index: plateNumber,
      preview,
      ...(previewNoLight ? { previewNoLight } : {}),
      ...(top ? { top } : {}),
      ...(pick ? { pick } : {}),
      ...(Number.isFinite(metrics?.predictionSeconds) ? { predictionSeconds: metrics.predictionSeconds } : {}),
      ...(Number.isFinite(metrics?.weightGrams) ? { weightGrams: metrics.weightGrams } : {}),
      ...(Number.isFinite(metrics?.filamentMeters) ? { filamentMeters: metrics.filamentMeters } : {}),
      ...(metrics?.filamentType ? { filamentType: metrics.filamentType } : {}),
      ...(metrics?.filamentColor ? { filamentColor: metrics.filamentColor } : {}),
    });
  }

  return {
    source: "bambu-3mf",
    ...(sceneData?.printerModel ? { printerModel: sceneData.printerModel } : {}),
    ...(sceneData?.printableArea ? { printableArea: sceneData.printableArea } : {}),
    plateCount: plates.length,
    plates,
    ...(sceneData?.sceneUrl ? { sceneUrl: sceneData.sceneUrl } : {}),
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
    const sceneData = await extractBambuSceneData(models[0].absolutePath, product.id);
    entry.modelPreview = await extractBambuPlatePreview(models[0].absolutePath, product.id, sceneData);
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
