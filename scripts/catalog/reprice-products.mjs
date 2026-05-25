import fs from "node:fs";
import path from "node:path";
import { ROOT, createProjectRequire, writeJson } from "./ts-runtime.mjs";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");
const { getCommercialPriceBand, getMinimumSafePrice, getRecommendedPixPrice } = require("@/lib/catalog-pricing-policy");

const overridesPath = path.join(ROOT, "data", "admin-product-overrides.json");

function readOverrides() {
  if (!fs.existsSync(overridesPath)) return {};
  return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
}

function writeOverrides(overrides) {
  fs.writeFileSync(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
}

function legacyPixValue(override, product) {
  return normalizeMoney(
    override?.pricePix ??
      override?.pixPriceBrl ??
      override?.pixPrice ??
      override?.priceBrl ??
      override?.price ??
      product.pricePix
  );
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

const overrides = readOverrides();
const reportItems = catalog.map((product) => {
  const override = overrides[product.id] || {};
  const band = getCommercialPriceBand(product);
  const minimum = getMinimumSafePrice(product);
  const beforePix = legacyPixValue(override, product);
  const recommendedPix = getRecommendedPixPrice(product);
  const recommendedCard = calculateCardPrice(recommendedPix);
  const productType = band.id;
  const changed = Math.abs(beforePix - recommendedPix) > 0.009 || normalizeMoney(override.priceCard ?? product.priceCard) !== recommendedCard;

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    productType,
    band: { label: band.label, min: band.min, max: band.max, minimumMargin: band.minimumMargin },
    beforePix,
    beforeCard: calculateCardPrice(beforePix),
    recommendedPix,
    recommendedCard,
    minimumSafePrice: minimum.minimumSafePrice,
    totalCost: minimum.totalCost,
    minimumMargin: minimum.minimumMargin,
    premiumPreserved: productType.includes("premium") || recommendedPix >= 99.9,
    changed,
  };
});

const beforePrices = reportItems.map((item) => item.beforePix).filter((value) => value > 0);
const afterPrices = reportItems.map((item) => item.recommendedPix).filter((value) => value > 0);
const cards = reportItems.map((item) => item.recommendedCard).filter((value) => value > 0);

const report = {
  generatedAt: new Date().toISOString(),
  mode: dryRun ? "dry-run" : "apply",
  rule: "priceCard = pricePix + 3.00",
  productsChecked: reportItems.length,
  productsChanged: reportItems.filter((item) => item.changed).length,
  minPix: afterPrices.length ? Math.min(...afterPrices) : 0,
  minCard: cards.length ? Math.min(...cards) : 0,
  averagePixBefore: average(beforePrices),
  averagePixAfter: average(afterPrices),
  premiumPreserved: reportItems.filter((item) => item.premiumPreserved).length,
  entryLevelUnder30: reportItems.filter((item) => item.recommendedPix > 0 && item.recommendedPix <= 29.9).length,
  items: reportItems,
};

writeJson("reports/catalog-repricing-report.json", report);

if (apply) {
  for (const item of reportItems) {
    const existing = overrides[item.id] || {};
    overrides[item.id] = {
      ...existing,
      pricePix: item.recommendedPix,
      priceCard: item.recommendedCard,
      price: item.recommendedPix,
      priceBrl: item.recommendedPix,
      pixPrice: item.recommendedPix,
      pixPriceBrl: item.recommendedPix,
      listPrice: item.recommendedCard,
      listPriceBrl: item.recommendedCard,
      pricingSource: "catalog-commercial-policy-2026",
      pricingPolicyBand: item.productType,
      minimumSafePrice: item.minimumSafePrice,
      costingUpdatedAt: new Date().toISOString(),
    };
  }
  writeOverrides(overrides);
}

console.log(`${dryRun ? "Dry-run" : "Aplicado"}: ${report.productsChecked} produtos avaliados.`);
console.log(`${report.productsChanged} produtos com ajuste comercial.`);
console.log(`Menor Pix: R$ ${report.minPix.toFixed(2)} | Menor cartao: R$ ${report.minCard.toFixed(2)}`);
