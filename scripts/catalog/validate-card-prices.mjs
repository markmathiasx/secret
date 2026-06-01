import { createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");

const mismatches = catalog
  .map((product) => {
    const pricePix = normalizeMoney(product.pricePix);
    const priceCard = normalizeMoney(product.priceCard);
    const expectedCard = calculateCardPrice(pricePix);
    return {
      id: product.id,
      name: product.name,
      pricePix,
      priceCard,
      expectedCard,
      delta: Number((priceCard - expectedCard).toFixed(2)),
    };
  })
  .filter((item) => Math.abs(item.delta) > 0.009);

const prices = catalog.map((product) => normalizeMoney(product.pricePix)).filter((value) => value > 0);
const cards = prices.map((value) => calculateCardPrice(value));

const report = {
  generatedAt: new Date().toISOString(),
  rule: "priceCard = pricePix + 1.00",
  ok: mismatches.length === 0,
  productsChecked: catalog.length,
  mismatches,
  minPix: prices.length ? Math.min(...prices) : 0,
  minCard: cards.length ? Math.min(...cards) : 0,
};

writeJson("reports/card-price-plus-1-report.json", report);

if (mismatches.length) {
  console.error(`Falha: ${mismatches.length} produtos com cartao diferente de Pix + R$ 1,00.`);
  process.exit(1);
}

console.log(`OK: ${catalog.length} produtos com cartao = Pix + R$ 1,00.`);
