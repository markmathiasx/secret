#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultSourceUrl = "https://mdh-3d-store.vercel.app/api/catalog?scope=all";
const defaultManifestPath = path.join(root, "tmp", "sd", "catalog-regeneration-manifest.json");
const defaultSummaryPath = path.join(root, "tmp", "sd", "catalog-regeneration-summary.json");
const defaultImageMapPath = path.join(root, "tmp", "sd", "catalog-image-map.json");

function parseArgs(argv) {
  const args = {
    source: process.env.CATALOG_SOURCE_URL || defaultSourceUrl,
    manifest: defaultManifestPath,
    summary: defaultSummaryPath,
    imageMap: defaultImageMapPath,
    limit: null,
    category: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (token === "--source" && next) {
      args.source = next;
      index += 1;
      continue;
    }
    if (token === "--manifest" && next) {
      args.manifest = path.resolve(root, next);
      index += 1;
      continue;
    }
    if (token === "--summary" && next) {
      args.summary = path.resolve(root, next);
      index += 1;
      continue;
    }
    if (token === "--image-map" && next) {
      args.imageMap = path.resolve(root, next);
      index += 1;
      continue;
    }
    if (token === "--limit" && next) {
      args.limit = Number.parseInt(next, 10);
      index += 1;
      continue;
    }
    if (token === "--category" && next) {
      args.category = next.trim().toLowerCase();
      index += 1;
    }
  }

  return args;
}

function normalizePromptText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[.]+$/g, "")
    .trim();
}

function compactDescription(value) {
  const clean = normalizePromptText(value);
  if (!clean) return "";
  return clean
    .replace(/\bcom (produção local|acabamento|impressão|foco em apresentação premium)\b/gi, "")
    .replace(/\bpriorizando [^,.;]+/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 110)
    .trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isRegenerableProduct(item) {
  const image = String(item?.image || "");
  return image.startsWith("/catalog-assets/") || image.startsWith("/assets/images/products/");
}

function resolveLocalPath(imagePath) {
  return path.join(root, "public", imagePath.replace(/^\//, ""));
}

function getNormalizedCatalogAsset(item) {
  const numericId = String(item.id || "")
    .replace(/^mdh-0*/i, "")
    .replace(/^real-0*/i, "");
  return `/catalog-assets/mdh-${numericId}.webp`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getSceneByCategory(item) {
  const category = String(item.category || "").toLowerCase();
  const description = String(item.description || "").toLowerCase();
  const name = String(item.name || "").toLowerCase();

  if (category.includes("setup") || category.includes("utilidades")) {
    return {
      scene: "clean desk or countertop, functional studio setup",
      styling: "object fully visible",
      strength: 0.64,
    };
  }

  if (category.includes("casa") || description.includes("vaso") || name.includes("vaso")) {
    return {
      scene: "tasteful home decor backdrop, warm tabletop light",
      styling: "decor catalog photo",
      strength: 0.68,
    };
  }

  if (category.includes("presentes")) {
    return {
      scene: "gift tabletop, warm depth of field",
      styling: "gift catalog photo",
      strength: 0.7,
    };
  }

  return {
    scene: "collector shelf backdrop, cinematic light",
    styling: "premium figure photo",
    strength: 0.72,
  };
}

function buildPrompt(item) {
  const description = compactDescription(item.description);
  const { scene, styling } = getSceneByCategory(item);
  return normalizePromptText(
    `premium ecommerce photo of 3D printed ${item.name}, ${description}, ${scene}, ${styling}, true geometry, realistic PLA texture, centered product`,
  );
}

function buildNegativePrompt(item) {
  const category = String(item.category || "").toLowerCase();
  const extra = category.includes("setup") || category.includes("utilidades")
    ? "human hand, toothpaste brand, electronic screen text, cluttered background"
    : "human hand, face, packaging box, busy scene";

  return [
    "blurry",
    "low quality",
    "deformed geometry",
    "melted plastic",
    "duplicate object",
    "cropped product",
    "watermark",
    "unreadable text",
    extra,
  ].join(", ");
}

async function buildManifestItem(item, index) {
  const outputWebPath = item.image.startsWith("/catalog-assets/")
    ? item.image
    : getNormalizedCatalogAsset(item);
  const currentReference = resolveLocalPath(item.image);
  const normalizedReference = resolveLocalPath(outputWebPath);
  const reference = (await fileExists(currentReference)) ? currentReference : normalizedReference;
  const output = resolveLocalPath(outputWebPath);
  const categorySettings = getSceneByCategory(item);
  const basename = path.basename(reference);

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    image: item.image,
    output_web_path: outputWebPath,
    reference,
    prompt: buildPrompt(item),
    negative_prompt: buildNegativePrompt(item),
    output,
    width: 1024,
    height: 1024,
    seed: 3200 + index,
    steps: 4,
    guidance: 0.0,
    strength: categorySettings.strength,
    note: `catalog-regeneration:${slugify(item.category)}:${basename}`,
  };
}

async function fetchCatalog(source) {
  const response = await fetch(source, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Failed to fetch catalog from ${source}: ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data?.items)) {
    throw new Error(`Unexpected catalog payload from ${source}`);
  }
  return data.items;
}

async function ensureFiles(items) {
  const missing = [];
  for (const item of items) {
    const currentReference = resolveLocalPath(item.image);
    const normalizedReference = resolveLocalPath(getNormalizedCatalogAsset(item));
    const exists = (await fileExists(currentReference)) || (await fileExists(normalizedReference));
    if (!exists) {
      missing.push({ id: item.id, image: item.image });
    }
  }
  return missing;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const items = await fetchCatalog(args.source);

  let filtered = items.filter(isRegenerableProduct);
  if (args.category) {
    filtered = filtered.filter((item) => String(item.category || "").toLowerCase() === args.category);
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    filtered = filtered.slice(0, args.limit);
  }

  const missingReferences = await ensureFiles(filtered);
  if (missingReferences.length > 0) {
    throw new Error(`Missing local references for ${missingReferences.length} items: ${JSON.stringify(missingReferences.slice(0, 8))}`);
  }

  const manifest = [];
  for (const [index, item] of filtered.entries()) {
    manifest.push(await buildManifestItem(item, index));
  }

  const imageMap = Object.fromEntries(
    manifest
      .filter((item) => item.image !== item.output_web_path)
      .map((item) => [item.id, item.output_web_path]),
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    source: args.source,
    totalCatalogItems: items.length,
    regenerableItems: manifest.length,
    remappedItems: Object.keys(imageMap).length,
    categories: [...new Set(manifest.map((item) => item.category))],
    firstOutputs: manifest.slice(0, 10).map((item) => ({ id: item.id, name: item.name, output: item.output })),
  };

  await fs.mkdir(path.dirname(args.manifest), { recursive: true });
  await fs.mkdir(path.dirname(args.summary), { recursive: true });
  await fs.mkdir(path.dirname(args.imageMap), { recursive: true });
  await fs.writeFile(args.manifest, JSON.stringify(manifest, null, 2), "utf8");
  await fs.writeFile(args.summary, JSON.stringify(summary, null, 2), "utf8");
  await fs.writeFile(args.imageMap, JSON.stringify(imageMap, null, 2), "utf8");

  console.log(`Manifest saved: ${args.manifest}`);
  console.log(`Summary saved: ${args.summary}`);
  console.log(`Image map saved: ${args.imageMap}`);
  console.log(`Items ready for regeneration: ${manifest.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
