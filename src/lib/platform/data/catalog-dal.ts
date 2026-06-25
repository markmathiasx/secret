import { getCatalogDiagnostics, getCatalogSnapshot, searchCatalogProducts, type CatalogQuery } from "@/lib/catalog-repository";
import { buildCacheKey } from "@/src/lib/platform/cache/keys";
import { readThroughDal } from "@/src/lib/platform/data/dal";

export function getCatalogProductsDal() {
  return readThroughDal("catalog.products", buildCacheKey("catalog:products"), getCatalogSnapshot, {
    ttlSeconds: 300,
    source: "Product Master",
  });
}

export function getCatalogStatsDal() {
  return readThroughDal("catalog.stats", buildCacheKey("catalog:stats"), getCatalogDiagnostics, {
    ttlSeconds: 300,
    source: "Product Master diagnostics",
  });
}

export function searchCatalogDal(query: CatalogQuery) {
  return readThroughDal("catalog.search", buildCacheKey("catalog:search", [JSON.stringify(query)]), () => searchCatalogProducts(query), {
    ttlSeconds: 120,
    source: "Product Master search",
  });
}
