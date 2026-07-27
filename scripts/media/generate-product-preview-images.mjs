#!/usr/bin/env node
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createProjectRequire } from "../catalog/ts-runtime.mjs";

const root = process.cwd();
const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { getProductImageCandidates } = require("@/lib/product-images");
const sharp = (await import("sharp")).default;

const PRODUCT_PREFIX = "/products/";
const PREVIEW_PREFIX = "/products/_preview/";
const IMAGE_EXTENSION = /\.(?:avif|jpe?g|png|webp)$/i;
const PREVIEW_SIZE_PX = 560;
const PREVIEW_WEBP_QUALITY = 70;
const reportPath = path.join(root, "output", "product-preview-images-report.json");

function toPreviewPath(publicPath) {
  if (!publicPath.startsWith(PRODUCT_PREFIX) || publicPath.startsWith(PREVIEW_PREFIX)) return null;
  if (!IMAGE_EXTENSION.test(publicPath)) return null;
  return `${PREVIEW_PREFIX}${publicPath.slice(PRODUCT_PREFIX.length).replace(IMAGE_EXTENSION, ".webp")}`;
}

function toDiskPath(publicPath) {
  return path.join(root, "public", ...publicPath.replace(/^\/+/, "").split("/"));
}

async function writePreview(source, target) {
  mkdirSync(path.dirname(target), { recursive: true });
  await sharp(source, { failOn: "none" })
    .rotate()
    .resize(PREVIEW_SIZE_PX, PREVIEW_SIZE_PX, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: PREVIEW_WEBP_QUALITY, effort: 4 })
    .toFile(target);
}

const publicProducts = catalog.filter((product) => product.pricePix > 0 && product.status !== "Inativo");
const sources = Array.from(
  new Set(publicProducts.flatMap((product) => getProductImageCandidates(product)).filter((src) => src.startsWith(PRODUCT_PREFIX)))
).sort();

const generated = [];
const missing = [];
const skipped = [];

for (const sourcePublicPath of sources) {
  const previewPublicPath = toPreviewPath(sourcePublicPath);
  if (!previewPublicPath) {
    skipped.push({ source: sourcePublicPath, reason: "unsupported" });
    continue;
  }

  const sourcePath = toDiskPath(sourcePublicPath);
  if (!existsSync(sourcePath)) {
    missing.push(sourcePublicPath);
    continue;
  }

  const targetPath = toDiskPath(previewPublicPath);
  await writePreview(sourcePath, targetPath);
  generated.push({
    source: sourcePublicPath,
    preview: previewPublicPath,
    bytes: statSync(targetPath).size,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  publicProducts: publicProducts.length,
  sourceCount: sources.length,
  generatedCount: generated.length,
  missing,
  skipped,
  generated,
  ok: missing.length === 0,
};

mkdirSync(path.dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ ok: report.ok, publicProducts: report.publicProducts, generated: report.generatedCount, missing: missing.length }, null, 2));
if (!report.ok) process.exitCode = 1;
