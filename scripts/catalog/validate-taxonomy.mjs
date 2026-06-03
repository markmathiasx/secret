import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog, getProductUrl } = require(path.join(ROOT, "lib", "catalog.ts"));
const { CATALOG_PRIMARY_CATEGORIES, BUYING_INTENTS, PRODUCT_OBJECT_TYPES } = require(path.join(ROOT, "lib", "catalog-taxonomy.ts"));
const { validateProductMedia, isPublicSafe } = require(path.join(ROOT, "lib", "media-validation.ts"));

const categorySet = new Set(CATALOG_PRIMARY_CATEGORIES);
const intentSet = new Set(BUYING_INTENTS);
const objectTypeSet = new Set(PRODUCT_OBJECT_TYPES);
const bannedPublicPatterns = [
  /foto\s+real/i,
  /fotos\s+reais/i,
  /render\s+fiel/i,
  /foto\s+real\s+x\s+render\s+fiel/i,
  /pe[cç]as\s+com\s+foto\s+real/i,
  /realPhoto/i,
  /real-photo/i,
  /verified-real/i,
];
const errors = [];

function addError(id, message) {
  errors.push(id ? `${id}: ${message}` : message);
}

function publicTextBlob(product) {
  return JSON.stringify({
    name: product.name,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    collection: product.collection,
    primaryCategory: product.primaryCategory,
    productTypePath: product.productTypePath,
    buyingIntents: product.buyingIntents,
    objectType: product.objectType,
    useCaseTags: product.useCaseTags,
    seoKeywords: product.seoKeywords,
    tags: product.tags,
    imageAlt: product.imageAlt,
    pricingNarrative: product.pricingNarrative,
  });
}

function validateProduct(product) {
  if (!product.primaryCategory) addError(product.id, "missing primaryCategory");
  if (!product.productTypePath) addError(product.id, "missing productTypePath");
  if (!Array.isArray(product.buyingIntents) || product.buyingIntents.length === 0) addError(product.id, "missing buyingIntents");
  if (!categorySet.has(product.primaryCategory)) addError(product.id, `invalid primaryCategory ${product.primaryCategory}`);
  if (!categorySet.has(product.category)) addError(product.id, `invalid public category ${product.category}`);
  if (!objectTypeSet.has(product.objectType)) addError(product.id, `invalid objectType ${product.objectType}`);

  for (const intent of product.buyingIntents || []) {
    if (!intentSet.has(intent)) addError(product.id, `invalid buyingIntent ${intent}`);
  }

  const blob = publicTextBlob(product);
  const banned = bannedPublicPatterns.find((pattern) => pattern.test(blob));
  if (banned) addError(product.id, `public text contains banned media wording: ${banned}`);

  const media = validateProductMedia(product);
  if (!isPublicSafe(media.status)) addError(product.id, `public product has unsafe media status ${media.status}`);
  if (!media.gallery.length && !product.image) addError(product.id, "public product has no image");
  if (media.gallery.some((item) => item.url.includes("product-placeholder"))) {
    addError(product.id, "public product exposes placeholder image");
  }
  if (String(product.status || "").toLowerCase().includes("draft")) addError(product.id, "draft product exposed");
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const output = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "admin"].includes(entry.name)) continue;
      output.push(...walkFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      output.push(full);
    }
  }
  return output;
}

function validatePublicSourceText() {
  const roots = ["app", "components", "lib"].map((item) => path.join(ROOT, item));
  const skipped = new Set([
    path.join(ROOT, "lib", "catalog-taxonomy.ts"),
    path.join(ROOT, "lib", "verified-catalog.ts"),
  ]);
  const files = roots.flatMap(walkFiles).filter((file) => !file.includes(`${path.sep}lib${path.sep}server${path.sep}`) && !skipped.has(file));

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const banned = bannedPublicPatterns.find((pattern) => pattern.test(text));
    if (banned) addError(path.relative(ROOT, file), `public source contains banned media wording: ${banned}`);
  }
}

const slugMap = new Map();
const skuMap = new Map();

for (const product of catalog) {
  validateProduct(product);

  const urlSlug = getProductUrl(product);
  if (slugMap.has(urlSlug)) addError(product.id, `duplicate product URL slug with ${slugMap.get(urlSlug)}`);
  else slugMap.set(urlSlug, product.id);

  if (product.sku) {
    if (skuMap.has(product.sku)) addError(product.id, `duplicate SKU with ${skuMap.get(product.sku)}`);
    else skuMap.set(product.sku, product.id);
  } else {
    addError(product.id, "missing SKU");
  }
}

validatePublicSourceText();

if (errors.length) {
  console.error(`catalog:validate-taxonomy failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 120)) console.error(`- ${error}`);
  if (errors.length > 120) console.error(`... ${errors.length - 120} more`);
  process.exit(1);
}

console.log(`catalog:validate-taxonomy passed for ${catalog.length} public products`);
