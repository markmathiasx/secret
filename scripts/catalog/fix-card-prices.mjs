import fs from "node:fs";
import path from "node:path";
import { ROOT, createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");

const overridesPath = path.join(ROOT, "data", "admin-product-overrides.json");

function readOverrides() {
  if (!fs.existsSync(overridesPath)) return {};
  return JSON.parse(fs.readFileSync(overridesPath, "utf8"));
}

function writeOverrides(overrides) {
  fs.writeFileSync(overridesPath, `${JSON.stringify(overrides, null, 2)}\n`, "utf8");
}

const overrides = readOverrides();
const corrections = [];

for (const product of catalog) {
  const pricePix = normalizeMoney(product.pricePix);
  const expectedCard = calculateCardPrice(pricePix);
  const existingOverride = overrides[product.id] || {};
  const existingCard = normalizeMoney(existingOverride.priceCard ?? product.priceCard);
  const mismatch = Math.abs(existingCard - expectedCard) > 0.009;

  if (mismatch || existingOverride.priceCard !== expectedCard) {
    overrides[product.id] = {
      ...existingOverride,
      priceCard: expectedCard,
      listPrice: expectedCard,
      listPriceBrl: expectedCard,
      pricingSource: "pix-plus-1-policy",
    };
    corrections.push({
      id: product.id,
      name: product.name,
      pricePix,
      beforeCard: existingCard,
      expectedCard,
      corrected: mismatch,
    });
  }
}

writeOverrides(overrides);

const report = {
  generatedAt: new Date().toISOString(),
  rule: "priceCard = pricePix + 1.00",
  productsChecked: catalog.length,
  overrideEntriesTouched: corrections.length,
  mismatchedCardsCorrected: corrections.filter((item) => item.corrected).length,
  corrections,
};

writeJson("reports/card-price-plus-1-report.json", report);
console.log(`Cartao Pix + R$ 1,00 verificado em ${catalog.length} produtos.`);
console.log(`${report.mismatchedCardsCorrected} valores de cartao corrigidos.`);
