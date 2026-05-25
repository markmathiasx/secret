import { createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");
const { getCommercialPriceBand, getMinimumSafePrice } = require("@/lib/catalog-pricing-policy");

const allowedPricePoints = new Set([
  19.9,
  24.9,
  29.9,
  34.9,
  39.9,
  44.9,
  49.9,
  59.9,
  69.9,
  79.9,
  89.9,
  99.9,
  119.9,
  149.9,
  199.9,
]);

const issues = [];
const items = catalog.map((product) => {
  const pricePix = normalizeMoney(product.pricePix);
  const priceCard = normalizeMoney(product.priceCard);
  const expectedCard = calculateCardPrice(pricePix);
  const minimum = getMinimumSafePrice(product);
  const band = getCommercialPriceBand(product);
  const itemIssues = [];

  if (Math.abs(priceCard - expectedCard) > 0.009) {
    itemIssues.push("card_not_pix_plus_3");
  }
  if (pricePix + 0.009 < minimum.minimumSafePrice) {
    itemIssues.push("below_minimum_safe_price");
  }
  if (!allowedPricePoints.has(pricePix) && pricePix < minimum.minimumSafePrice + 0.01) {
    itemIssues.push("not_on_commercial_price_point");
  }
  if (pricePix <= 0) {
    itemIssues.push("missing_pix_price");
  }

  if (itemIssues.length) {
    issues.push({
      id: product.id,
      name: product.name,
      pricePix,
      priceCard,
      expectedCard,
      minimumSafePrice: minimum.minimumSafePrice,
      issues: itemIssues,
    });
  }

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    band: band.id,
    pricePix,
    priceCard,
    minimumSafePrice: minimum.minimumSafePrice,
    totalCost: minimum.totalCost,
    marginPercent: pricePix > 0 ? Number((((pricePix - minimum.totalCost) / pricePix) * 100).toFixed(2)) : 0,
  };
});

const pixValues = items.map((item) => item.pricePix).filter((value) => value > 0);
const cardValues = items.map((item) => item.priceCard).filter((value) => value > 0);

const report = {
  generatedAt: new Date().toISOString(),
  ok: issues.length === 0,
  productsChecked: catalog.length,
  issues,
  minPix: pixValues.length ? Math.min(...pixValues) : 0,
  minCard: cardValues.length ? Math.min(...cardValues) : 0,
  entryLevelUnder30: items.filter((item) => item.pricePix > 0 && item.pricePix <= 29.9).length,
  premiumProducts: items.filter((item) => item.pricePix >= 99.9).length,
  items,
};

writeJson("reports/pricing-validation-report.json", report);

if (issues.length) {
  console.error(`Falha: ${issues.length} produtos violam a politica de preco.`);
  process.exit(1);
}

console.log(`OK: ${catalog.length} produtos dentro da politica comercial e de custo minimo.`);
