#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const PROMPTS_PATH = path.join(ROOT, "prompts_txt", "full_product_image_prompts_v2.json");
const DEFAULT_INPUT_PATH = path.join(ROOT, "prompts_txt", "generated-image-urls.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function normalizeShotKey(key) {
  const value = String(key || "").trim().toLowerCase();
  if (value === "hero" || value === "01-hero") return "hero";
  if (value === "closeup" || value === "close-up" || value === "02-closeup") return "closeup";
  if (value === "in_use" || value === "in-use" || value === "inuse" || value === "03-in_use") return "in_use";
  if (value === "packshot" || value === "pack-shot" || value === "04-packshot") return "packshot";
  return "";
}

function normalizeManifest(input) {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];

  if (Array.isArray(input.items)) return input.items;

  return Object.entries(input).map(([produto_slug, urls]) => ({
    produto_slug,
    urls,
  }));
}

function bufferToJpeg(buffer) {
  return sharp(buffer).jpeg({ quality: 92, mozjpeg: true }).toBuffer();
}

async function downloadBuffer(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "User-Agent": "MDH-3D-Store/2.0 batch-image-downloader",
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao baixar ${url}: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function saveImage(url, destinationPath) {
  const buffer = await downloadBuffer(url);
  const jpegBuffer = await bufferToJpeg(buffer);
  ensureDir(path.dirname(destinationPath));
  fs.writeFileSync(destinationPath, jpegBuffer);
}

async function main() {
  if (!fs.existsSync(PROMPTS_PATH)) {
    throw new Error(`Manifesto de prompts não encontrado em ${PROMPTS_PATH}. Rode "npm run generate-prompts" primeiro.`);
  }

  const inputPath = process.argv[2] ? path.resolve(ROOT, process.argv[2]) : DEFAULT_INPUT_PATH;
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Manifesto de URLs não encontrado em ${inputPath}.`);
  }

  const promptsManifest = readJson(PROMPTS_PATH);
  const promptProducts = Array.isArray(promptsManifest.products) ? promptsManifest.products : [];
  const promptMap = new Map(promptProducts.map((product) => [product.produto_slug, product]));
  const entries = normalizeManifest(readJson(inputPath));

  let filesDownloaded = 0;
  let productsUpdated = 0;

  for (const entry of entries) {
    const product = promptMap.get(entry.produto_slug);
    if (!product) continue;

    const urls = entry.urls && typeof entry.urls === "object" ? entry.urls : entry;
    let productTouched = false;

    for (const [rawKey, url] of Object.entries(urls)) {
      const shotKey = normalizeShotKey(rawKey);
      if (!shotKey || !url || typeof url !== "string") continue;
      const publicPath = product.arquivos?.[shotKey];
      if (!publicPath) continue;
      await saveImage(url, path.join(ROOT, "public", publicPath.replace(/^\//, "")));
      filesDownloaded += 1;
      productTouched = true;
    }

    if (productTouched) {
      productsUpdated += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        inputPath: path.relative(ROOT, inputPath).replace(/\\/g, "/"),
        productsUpdated,
        filesDownloaded,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
