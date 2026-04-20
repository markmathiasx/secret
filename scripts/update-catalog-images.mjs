/**
 * Update mdh product images[] arrays in lib/catalog.ts
 * to reference all 3 gallery images from the manifest.
 * 
 * Also update csv product images[] via csv-curated-media-map.json.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Read catalog.ts
const catalogPath = path.join(ROOT, "lib", "catalog.ts");
let catalog = fs.readFileSync(catalogPath, "utf-8");

// Read manifest
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "catalog-photo-manifest.json"), "utf-8"));
const manifestMap = new Map(manifest.map(e => [e.id, e]));

let updatedCount = 0;

// Update mdh product images arrays
// Pattern: id: "mdh-XXX", ... images: ["/catalog-assets/mdh-N.webp"], ...
for (const entry of manifest.filter(e => e.id.startsWith("mdh-") && e.gallery?.length >= 3)) {
  const id = entry.id;
  const gallery = entry.gallery;
  
  // Find the images: [...] for this product
  // We need to find the block for this specific product ID
  const idPattern = `id: "${id}"`;
  const idIndex = catalog.indexOf(idPattern);
  if (idIndex === -1) continue;
  
  // Find the images array after this ID (within the next product block)
  const searchStart = idIndex;
  const nextProductPattern = /\n\s*\{[\s]*\n\s*id:/;
  const nextMatch = catalog.slice(searchStart + 10).search(nextProductPattern);
  const searchEnd = nextMatch !== -1 ? searchStart + 10 + nextMatch : searchStart + 2000;
  
  const block = catalog.slice(searchStart, searchEnd);
  
  // Find images: [...] within this block
  const imagesMatch = block.match(/images:\s*\[([^\]]*)\]/);
  if (!imagesMatch) continue;
  
  const currentImages = imagesMatch[0];
  const newImages = `images: [${gallery.map(g => `"${g}"`).join(", ")}]`;
  
  if (currentImages !== newImages) {
    catalog = catalog.replace(
      catalog.slice(searchStart + block.indexOf(currentImages), searchStart + block.indexOf(currentImages) + currentImages.length),
      newImages
    );
    updatedCount++;
  }
}

fs.writeFileSync(catalogPath, catalog);
console.log(`✅ Updated ${updatedCount} mdh product images[] arrays in catalog.ts`);
