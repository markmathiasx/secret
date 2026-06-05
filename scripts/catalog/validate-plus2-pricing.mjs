import { createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const {
  GLOBAL_PRICE_INCREASE,
  applyGlobalPriceIncrease,
  calculateCardPrice,
  normalizeMoney,
} = require("@/lib/payment-pricing");

const issues = [];
const items = catalog.map((product) => {
  const beforePix = normalizeMoney(product.pricePixBeforeGlobalIncrease);
  const currentPix = normalizeMoney(product.pricePix);
  const currentCard = normalizeMoney(product.priceCard);
  const expectedPix = applyGlobalPriceIncrease(beforePix);
  const expectedCard = calculateCardPrice(currentPix);
  const itemIssues = [];

  if (!beforePix || beforePix <= 0) {
    itemIssues.push("missing_base_pix_price");
  }
  if (Math.abs(currentPix - expectedPix) > 0.009) {
    itemIssues.push("pix_not_base_plus_2");
  }
  if (Math.abs(currentCard - expectedCard) > 0.009) {
    itemIssues.push("card_not_pix_plus_1");
  }
  if (normalizeMoney(product.globalPriceIncreaseApplied) !== GLOBAL_PRICE_INCREASE) {
    itemIssues.push("missing_global_increase_marker");
  }

  if (itemIssues.length) {
    issues.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      beforePix,
      currentPix,
      expectedPix,
      currentCard,
      expectedCard,
      issues: itemIssues,
    });
  }

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    beforePix,
    currentPix,
    currentCard,
    increaseApplied: Number((currentPix - beforePix).toFixed(2)),
    cardFeeApplied: Number((currentCard - currentPix).toFixed(2)),
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  ok: issues.length === 0,
  rule: `pricePix = basePix + ${GLOBAL_PRICE_INCREASE.toFixed(2)}; priceCard = pricePix + 1.00`,
  productsChecked: catalog.length,
  issues,
  samples: items.slice(0, 20),
};

writeJson("reports/plus2-pricing-validation-report.json", report);

if (issues.length) {
  console.error(`Falha: ${issues.length} produtos fora da validacao Pix + R$ 2,00.`);
  for (const issue of issues.slice(0, 25)) {
    console.error(`- ${issue.id} ${issue.name}: ${issue.issues.join(", ")}`);
  }
  process.exit(1);
}

console.log(`OK: ${catalog.length} produtos validados com Pix + R$ 2,00 e cartao = Pix + R$ 1,00.`);
