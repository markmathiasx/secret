/**
 * Generate 2 variant images per csv-curated product.
 * Each csv product has 1 cover.webp in /public/products/csv-curated/{sku}/
 * This script generates 2.webp and 3.webp variants and updates csv-curated-media-map.json
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CSV_CURATED_DIR = path.join(PUBLIC, "products", "csv-curated");
const MEDIA_MAP_PATH = path.join(ROOT, "data", "csv-curated-media-map.json");

const mediaMap = JSON.parse(fs.readFileSync(MEDIA_MAP_PATH, "utf-8"));

async function generateVariant(sourceFile, outFile, variant) {
  if (fs.existsSync(outFile)) return;

  const metadata = await sharp(sourceFile).metadata();
  const w = metadata.width || 512;
  const h = metadata.height || 512;

  if (variant === 2) {
    // Closeup: center crop 70%
    const cropSize = Math.round(Math.min(w, h) * 0.7);
    const cropLeft = Math.round((w - cropSize) / 2);
    const cropTop = Math.round((h - cropSize) / 2);

    await sharp(sourceFile)
      .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
      .resize(w, h, { fit: "cover" })
      .modulate({ brightness: 1.05, saturation: 1.1 })
      .webp({ quality: 82 })
      .toFile(outFile);
  } else {
    // Angle: slight rotation + color shift
    await sharp(sourceFile)
      .rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(w, h, { fit: "cover" })
      .modulate({ brightness: 0.92, saturation: 1.15, hue: 5 })
      .webp({ quality: 82 })
      .toFile(outFile);
  }
}

async function main() {
  const dirs = fs.readdirSync(CSV_CURATED_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  console.log(`📦 Processing ${dirs.length} csv-curated products...\n`);

  let generated = 0;
  let updated = 0;

  for (const dir of dirs) {
    const sku = dir.name;
    const dirPath = path.join(CSV_CURATED_DIR, sku);
    const coverPath = path.join(dirPath, "cover.webp");

    if (!fs.existsSync(coverPath)) {
      console.warn(`  ⚠ No cover.webp for ${sku}`);
      continue;
    }

    const out2 = path.join(dirPath, "2.webp");
    const out3 = path.join(dirPath, "3.webp");

    const needed2 = !fs.existsSync(out2);
    const needed3 = !fs.existsSync(out3);

    if (needed2) {
      await generateVariant(coverPath, out2, 2);
      generated++;
    }
    if (needed3) {
      await generateVariant(coverPath, out3, 3);
      generated++;
    }

    // Update media map
    const basePath = `/products/csv-curated/${sku}`;
    const newImages = [
      `${basePath}/cover.webp`,
      `${basePath}/2.webp`,
      `${basePath}/3.webp`,
    ];

    if (!mediaMap[sku] || mediaMap[sku].length < 3) {
      mediaMap[sku] = newImages;
      updated++;
    }

    process.stdout.write(`  ${sku}: done\r`);
  }

  // Write updated media map
  fs.writeFileSync(MEDIA_MAP_PATH, JSON.stringify(mediaMap, null, 2) + "\n");

  console.log(`\n\n📊 Results:`);
  console.log(`   Directories processed: ${dirs.length}`);
  console.log(`   Variant images generated: ${generated}`);
  console.log(`   Media map entries updated: ${updated}`);

  // Verify
  const allHave3 = Object.values(mediaMap).every(v => Array.isArray(v) && v.length >= 3);
  console.log(`   All entries have 3+ images: ${allHave3}`);
}

main().catch(console.error);
