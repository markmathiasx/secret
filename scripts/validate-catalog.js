#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const PROMPTS_PATH = path.join(ROOT, "prompts_txt", "full_product_image_prompts_v2.json");
const PRODUCT_IMAGE_MAP_PATH = path.join(ROOT, "product-image-map.json");
const PLANNED_PRODUCT_IMAGE_MAP_PATH = path.join(ROOT, "planned-product-image-map.json");
const GALLERY_MAP_PATH = path.join(ROOT, "data", "product-gallery-map.json");
const SNAPSHOT_PATH = path.join(ROOT, "data", "local-catalog-image-snapshot.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo obrigatório não encontrado: ${filePath}`);
  }
}

function main() {
  [PROMPTS_PATH, PRODUCT_IMAGE_MAP_PATH, PLANNED_PRODUCT_IMAGE_MAP_PATH, GALLERY_MAP_PATH, SNAPSHOT_PATH].forEach(ensureExists);

  const prompts = readJson(PROMPTS_PATH);
  const runtimeMap = readJson(PRODUCT_IMAGE_MAP_PATH);
  const plannedMap = readJson(PLANNED_PRODUCT_IMAGE_MAP_PATH);
  const galleryMap = readJson(GALLERY_MAP_PATH);

  const products = Array.isArray(prompts.products) ? prompts.products : [];
  if (!products.length) {
    throw new Error("Nenhum produto encontrado em full_product_image_prompts_v2.json");
  }

  for (const product of products) {
    const files = product.arquivos || {};
    const requiredShots = ["hero", "closeup", "in_use", "packshot"];

    for (const shot of requiredShots) {
      if (!product.prompts?.[shot]) {
        throw new Error(`Prompt ausente para ${product.produto_slug} -> ${shot}`);
      }
      const publicPath = files[shot];
      if (!publicPath) {
        throw new Error(`Caminho ausente para ${product.produto_slug} -> ${shot}`);
      }
      const absolute = path.join(ROOT, "public", publicPath.replace(/^\//, ""));
      if (!fs.existsSync(absolute)) {
        throw new Error(`Arquivo de imagem ausente: ${absolute}`);
      }
    }

    if (!runtimeMap[product.produto_id]) {
      throw new Error(`product-image-map.json sem item ${product.produto_id}`);
    }
    if (!plannedMap[product.produto_id]) {
      throw new Error(`planned-product-image-map.json sem item ${product.produto_id}`);
    }
    if (!Array.isArray(galleryMap[product.produto_id]) || !galleryMap[product.produto_id].length) {
      throw new Error(`product-gallery-map.json sem galeria para ${product.produto_id}`);
    }
  }

  const refreshSnapshot = spawnSync(process.execPath, ["--import", "tsx", "scripts/refresh-local-catalog-snapshot.ts"], {
    cwd: ROOT,
    env: process.env,
    stdio: "inherit",
  });

  if (refreshSnapshot.status !== 0) {
    process.exit(refreshSnapshot.status || 1);
  }

  const validation = spawnSync(process.execPath, ["scripts/validate-catalog-images.js"], {
    cwd: ROOT,
    env: {
      ...process.env,
      CATALOG_SOURCE_FILE: path.relative(ROOT, SNAPSHOT_PATH),
    },
    stdio: "inherit",
  });

  if (validation.status !== 0) {
    process.exit(validation.status || 1);
  }

  console.log(
    JSON.stringify(
      {
        productsValidated: products.length,
        runtimeMapEntries: Object.keys(runtimeMap).length,
        plannedMapEntries: Object.keys(plannedMap).length,
        galleryEntries: Object.keys(galleryMap).length,
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
