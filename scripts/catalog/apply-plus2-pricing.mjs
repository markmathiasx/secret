import { createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const {
  GLOBAL_PRICE_INCREASE,
  applyGlobalPriceIncrease,
  calculateCardPrice,
  normalizeMoney,
} = require("@/lib/payment-pricing");

const mismatches = [];
const items = catalog.map((product) => {
  const beforePix = normalizeMoney(product.pricePixBeforeGlobalIncrease ?? product.pricePix - GLOBAL_PRICE_INCREASE);
  const beforeCard = calculateCardPrice(beforePix);
  const pricePix = normalizeMoney(product.pricePix);
  const priceCard = normalizeMoney(product.priceCard);
  const expectedPix = applyGlobalPriceIncrease(beforePix);
  const expectedCard = calculateCardPrice(expectedPix);
  const pixDelta = Number((pricePix - expectedPix).toFixed(2));
  const cardDelta = Number((priceCard - expectedCard).toFixed(2));

  if (Math.abs(pixDelta) > 0.009 || Math.abs(cardDelta) > 0.009) {
    mismatches.push({
      id: product.id,
      sku: product.sku,
      name: product.name,
      beforePix,
      pricePix,
      expectedPix,
      priceCard,
      expectedCard,
      pixDelta,
      cardDelta,
    });
  }

  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    beforePix,
    beforeCard,
    pricePix,
    priceCard,
    increaseApplied: Number((pricePix - beforePix).toFixed(2)),
    cardFeeApplied: Number((priceCard - pricePix).toFixed(2)),
    url: product.slug ? `/loja/${String(product.category).toLowerCase().replace(/[^a-z0-9]+/g, "-")}/${product.id}-${product.slug}` : null,
  };
});

const pixValues = items.map((item) => item.pricePix).filter((value) => value > 0);
const report = {
  generatedAt: new Date().toISOString(),
  ok: mismatches.length === 0,
  strategy: "central_runtime_catalog_policy",
  rule: `pricePix = basePix + ${GLOBAL_PRICE_INCREASE.toFixed(2)}; priceCard = pricePix + 1.00`,
  productsChecked: catalog.length,
  mismatches,
  minPix: pixValues.length ? Math.min(...pixValues) : 0,
  maxPix: pixValues.length ? Math.max(...pixValues) : 0,
  examples: items.slice(0, 20),
  items,
};

writeJson("reports/plus2-pricing-report.json", report);

if (mismatches.length) {
  console.error(`Falha: ${mismatches.length} produtos fora da politica Pix + R$ 2,00 e cartao + R$ 1,00.`);
  process.exit(1);
}

console.log(`OK: politica Pix + R$ 2,00 aplicada em ${catalog.length} produtos; cartao = Pix + R$ 1,00.`);
