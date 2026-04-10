#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = process.cwd();
const PROMPTS_PATH = path.join(ROOT, "prompts_txt", "full_product_image_prompts_v2.json");
const PROMPTS_BY_SLUG_DIR = path.join(ROOT, "prompts_txt", "by_slug");

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writePromptTextFiles(products) {
  fs.mkdirSync(PROMPTS_BY_SLUG_DIR, { recursive: true });

  for (const product of products) {
    const targetPath = path.join(PROMPTS_BY_SLUG_DIR, `${product.produto_slug}.txt`);
    const content = [
      `Produto: ${product.titulo}`,
      `ID: ${product.produto_id}`,
      `Slug: ${product.produto_slug}`,
      "",
      "[hero]",
      product.prompts.hero,
      "",
      "[closeup]",
      product.prompts.closeup,
      "",
      "[in_use]",
      product.prompts.in_use,
      "",
      "[packshot]",
      product.prompts.packshot,
      "",
    ].join("\n");
    fs.writeFileSync(targetPath, content, "utf8");
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const skipGenerate = args.has("--skip-generate");
  const downloadIndex = process.argv.findIndex((value) => value === "--download");
  const downloadManifest = downloadIndex >= 0 ? process.argv[downloadIndex + 1] : "";

  if (!skipGenerate || !fs.existsSync(PROMPTS_PATH)) {
    runCommand("npm", ["run", "generate-prompts"]);
  }

  if (!fs.existsSync(PROMPTS_PATH)) {
    throw new Error(`Manifesto de prompts não encontrado em ${PROMPTS_PATH}`);
  }

  const prompts = readJson(PROMPTS_PATH);
  const products = Array.isArray(prompts.products) ? prompts.products : [];
  writePromptTextFiles(products);

  if (downloadManifest) {
    runCommand("node", ["scripts/batch-image-downloader.js", downloadManifest]);
  }

  console.log(
    JSON.stringify(
      {
        productsLoaded: products.length,
        promptManifest: path.relative(ROOT, PROMPTS_PATH).replace(/\\/g, "/"),
        bySlugDirectory: path.relative(ROOT, PROMPTS_BY_SLUG_DIR).replace(/\\/g, "/"),
        downloadTriggered: Boolean(downloadManifest),
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
