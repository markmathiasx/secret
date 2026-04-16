import fs from "node:fs";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "public", "products", "csv-curated");

function normalizeSku(sku: string) {
  return String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function existingLocalImages(dir: string) {
  const candidates = [
    "cover.webp",
    "cover.png",
    "cover.jpg",
    "1.webp",
    "1.png",
    "1.jpg",
    "2.webp",
    "2.png",
    "2.jpg",
    "3.webp",
    "3.png",
    "3.jpg",
  ];

  return candidates
    .map((name) => ({ name, abs: path.join(dir, name) }))
    .filter((item) => fs.existsSync(item.abs))
    .map((item) => `${item.name}`);
}

export function getCsvCuratedLocalImages(sku: string) {
  const normalized = normalizeSku(sku);
  const dir = path.join(BASE_DIR, normalized);
  if (!fs.existsSync(dir)) return [] as string[];
  return existingLocalImages(dir).map((name) => `/products/csv-curated/${normalized}/${name}`);
}

export function hasCsvCuratedLocalMedia(sku: string) {
  return getCsvCuratedLocalImages(sku).length > 0;
}

type MinimalProduct = {
  tags?: string[];
};

export function isCsvPendingMediaProduct(product: MinimalProduct) {
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  return tags.includes("csv-curado-160") && tags.includes("midia-pendente-curadoria");
}

export function getSafePublicCatalog<T extends MinimalProduct>(products: T[]) {
  return products.filter((product) => !isCsvPendingMediaProduct(product));
}
