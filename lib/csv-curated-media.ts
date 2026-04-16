import csvCuratedMediaMapJson from "@/data/csv-curated-media-map.json";

const csvCuratedMediaMap = csvCuratedMediaMapJson as Record<string, string[]>;

function normalizeSku(sku: string) {
  return String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

export function getCsvCuratedLocalImages(sku: string) {
  const normalized = normalizeSku(sku);
  const images = csvCuratedMediaMap[normalized];
  return Array.isArray(images) ? images.filter(Boolean) : [];
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
