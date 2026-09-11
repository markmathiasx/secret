import assert from "node:assert/strict";
import test from "node:test";
import { createProjectRequire } from "../scripts/catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { calculateCompetitivePrice } = require("@/lib/competitive-pricing");

test("fica R$ 2 abaixo quando a margem permite", () => {
  const result = calculateCompetitivePrice({ competitorPrice: 23.9, totalCost: 8 });
  assert.equal(result.suggestedPix, 21.9);
  assert.equal(result.undercutsCompetitor, true);
  assert.equal(result.protectedByMargin, false);
});

test("protege o caixa quando copiar o preço destruiria a margem", () => {
  const result = calculateCompetitivePrice({ competitorPrice: 14, totalCost: 12, channelFeePercent: 14 });
  assert.ok(result.suggestedPix > 14);
  assert.equal(result.undercutsCompetitor, false);
  assert.equal(result.protectedByMargin, true);
  assert.ok(result.netMarginPercent >= 30);
});

test("rejeita preço e custo inválidos", () => {
  assert.throws(() => calculateCompetitivePrice({ competitorPrice: 0, totalCost: 8 }));
  assert.throws(() => calculateCompetitivePrice({ competitorPrice: 20, totalCost: 0 }));
});
