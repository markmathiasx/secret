import "server-only";

import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { normalizePublicCatalogProduct, normalizeSmartStoreProduct, isUnsafePublicLink } from "./normalize";
import type { ProductMasterDiagnostics, ProductMasterRecord, ProductMasterSource } from "./types";

function duplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  }
  return Array.from(duplicated).sort();
}

function missingRequiredFields(product: ProductMasterRecord) {
  const required: Array<keyof ProductMasterRecord> = [
    "id",
    "slug",
    "sku",
    "name",
    "category",
    "description",
    "pricePix",
    "priceCard",
    "productUrl",
  ];
  return required.filter((field) => {
    const value = product[field];
    if (typeof value === "number") return value <= 0;
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  }) as string[];
}

export async function getProductMasterData(): Promise<ProductMasterRecord[]> {
  const [publicCatalog, smartStore] = await Promise.all([
    getCatalogSnapshot(),
    Promise.resolve(getLocalStoreProducts()),
  ]);

  return [
    ...publicCatalog.map(normalizePublicCatalogProduct),
    ...smartStore.map(normalizeSmartStoreProduct),
  ];
}

export async function getProductMasterDiagnostics(): Promise<ProductMasterDiagnostics> {
  const products = await getProductMasterData();
  const bySource = products.reduce(
    (acc, product) => {
      acc[product.source] += 1;
      return acc;
    },
    { "public-catalog": 0, "smart-store": 0 } as Record<ProductMasterSource, number>
  );
  const missingRequired = products
    .map((product) => ({ id: product.id, fields: missingRequiredFields(product) }))
    .filter((entry) => entry.fields.length);
  const unsafeLinks = products.flatMap((product) =>
    [
      ["productUrl", product.productUrl],
      ["primaryImage", product.primaryImage],
      ["nuvemshopUrl", product.nuvemshopUrl],
    ]
      .filter(([, value]) => isUnsafePublicLink(value))
      .map(([field, value]) => ({ id: product.id, field: String(field), value: String(value) }))
  );

  return {
    generatedAt: new Date().toISOString(),
    total: products.length,
    bySource,
    duplicateSkus: duplicates(products.map((product) => product.sku)),
    duplicateProductUrls: duplicates(products.map((product) => product.productUrl)),
    unsafeLinks,
    missingRequired,
    ok: !missingRequired.length && !unsafeLinks.length,
  };
}

export async function findProductMasterBySlug(slug: string) {
  const products = await getProductMasterData();
  return products.find((product) => product.slug === slug || product.productUrl.endsWith(`/${slug}`)) || null;
}
