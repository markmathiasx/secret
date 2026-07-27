#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");

const operational = read("lib/operational-costs.ts");
const policy = read("lib/catalog-pricing-policy.ts");
const catalog = read("lib/catalog.ts");
const keychainPage = read("lib/commerce/first-sale-products.ts");
const intentPage = read("components/commerce/IntentPageTemplate.tsx");
const storefront = JSON.parse(read("data/commercial-storefront.json"));

function operationalNumber(name) {
  const match = operational.match(new RegExp(`${name}:\\s*([0-9]+(?:\\.[0-9]+)?)`));
  assert.ok(match, `Constante operacional ausente: ${name}`);
  return Number(match[1]);
}

const defaults = {
  splitRing: operationalNumber("keychainSplitRing"),
  chain: operationalNumber("keychainChain"),
  hardware: operationalNumber("keychainMetalHardware"),
  retailPackaging: operationalNumber("keychainRetailPackaging"),
  setup: operationalNumber("keychainPersonalizationSetup"),
  envelope: operationalNumber("smallShippingEnvelope"),
  label: operationalNumber("shippingLabel"),
  tape: operationalNumber("tapeAndProtection"),
  failure: operationalNumber("failureReservePercent"),
  overhead: operationalNumber("overheadPercent"),
  margin: operationalNumber("targetGrossMarginPercent"),
};

assert.ok(Math.abs(defaults.splitRing + defaults.chain - defaults.hardware) < 1e-9);
assert.equal(defaults.hardware, 0.4);
assert.equal(defaults.retailPackaging, 0.25);
assert.ok(Math.abs(defaults.envelope + defaults.label + defaults.tape - 0.85) < 1e-9);
assert.ok(defaults.failure >= 10);
assert.ok(defaults.overhead >= 10);
assert.ok(defaults.margin >= 35);

assert.match(policy, /priceForGrossMargin/);
assert.match(policy, /recommendedPixPrice/);
assert.match(policy, /failureReserve/);
assert.match(catalog, /commercialPolicy\.recommendedPixPrice/);
assert.match(catalog, /baseCost:\s*taxonomized\.baseCost/);
assert.match(catalog, /estimatedUnitCost:\s*taxonomized\.estimatedUnitCost/);
assert.match(catalog, /Math\.max\([\s\S]*requestedPricePix/);
assert.match(catalog, /const costBase = commercialPolicy\.totalCost;/);
assert.match(keychainPage, /argola metálica/i);
assert.match(intentPage, /Incluso no preço:/);

const raw = execFileSync(
  process.execPath,
  [
    path.join(root, "scripts/pricing/calculate-keychain.mjs"),
    "--grams=15",
    "--hours=0.8",
    "--quantity=1",
    "--personalized",
    "--json",
  ],
  { encoding: "utf8" }
);
const result = JSON.parse(raw);

assert.equal(result.costs.splitRingPerUnit, defaults.splitRing);
assert.equal(result.costs.chainPerUnit, defaults.chain);
assert.equal(result.costs.individualPackagingPerUnit, defaults.retailPackaging);
assert.equal(result.costs.outerShippingSuppliesPerOrder, 0.85);
assert.equal(result.costs.designSetupPerOrder, defaults.setup);
assert.equal(result.costs.failureReservePercent, defaults.failure);
assert.equal(result.costs.overheadPercent, defaults.overhead);
assert.equal(result.costs.targetGrossMarginPercent, defaults.margin);
assert.equal(result.metalHardwarePerUnit, defaults.hardware);
assert.equal(result.assumptions.freightChargedByCarrierIncluded, false);
assert.ok(result.totalCostPerUnit >= 17.6);
assert.ok(result.recommendedCommercialPricePerUnit >= result.minimumPricePerUnitForTargetMargin);
assert.ok(result.recommendedCommercialPricePerUnit >= 29.9);
assert.ok(result.grossMarginAtRecommendedPercent >= defaults.margin);

const keychain = storefront.products?.["mdh-016"];
assert.ok(keychain, "Chaveiro comercial mdh-016 ausente.");
assert.ok(keychain.pricePix >= result.recommendedCommercialPricePerUnit);
assert.equal(keychain.hardwareCost, defaults.hardware);
assert.equal(keychain.retailPackagingCost, defaults.retailPackaging);
assert.equal(keychain.shippingSuppliesCost, 0.85);
assert.equal(keychain.designSetupCost, defaults.setup);

console.log("VALIDAÇÃO COMERCIAL INDUSTRIAL V6: OK");
console.log(`Custo completo do chaveiro exemplo: R$ ${result.totalCostPerUnit.toFixed(2)}`);
console.log(`Preço comercial do chaveiro exemplo: R$ ${result.recommendedCommercialPricePerUnit.toFixed(2)}`);
console.log(`Margem bruta estimada: ${result.grossMarginAtRecommendedPercent.toFixed(2)}%`);
