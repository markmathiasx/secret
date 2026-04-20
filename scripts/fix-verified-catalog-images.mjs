/**
 * Fix verified-catalog products: ensure 3 images per product.
 * For products with 2 images, generate a 3rd variant from the first image.
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const CATALOG_PATH = path.join(ROOT, "lib", "verified-catalog.ts");
const MANIFEST_PATH = path.join(ROOT, "data", "catalog-photo-manifest.json");

async function main() {
  let catalog = fs.readFileSync(CATALOG_PATH, "utf-8");
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const manifestMap = new Map(manifest.map(e => [e.id, e]));

  // Find all products with their images
  const productRegex = /id:\s*"(real-\d+)"[\s\S]*?images:\s*\[([\s\S]*?)\]/g;
  let match;
  let updated = 0;

  while ((match = productRegex.exec(catalog)) !== null) {
    const id = match[1];
    const imagesBlock = match[2];
    const images = imagesBlock.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, "")) || [];

    if (images.length >= 3) {
      console.log(`  ${id}: already has ${images.length} images ✓`);
      continue;
    }

    console.log(`  ${id}: has ${images.length} images, generating variant...`);

    // Generate 3rd image from the first image
    const sourceRelPath = images[0]; // e.g. "/products/foto-001-grinder-01.webp"
    const sourceAbsPath = path.join(PUBLIC, sourceRelPath);

    if (!fs.existsSync(sourceAbsPath)) {
      console.warn(`    ⚠ Source not found: ${sourceAbsPath}`);
      continue;
    }

    // Create gallery directory
    const galleryDir = path.join(PUBLIC, "products", "gallery", id);
    fs.mkdirSync(galleryDir, { recursive: true });

    const out3 = path.join(galleryDir, "3.webp");
    if (!fs.existsSync(out3)) {
      const metadata = await sharp(sourceAbsPath).metadata();
      const w = metadata.width || 512;
      const h = metadata.height || 512;

      await sharp(sourceAbsPath)
        .rotate(3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize(w, h, { fit: "cover" })
        .modulate({ brightness: 0.93, saturation: 1.12, hue: 5 })
        .webp({ quality: 82 })
        .toFile(out3);
      console.log(`    Generated: ${out3}`);
    }

    const newImagePath = `/products/gallery/${id}/3.webp`;
    const newImages = [...images, newImagePath];

    // Replace in catalog
    const oldImagesStr = match[0].slice(match[0].indexOf("images:"));
    const newImagesStr = `images: [\n      ${newImages.map(i => `"${i}"`).join(",\n      ")}\n    ]`;
    catalog = catalog.replace(oldImagesStr, newImagesStr);
    updated++;

    // Update manifest
    const entry = manifestMap.get(id);
    if (entry) {
      entry.gallery = newImages;
    } else {
      manifest.push({
        id,
        name: id,
        sourceFilename: path.basename(sourceRelPath),
        kind: "foto-real",
        gallery: newImages,
      });
    }
  }

  fs.writeFileSync(CATALOG_PATH, catalog);
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  console.log(`\n✅ Updated ${updated} verified-catalog products to 3 images`);
}

main().catch(console.error);
