import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog, getProductUrl } = require(path.join(ROOT, "lib", "catalog.ts"));
const { classifyCatalogProduct, CATALOG_PRIMARY_CATEGORIES } = require(path.join(ROOT, "lib", "catalog-taxonomy.ts"));

const webMode = process.argv.includes("--web");
const generatedAt = new Date().toISOString();
const categoryCounts = Object.fromEntries(CATALOG_PRIMARY_CATEGORIES.map((category) => [category, 0]));

function pickTaxonomy(product) {
  const classified = classifyCatalogProduct(product);
  return {
    primaryCategory: product.primaryCategory || classified.primaryCategory,
    subcategory: product.subcategory || classified.subcategory,
    productTypePath: product.productTypePath || classified.productTypePath,
    buyingIntents: product.buyingIntents?.length ? product.buyingIntents : classified.buyingIntents,
    objectType: product.objectType || classified.objectType,
    useCaseTags: product.useCaseTags?.length ? product.useCaseTags : classified.useCaseTags,
    seoKeywords: product.seoKeywords?.length ? product.seoKeywords : classified.seoKeywords,
    confidence: product.confidence || classified.confidence,
    classificationReason: product.classificationReason || classified.classificationReason,
  };
}

function buildItem(product) {
  const taxonomy = pickTaxonomy(product);
  categoryCounts[taxonomy.primaryCategory] = (categoryCounts[taxonomy.primaryCategory] || 0) + 1;

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug || product.id,
    url: getProductUrl(product),
    name: product.name,
    previousCategory: product.category === taxonomy.primaryCategory ? undefined : product.category,
    collection: product.collection,
    material: product.material,
    status: product.status,
    ...taxonomy,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enrichAmbiguitiesWithWeb(ambiguousItems) {
  const cachePath = path.join(ROOT, ".cache", "catalog-classification-web.json");
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
  const pending = ambiguousItems.filter((item) => !cache[item.id]).slice(0, 100);

  for (const item of pending) {
    const searchedQuery = `${item.name} 3D print category`;
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&language=pt&format=json&limit=1&search=${encodeURIComponent(item.name)}`;
      const response = await fetch(url, { headers: { "user-agent": "mdh-catalog-classifier/1.0" } });
      const payload = response.ok ? await response.json() : null;
      const hit = payload?.search?.[0];
      cache[item.id] = {
        searchedQuery,
        sourceDomain: "wikidata.org",
        sourceTitle: hit?.label || null,
        sourceUrl: hit?.concepturi || null,
        inferredCategory: item.primaryCategory,
        confidence: hit ? "medium" : "low",
      };
    } catch (error) {
      cache[item.id] = {
        searchedQuery,
        sourceDomain: null,
        sourceTitle: null,
        sourceUrl: null,
        inferredCategory: item.primaryCategory,
        confidence: "low",
        error: error instanceof Error ? error.message : "web lookup failed",
      };
    }

    fs.writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    await sleep(1000);
  }

  return cache;
}

const items = catalog.map(buildItem);
const ambiguousItems = items.filter((item) => item.confidence !== "high");
const webEvidence = webMode ? await enrichAmbiguitiesWithWeb(ambiguousItems) : undefined;

const overrides = Object.fromEntries(
  items.map((item) => [
    item.id,
    {
      primaryCategory: item.primaryCategory,
      subcategory: item.subcategory,
      productTypePath: item.productTypePath,
      buyingIntents: item.buyingIntents,
      objectType: item.objectType,
      useCaseTags: item.useCaseTags,
      seoKeywords: item.seoKeywords,
      confidence: item.confidence,
      classificationReason: item.classificationReason,
    },
  ])
);

writeJson("public/catalog-taxonomy-report.json", {
  generatedAt,
  total: items.length,
  categories: categoryCounts,
  webMode,
  items,
});
writeJson("public/catalog-taxonomy-overrides.json", {
  generatedAt,
  total: items.length,
  overrides,
});
writeJson("reports/catalog-taxonomy-review.json", {
  generatedAt,
  totalAmbiguous: ambiguousItems.length,
  webMode,
  webEvidence: webMode ? webEvidence : undefined,
  items: ambiguousItems,
});

console.log(`catalog:classify processed ${items.length} products`);
console.log(`catalog:classify ambiguous ${ambiguousItems.length}`);
