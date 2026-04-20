/**
 * Generate 3 gallery images per catalog item.
 * 
 * Strategy:
 * - mw-a1-*: Already have cover.webp, 02-closeup.webp, 03-angle.webp → update manifest
 * - mdh-*: Have 1 image → generate 2 variants (closeup crop + adjusted angle) via sharp
 * - real-*: Have 01-hero.jpg, 02-closeup.jpg, 03-in_use.jpg → add to manifest
 * - csv-*: Have 01-hero.jpg, 02-closeup.jpg, 03-in_use.jpg → add to manifest
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "data", "catalog-photo-manifest.json");
const PUBLIC = path.join(ROOT, "public");
const GALLERY_DIR = path.join(PUBLIC, "products", "gallery");

// Ensure gallery directory exists
fs.mkdirSync(GALLERY_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));

// ─── Helper: find a source image for an mdh product ─────────────────────
function findMdhSourceImage(id) {
  // Try products/catalog/{id}.webp first
  const catalogWebp = path.join(PUBLIC, "products", "catalog", `${id}.webp`);
  if (fs.existsSync(catalogWebp)) return catalogWebp;

  // Try catalog-assets (strip leading zeros: mdh-005 → mdh-5)
  const normalized = id.replace(/-(0+)(\d+)$/, (_, _z, n) => `-${Number(n)}`);
  const assetWebp = path.join(PUBLIC, "catalog-assets", `${normalized}.webp`);
  if (fs.existsSync(assetWebp)) return assetWebp;

  const assetWebpOrig = path.join(PUBLIC, "catalog-assets", `${id}.webp`);
  if (fs.existsSync(assetWebpOrig)) return assetWebpOrig;

  const assetJpg = path.join(PUBLIC, "catalog-assets", `${normalized}.jpg`);
  if (fs.existsSync(assetJpg)) return assetJpg;

  return null;
}

// ─── Generate 2 variant images from a source ────────────────────────────
async function generateVariants(sourceFile, id) {
  const outDir = path.join(GALLERY_DIR, id);
  fs.mkdirSync(outDir, { recursive: true });

  const out2 = path.join(outDir, "2.webp");
  const out3 = path.join(outDir, "3.webp");

  // Skip if both already exist
  if (fs.existsSync(out2) && fs.existsSync(out3)) {
    return [
      `/products/gallery/${id}/2.webp`,
      `/products/gallery/${id}/3.webp`,
    ];
  }

  const metadata = await sharp(sourceFile).metadata();
  const w = metadata.width || 512;
  const h = metadata.height || 512;

  // Variant 2: Center crop (zoomed in ~70%) — simulates a closeup shot
  const cropSize = Math.round(Math.min(w, h) * 0.7);
  const cropLeft = Math.round((w - cropSize) / 2);
  const cropTop = Math.round((h - cropSize) / 2);

  if (!fs.existsSync(out2)) {
    await sharp(sourceFile)
      .extract({ left: cropLeft, top: cropTop, width: cropSize, height: cropSize })
      .resize(w, h, { fit: "cover" })
      .modulate({ brightness: 1.05, saturation: 1.1 })
      .webp({ quality: 82 })
      .toFile(out2);
  }

  // Variant 3: Slight rotation + different brightness — simulates different angle
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

// ─── Process mw-a1-* entries ────────────────────────────────────────────
async function processMwA1(entry) {
  const id = entry.id;
  const base = `/products/a1-mini-expansion/${id}`;
  const coverPath = path.join(PUBLIC, "products", "a1-mini-expansion", id, "cover.webp");
  const closeupPath = path.join(PUBLIC, "products", "a1-mini-expansion", id, "02-closeup.webp");
  const anglePath = path.join(PUBLIC, "products", "a1-mini-expansion", id, "03-angle.webp");

  const gallery = [`${base}/cover.webp`];
  
  if (fs.existsSync(closeupPath)) {
    gallery.push(`${base}/02-closeup.webp`);
  }
  if (fs.existsSync(anglePath)) {
    gallery.push(`${base}/03-angle.webp`);
  }

  // If we still don't have 3 images, generate variants from cover
  if (gallery.length < 3 && fs.existsSync(coverPath)) {
    const variants = await generateVariants(coverPath, id);
    while (gallery.length < 3 && variants.length > 0) {
      gallery.push(variants.shift());
    }
  }

  entry.gallery = gallery.slice(0, 3);
  return entry;
}

// ─── Process mdh-* entries ──────────────────────────────────────────────
async function processMdh(entry) {
  const id = entry.id;
  
  // Already has 3+ gallery images
  if (entry.gallery && entry.gallery.length >= 3) return entry;

  const heroPath = entry.gallery?.[0] || `/products/catalog/${id}.webp`;
  const sourceFile = findMdhSourceImage(id);

  if (!sourceFile) {
    console.warn(`  ⚠ No source image found for ${id}`);
    return entry;
  }

  const variants = await generateVariants(sourceFile, id);
  entry.gallery = [heroPath, ...variants];
  return entry;
}

// ─── Find and process real-* and csv-* products ─────────────────────────
function findProductDirImages(prefix) {
  const productsDir = path.join(PUBLIC, "products");
  const newEntries = [];
  
  const dirs = fs.readdirSync(productsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith(prefix));

  for (const dir of dirs) {
    // Extract ID from directory name (e.g., "real-001-grinder..." → "real-001")
    const match = dir.name.match(/^((?:real|csv-\w+)-\d+)/);
    if (!match) continue;
    
    const id = match[1];
    const dirPath = path.join(productsDir, dir.name);
    
    const hero = path.join(dirPath, "01-hero.jpg");
    const closeup = path.join(dirPath, "02-closeup.jpg");
    const inUse = path.join(dirPath, "03-in_use.jpg");
    
    if (!fs.existsSync(hero)) continue;
    
    const relBase = `/products/${dir.name}`;
    const gallery = [`${relBase}/01-hero.jpg`];
    if (fs.existsSync(closeup)) gallery.push(`${relBase}/02-closeup.jpg`);
    if (fs.existsSync(inUse)) gallery.push(`${relBase}/03-in_use.jpg`);
    
    // If still less than 3, try 04-packshot.jpg
    const packshot = path.join(dirPath, "04-packshot.jpg");
    if (gallery.length < 3 && fs.existsSync(packshot)) {
      gallery.push(`${relBase}/04-packshot.jpg`);
    }

    newEntries.push({
      id,
      dirName: dir.name,
      gallery: gallery.slice(0, 3),
    });
  }
  
  return newEntries;
}

// ─── Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log("🖼️  Generating 3 gallery images per catalog item...\n");

  const manifestMap = new Map(manifest.map(e => [e.id, e]));
  let updatedCount = 0;
  let generatedImages = 0;

  // Process mw-a1-* entries (500 products)
  const mwEntries = manifest.filter(e => e.id.startsWith("mw-a1-"));
  console.log(`📦 Processing ${mwEntries.length} mw-a1-* products...`);
  for (const entry of mwEntries) {
    const before = entry.gallery?.length || 0;
    await processMwA1(entry);
    if (entry.gallery.length > before) updatedCount++;
  }
  console.log(`   ✅ mw-a1 done\n`);

  // Process mdh-* entries (42 products)
  const mdhEntries = manifest.filter(e => e.id.startsWith("mdh-"));
  console.log(`🎨 Processing ${mdhEntries.length} mdh-* products...`);
  for (const entry of mdhEntries) {
    const before = entry.gallery?.length || 0;
    await processMdh(entry);
    const after = entry.gallery?.length || 0;
    if (after > before) {
      updatedCount++;
      generatedImages += (after - before);
    }
    process.stdout.write(`   ${entry.id}: ${after} images\r`);
  }
  console.log(`\n   ✅ mdh done (${generatedImages} images generated)\n`);

  // Process real-* products
  const realProducts = findProductDirImages("real-");
  console.log(`📸 Found ${realProducts.length} real-* products with images`);
  for (const rp of realProducts) {
    if (!manifestMap.has(rp.id)) {
      // Add new entry to manifest
      manifest.push({
        id: rp.id,
        name: rp.dirName.replace(/^real-\d+-/, "").replace(/-/g, " "),
        sourceFilename: rp.gallery[0],
        kind: "foto-real",
        gallery: rp.gallery,
      });
      manifestMap.set(rp.id, manifest[manifest.length - 1]);
      updatedCount++;
    } else {
      const existing = manifestMap.get(rp.id);
      if (!existing.gallery || existing.gallery.length < 3) {
        existing.gallery = rp.gallery;
        updatedCount++;
      }
    }
  }

  // Process csv-* products
  const csvProducts = findProductDirImages("csv-");
  console.log(`📋 Found ${csvProducts.length} csv-* products with images`);
  for (const cp of csvProducts) {
    if (!manifestMap.has(cp.id)) {
      manifest.push({
        id: cp.id,
        name: cp.dirName.replace(/^csv-\w+-\d+-/, "").replace(/-/g, " "),
        sourceFilename: cp.gallery[0],
        kind: "imagem-conceitual",
        gallery: cp.gallery,
      });
      manifestMap.set(cp.id, manifest[manifest.length - 1]);
      updatedCount++;
    } else {
      const existing = manifestMap.get(cp.id);
      if (!existing.gallery || existing.gallery.length < 3) {
        existing.gallery = cp.gallery;
        updatedCount++;
      }
    }
  }

  // Write updated manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  // Stats
  const totalWithThree = manifest.filter(e => e.gallery && e.gallery.length >= 3).length;
  const totalEntries = manifest.length;
  
  console.log(`\n📊 Results:`);
  console.log(`   Total entries: ${totalEntries}`);
  console.log(`   With 3+ gallery images: ${totalWithThree}`);
  console.log(`   Updated in this run: ${updatedCount}`);
  console.log(`   New variant images generated: ${generatedImages}`);
  
  if (totalWithThree < totalEntries) {
    const missing = manifest.filter(e => !e.gallery || e.gallery.length < 3);
    console.log(`\n   ⚠ ${missing.length} entries still have < 3 images:`);
    for (const m of missing.slice(0, 10)) {
      console.log(`     - ${m.id} (${m.gallery?.length || 0} images)`);
    }
  }
}

main().catch(console.error);
