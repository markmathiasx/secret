import { expect, test } from "@playwright/test";
import {
  CARD_MULTIPLIER,
  calculateFinalPrice,
  calculateProductionCostRecommendation,
  roundCurrency,
} from "../lib/pricing-engine";

test("production recommendation calculates full cost breakdown with margin target", () => {
  const result = calculateProductionCostRecommendation({
    estimatedGrams: 100,
    estimatedHours: 2,
    spoolPricePerKg: 200,
    machineHourlyRate: 10,
    postProcessMinutes: 30,
    laborHourlyRate: 20,
    packagingCost: 5,
    overheadPercent: 10,
    profitMode: "margin",
    profitTargetPercent: 50,
  });

  expect(result.costFilament).toBe(20);
  expect(result.costMachine).toBe(20);
  expect(result.costLabor).toBe(10);
  expect(result.costPackaging).toBe(5);
  expect(result.costOverhead).toBe(5.5);
  expect(result.totalCost).toBe(60.5);
  expect(result.recommendedPricePix).toBe(121);
  expect(result.recommendedPriceCard).toBe(roundCurrency(121 * CARD_MULTIPLIER));
  expect(result.profitAmount).toBe(60.5);
  expect(result.profitPercent).toBe(50);
});

test("production recommendation supports markup mode independently from margin mode", () => {
  const result = calculateProductionCostRecommendation({
    estimatedGrams: 100,
    estimatedHours: 2,
    spoolPricePerKg: 200,
    machineHourlyRate: 10,
    postProcessMinutes: 30,
    laborHourlyRate: 20,
    packagingCost: 5,
    overheadPercent: 10,
    profitMode: "markup",
    profitTargetPercent: 50,
  });

  expect(result.totalCost).toBe(60.5);
  expect(result.recommendedPricePix).toBe(90.75);
  expect(result.profitAmount).toBe(30.25);
  expect(result.profitPercent).toBe(33.33);
});

test("legacy final pricing keeps baseCost fallback and card multiplier behavior", () => {
  const result = calculateFinalPrice({ baseCost: 20, pricePix: 28, priceCard: 35 });

  expect(result.costBase).toBe(20);
  expect(result.pricePix).toBe(40);
  expect(result.priceCard).toBe(roundCurrency(40 * CARD_MULTIPLIER));
  expect(result.profitAmount).toBe(20);
});

test("legacy final pricing does not switch modes for historical gram estimates alone", () => {
  const result = calculateFinalPrice({ baseCost: 20, estimatedGrams: 100, estimatedHours: 2 });

  expect(result.costBase).toBe(20);
  expect(result.pricePix).toBe(40);
  expect(result.priceCard).toBe(roundCurrency(40 * CARD_MULTIPLIER));
});

test("roundCurrency returns stable two-decimal numbers", () => {
  expect(roundCurrency(19.999)).toBe(20);
  expect(roundCurrency(19.994)).toBe(19.99);
});
