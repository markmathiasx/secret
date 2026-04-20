/**
 * Complete gallery fix:
 * 1. Add missing mdh products to catalog-photo-manifest.json
 * 2. Generate variant images for all mdh products missing gallery images
 * 3. Update images[] arrays in catalog.ts for ALL mdh products to have 3 images
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const MANIFEST_PATH = path.join(ROOT, "data", "catalog-photo-manifest.json");
const CATALOG_PATH = path.join(ROOT, "lib", "catalog.ts");
const GALLERY_DIR = path.join(PUBLIC, "products", "gallery");

fs.mkdirSync(GALLERY_DIR, { recursive: true });

// ─── Find source image ─────────────────────────────────────────────────
function findSourceImage(id) {
  const normalized = id.replace(/-(0+)(\d+)$/, (_, _z, n) => `-${Number(n)}`);
  const paths = [
    path.join(PUBLIC, "products", "catalog", `${id}.webp`),
    path.join(PUBLIC, "catalog-assets", `${normalized}.webp`),
    path.join(PUBLIC, "catalog-assets", `${id}.webp`),
    path.join(PUBLIC, "catalog-assets", `${normalized}.jpg`),
  ];
  return paths.find(p => fs.existsSync(p)) || null;
}

// ─── Generate variants ─────────────────────────────────────────────────
async function generateVariants(sourceFile, id) {
  const outDir = path.join(GALLERY_DIR, id);
  fs.mkdirSync(outDir, { recursive: true });
  const out2 = path.join(outDir, "2.webp");
  const out3 = path.join(outDir, "3.webp");

  const metadata = await sharp(sourceFile).metadata();
  const w = metadata.width || 512;
  const h = metadata.height || 512;

  if (!fs.existsSync(out2)) {
    const cropSize = Math.round(Math.min(w, h) * 0.7);
    const cropLeft = Math.round((w - cropSize) / 2);
    const cropTop = Math.round((h - cropSize) / 2);
    await sharp(sourceFile)
      .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
      .resize(w, h, { fit: "cover" })
      .modulate({ brightness: 1.05, saturation: 1.1 })
      .webp({ quality: 82 })
      .toFile(out2);
  }

  if (!fs.existsSync(out3)) {
    await sharp(sourceFile)
      .rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize(w, h, { fit: "cover" })
      .modulate({ brightness: 0.92, saturation: 1.15, hue: 5 })
      .webp({ quality: 82 })
      .toFile(out3);
  }

  return [
    `/products/gallery/${id}/2.webp`,
    `/products/gallery/${id}/3.webp`,
  ];
}

// ─── Get product name from catalog.ts ───────────────────────────────────
function getProductName(catalog, id) {
  const idx = catalog.indexOf(`id: "${id}"`);
  if (idx === -1) return id;
  const block = catalog.slice(idx, idx + 300);
  const m = block.match(/name:\s*"([^"]+)"/);
  return m ? m[1] : id;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  let catalog = fs.readFileSync(CATALOG_PATH, "utf-8");

  const manifestMap = new Map(manifest.map(e => [e.id, e]));

  // Find all mdh product IDs in catalog.ts
  const mdhMatches = [...catalog.matchAll(/id:\s*"(mdh-\d+)"/g)];
  const allMdhIds = mdhMatches.map(m => m[1]);

  console.log(`Found ${allMdhIds.length} mdh products in catalog.ts\n`);

  let addedToManifest = 0;
  let imagesGenerated = 0;
  let catalogUpdated = 0;

  for (const id of allMdhIds) {
    const name = getProductName(catalog, id);
    let entry = manifestMap.get(id);

    // Step 1: Add to manifest if missing
    if (!entry) {
      const sourceFile = findSourceImage(id);
      if (!sourceFile) {
        console.warn(`  ⚠ ${id}: No source image found, skipping`);
        continue;
      }

      // Determine hero path
      const catalogWebp = path.join(PUBLIC, "products", "catalog", `${id}.webp`);
      const heroPath = fs.existsSync(catalogWebp) 
        ? `/products/catalog/${id}.webp`
        : `/catalog-assets/${id.replace(/-(0+)(\d+)$/, (_, _z, n) => `-${Number(n)}`)}.webp`;

      entry = {
        id,
        name,
        sourceFilename: path.basename(sourceFile),
        kind: "imagem-conceitual",
        gallery: [heroPath],
      };
      manifest.push(entry);
      manifestMap.set(id, entry);
      addedToManifest++;
    }

    // Step 2: Generate variants if gallery < 3
    if (!entry.gallery || entry.gallery.length < 3) {
      const sourceFile = findSourceImage(id);
      if (!sourceFile) {
        console.warn(`  ⚠ ${id}: No source for variants`);
        continue;
      }
      const heroPath = entry.gallery?.[0] || `/products/catalog/${id}.webp`;
      const variants = await generateVariants(sourceFile, id);
      entry.gallery = [heroPath, ...variants];
      imagesGenerated += 2;
    }

    // Step 3: Update images[] in catalog.ts
    if (entry.gallery && entry.gallery.length >= 3) {
      const idPattern = `id: "${id}"`;
      const idx = catalog.indexOf(idPattern);
      if (idx === -1) continue;

      const block = catalog.slice(idx, idx + 800);
      const imagesMatch = block.match(/images:\s*\[([^\]]*)\]/);
      if (!imagesMatch) continue;

      const currentImageStr = imagesMatch[0];
      const currentCount = imagesMatch[1].split(",").map(s => s.trim()).filter(Boolean).length;

      if (currentCount < 3) {
        const newImageStr = `images: [${entry.gallery.slice(0, 3).map(g => `"${g}"`).join(", ")}]`;
        catalog = catalog.slice(0, idx + block.indexOf(currentImageStr)) + 
                  newImageStr + 
                  catalog.slice(idx + block.indexOf(currentImageStr) + currentImageStr.length);
        catalogUpdated++;
      }
    }

    process.stdout.write(`  ${id}: ✓\r`);
  }

  // Save
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  fs.writeFileSync(CATALOG_PATH, catalog);

  console.log(`\n\n📊 Results:`);
  console.log(`   Added to manifest: ${addedToManifest}`);
  console.log(`   Variant images generated: ${imagesGenerated}`);
  console.log(`   catalog.ts images[] updated: ${catalogUpdated}`);

  // Verify
  const finalManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const mdhInManifest = finalManifest.filter(e => e.id.startsWith("mdh-") && e.gallery?.length >= 3).length;
  console.log(`   mdh products with 3+ gallery: ${mdhInManifest}/${allMdhIds.length}`);
}

main().catch(console.error);
