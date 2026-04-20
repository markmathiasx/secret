/**
 * generate-variant-images.mjs
 * 
 * Generates 3 variant images for all A1 Mini products from their cover.webp,
 * then updates product-gallery-map.json to include ALL 748 products with 4 images.
 */
import fs from "node:fs/promises";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const A1_DIR = path.join(ROOT, "public", "products", "a1-mini-expansion");
const GALLERY_MAP_PATH = path.join(ROOT, "data", "product-gallery-map.json");
const A1_DATA_PATH = path.join(ROOT, "data", "a1-mini-expansion-500.json");

// Variant generation configs
const VARIANTS = [
  {
    suffix: "02-closeup",
    transform: async (sharpInstance, meta) => {
      // Closeup: center crop to 70% of original
      const cropW = Math.round(meta.width * 0.7);
      const cropH = Math.round(meta.height * 0.7);
      const left = Math.round((meta.width - cropW) / 2);
      const top = Math.round((meta.height - cropH) / 2);
      return sharpInstance
        .extract({ left, top, width: cropW, height: cropH })
        .resize(meta.width, meta.height, { fit: "cover" })
        .sharpen({ sigma: 1.2 })
        .webp({ quality: 82 });
    },
  },
  {
    suffix: "03-angle",
    transform: async (sharpInstance, meta) => {
      // Side angle: slight rotate + crop to simulate angle view
      return sharpInstance
        .rotate(3, { background: { r: 13, g: 17, b: 25, alpha: 1 } })
        .resize(meta.width, meta.height, { fit: "cover" })
        .modulate({ brightness: 1.05, saturation: 1.1 })
        .webp({ quality: 82 });
    },
  },
  {
    suffix: "04-alt-color",
    transform: async (sharpInstance, meta) => {
      // Color variant: tint/hue shift to simulate different material color
      return sharpInstance
        .flop() // horizontal mirror
        .modulate({ hue: 30, saturation: 1.15, lightness: 2 })
        .webp({ quality: 82 });
    },
  },
];

async function generateVariantsForProduct(productDir, productId) {
  const coverPath = path.join(productDir, "cover.webp");
  
  if (!existsSync(coverPath)) {
    return null;
  }

  const buffer = await fs.readFile(coverPath);
  const meta = await sharp(buffer).metadata();
  const width = meta.width || 600;
  const height = meta.height || 600;
  
  const images = [`/products/a1-mini-expansion/${productId}/cover.webp`];

  for (const variant of VARIANTS) {
    const outName = `${variant.suffix}.webp`;
    const outPath = path.join(productDir, outName);

    // Skip if already generated
    if (existsSync(outPath)) {
      images.push(`/products/a1-mini-expansion/${productId}/${outName}`);
      continue;
    }

    try {
      const instance = sharp(buffer);
      const result = await variant.transform(instance, { width, height });
      await result.toFile(outPath);
      images.push(`/products/a1-mini-expansion/${productId}/${outName}`);
    } catch (err) {
      console.error(`  ⚠ Failed variant ${variant.suffix} for ${productId}: ${err.message}`);
      // Still add path — will fallback to cover
      images.push(`/products/a1-mini-expansion/${productId}/cover.webp`);
    }
  }

  return images;
}

async function main() {
  console.log("🖼  Generating variant images for A1 Mini catalog...\n");

  // Load existing gallery map
  let galleryMap = {};
  try {
    galleryMap = JSON.parse(readFileSync(GALLERY_MAP_PATH, "utf8"));
  } catch {
    console.log("  Gallery map not found, creating fresh.");
  }

  // Load A1 Mini data
  let a1Data = [];
  try {
    a1Data = JSON.parse(readFileSync(A1_DATA_PATH, "utf8"));
  } catch (err) {
    console.error("  Failed to load A1 Mini data:", err.message);
    process.exit(1);
  }

  console.log(`  Found ${a1Data.length} A1 Mini products`);
  console.log(`  Existing gallery map entries: ${Object.keys(galleryMap).length}\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  // Process A1 Mini products in batches of 20
  const BATCH_SIZE = 20;
  for (let i = 0; i < a1Data.length; i += BATCH_SIZE) {
    const batch = a1Data.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.all(
      batch.map(async (product) => {
        const productId = product.id;
        const productDir = path.join(A1_DIR, productId);

        if (!existsSync(productDir)) {
          failed++;
          return { id: productId, images: null };
        }

        // Check if variants already exist
        const hasVariants = existsSync(path.join(productDir, "02-closeup.webp"));
        if (hasVariants && galleryMap[productId]?.length >= 4) {
          skipped++;
          return { id: productId, images: galleryMap[productId] };
        }

        const images = await generateVariantsForProduct(productDir, productId);
        if (images) {
          generated++;
          return { id: productId, images };
        }
        
        failed++;
        return { id: productId, images: null };
      })
    );

    // Update gallery map and A1 data
    for (const result of results) {
      if (result.images) {
        galleryMap[result.id] = result.images;
        
        // Update the A1 data entry
        const dataEntry = a1Data.find(p => p.id === result.id);
        if (dataEntry) {
          dataEntry.images = result.images;
          dataEntry.image = result.images[0];
        }
      }
    }

    const progress = Math.min(i + BATCH_SIZE, a1Data.length);
    process.stdout.write(`\r  Progress: ${progress}/${a1Data.length} (generated: ${generated}, skipped: ${skipped}, failed: ${failed})`);
  }

  console.log("\n");

  // Save updated gallery map
  const sortedMap = {};
  for (const key of Object.keys(galleryMap).sort()) {
    sortedMap[key] = galleryMap[key];
  }

  writeFileSync(GALLERY_MAP_PATH, JSON.stringify(sortedMap, null, 2) + "\n", "utf8");
  console.log(`  ✅ Gallery map saved: ${Object.keys(sortedMap).length} entries`);

  // Save updated A1 Mini data
  writeFileSync(A1_DATA_PATH, JSON.stringify(a1Data, null, 2) + "\n", "utf8");
  console.log(`  ✅ A1 Mini data saved: ${a1Data.length} entries`);

  console.log(`\n  Summary:`);
  console.log(`    Generated: ${generated}`);
  console.log(`    Skipped (already done): ${skipped}`);
  console.log(`    Failed: ${failed}`);
  console.log(`    Total gallery entries: ${Object.keys(sortedMap).length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
