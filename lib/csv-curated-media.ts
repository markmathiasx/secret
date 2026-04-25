import csvCuratedMediaMapJson from "@/data/csv-curated-media-map.json";
import semanticAuditJson from "../output/CATALOG_SEMANTIC_AUDIT.json";

const csvCuratedMediaMap = csvCuratedMediaMapJson as Record<string, string[]>;
const semanticAudit = semanticAuditJson as {
  items?: Array<{ id?: string; sku?: string; status?: string; mediaStatus?: string }>;
};
const publicAllowedStatuses = new Set(["APPROVED", "FIX_TEXT"]);
const publicAllowedMediaStatuses = new Set(["verified", "render-verified", "probable"]);
const semanticAuditById = new Map(
  (semanticAudit.items || [])
    .flatMap((item) => [item.id, item.sku].filter(Boolean).map((key) => [String(key), item] as const)),
);

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
  id?: string;
  sku?: string;
  tags?: string[];
};

export function isCsvPendingMediaProduct(product: MinimalProduct) {
  const tags = Array.isArray(product?.tags) ? product.tags : [];
  return tags.includes("csv-curado-160") && tags.includes("midia-pendente-curadoria");
}

export function isPublicBlockedCatalogItem(product: MinimalProduct) {
  if (isCsvPendingMediaProduct(product)) return true;

  const audit = semanticAuditById.get(String(product.id || "")) || semanticAuditById.get(String(product.sku || ""));
  if (!audit) return false;

  if (!publicAllowedStatuses.has(String(audit.status || ""))) return true;
  if (audit.mediaStatus && !publicAllowedMediaStatuses.has(String(audit.mediaStatus))) return true;

  return false;
}

export function getSafePublicCatalog<T extends MinimalProduct>(products: T[]) {
  return products.filter((product) => !isPublicBlockedCatalogItem(product));
}
