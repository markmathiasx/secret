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

assert.match(operational, /keychainSplitRing:\s*0\.22/);
assert.match(operational, /keychainChain:\s*0\.18/);
assert.match(operational, /keychainRetailPackaging:\s*0\.25/);
assert.match(operational, /smallShippingEnvelope:\s*0\.45/);
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
    "--hours=0.6",
    "--quantity=1",
    "--personalized",
    "--json",
  ],
  { encoding: "utf8" }
);
const result = JSON.parse(raw);
assert.equal(result.metalHardwarePerUnit, 0.4);
assert.equal(result.assumptions.freightChargedByCarrierIncluded, false);
assert.ok(result.totalCostPerUnit > 14);
assert.ok(result.recommendedCommercialPricePerUnit >= result.minimumPricePerUnitForTargetMargin);
assert.ok(result.recommendedCommercialPricePerUnit >= 22.9);

console.log("VALIDAÇÃO COMERCIAL: OK");
console.log(`Custo completo do chaveiro exemplo: R$ ${result.totalCostPerUnit.toFixed(2)}`);
console.log(`Preço comercial do chaveiro exemplo: R$ ${result.recommendedCommercialPricePerUnit.toFixed(2)}`);
