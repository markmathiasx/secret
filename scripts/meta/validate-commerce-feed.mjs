import { createProjectRequire, writeJson } from "../catalog/ts-runtime.mjs";

const require = createProjectRequire();
const {
  META_COMMERCE_COLUMNS,
  buildMetaCommerceCsv,
  buildMetaCommerceFeedData,
} = require("@/lib/meta-commerce-feed");

const forbiddenTerms = [
  "Foto real",
  "fotos reais",
  "render fiel",
  "12x",
  "mdh_impressao3d",
];

const allowedAvailability = new Set(["in stock", "preorder", "out of stock"]);
const expectedHeader = META_COMMERCE_COLUMNS.join(",");
const data = buildMetaCommerceFeedData();
const csv = buildMetaCommerceCsv(data.products);
const errors = [];
const warnings = [];
const seenIds = new Set();

if (!csv.startsWith(`${expectedHeader}\n`)) {
  errors.push({
    code: "invalid_header",
    message: "CSV header does not match Meta Commerce requirements.",
    expected: expectedHeader,
    actual: csv.split(/\r?\n/)[0] || "",
  });
}

if (data.products.length < 1) {
  errors.push({
    code: "empty_feed",
    message: "Meta Commerce feed must include at least one valid product.",
  });
}

for (const product of data.products) {
  const prefix = product.id || product.title || "unknown_product";

  if (!product.id) {
    errors.push({ code: "missing_id", product: prefix });
  } else if (seenIds.has(product.id)) {
    errors.push({ code: "duplicate_id", product: prefix });
  }
  seenIds.add(product.id);

  if (!product.title || product.title.length > 150) {
    errors.push({ code: "invalid_title", product: prefix, title: product.title });
  }

  if (!product.description || product.description.trim().length < 8) {
    errors.push({ code: "invalid_description", product: prefix });
  }

  if (!allowedAvailability.has(product.availability)) {
    errors.push({ code: "invalid_availability", product: prefix, availability: product.availability });
  }

  if (product.condition !== "new") {
    errors.push({ code: "invalid_condition", product: prefix, condition: product.condition });
  }

  if (!/^\d+(?:\.\d{2}) BRL$/.test(product.price)) {
    errors.push({ code: "invalid_price", product: prefix, price: product.price });
  }

  if (!product.link.startsWith("https://www.mdh3d.com.br/")) {
    errors.push({ code: "invalid_link", product: prefix, link: product.link });
  }

  if (!product.image_link.startsWith("https://")) {
    errors.push({ code: "invalid_image_link", product: prefix, image_link: product.image_link });
  }

  const serialized = Object.values(product).join(" ");
  if (/localhost|127\.0\.0\.1|blob:|data:/i.test(serialized)) {
    errors.push({ code: "local_or_inline_url", product: prefix });
  }

  for (const term of forbiddenTerms) {
    if (serialized.toLowerCase().includes(term.toLowerCase())) {
      errors.push({ code: "forbidden_term", product: prefix, term });
    }
  }
}

for (const skipped of data.skipped) {
  warnings.push({
    product: skipped.id,
    title: skipped.title,
    reasons: skipped.reasons,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  expectedHeader,
  productsInFeed: data.products.length,
  publicProducts: data.totalPublicProducts,
  productsWithOwnImage: data.totalWithOwnImage,
  productsUsingPlaceholder: data.totalUsingPlaceholder,
  skippedProducts: data.skipped.length,
  skippedByReason: data.skipped.reduce((acc, item) => {
    for (const reason of item.reasons) {
      acc[reason] = (acc[reason] || 0) + 1;
    }
    return acc;
  }, {}),
  sampleProducts: data.products.slice(0, 20),
  warnings,
  errors,
};

writeJson("reports/meta-commerce-feed-report.json", report);

if (errors.length > 0) {
  console.error(`Falha: ${errors.length} erro(s) crítico(s) no feed Meta Commerce.`);
  for (const error of errors.slice(0, 40)) {
    console.error(`- ${error.code}: ${JSON.stringify(error)}`);
  }
  process.exit(1);
}

console.log(`OK: feed Meta Commerce com ${data.products.length} produto(s). ${data.skipped.length} ignorado(s).`);
