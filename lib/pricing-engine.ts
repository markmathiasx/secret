export type PricingInput = {
  grams?: number;
  hours?: number;
  complexity?: number;
  baseCost?: number;
  estimatedUnitCost?: number;
  estimatedGrams?: number;
  estimatedHours?: number;
  spoolPricePerKg?: number;
  machineHourlyRate?: number;
  postProcessMinutes?: number;
  laborHourlyRate?: number;
  packagingCost?: number;
  overheadPercent?: number;
  profitMode?: ProfitMode;
  profitTargetPercent?: number;
  estimatedProfitAmount?: number;
  estimatedProfitPercent?: number;
  cardMultiplier?: number;
  pricePix?: number;
  priceCard?: number;
  marketplaceSuggested?: number;
};

import { calculateCardPrice, roundToCents } from "@/lib/payment-pricing";

export type ProfitMode = "margin" | "markup";

export type ProductionCostRecommendation = {
  costFilament: number;
  costMachine: number;
  costLabor: number;
  costPackaging: number;
  costOverhead: number;
  totalCost: number;
  recommendedPricePix: number;
  recommendedPriceCard: number;
  profitAmount: number;
  profitPercent: number;
  referencePrice: number;
};

export const TARGET_PROFIT_MARKUP = 0.3;
export const TARGET_LIQUID_MARGIN = TARGET_PROFIT_MARKUP;
export const PIX_PRICE_DIVISOR = 1 / (1 + TARGET_PROFIT_MARKUP);
export const CARD_MULTIPLIER = 1;
export const BOLETO_MULTIPLIER = 1.08;
export const MARKETPLACE_PRICE_MULTIPLIER = 1.15;
export const REFERENCE_PRICE_MULTIPLIER = 1.18;
export const FIXED_MARGIN_BADGE_LABEL = "Margem bruta mínima de 30%";
export const LOCAL_PRODUCTION_BADGE_LABEL = "Atendimento direto";
export const MIN_SITE_PRICE_PIX = 0.01;
export const DEFAULT_SPOOL_PRICE_PER_KG = 100;
export const DEFAULT_MACHINE_HOURLY_RATE = 4.5;
export const DEFAULT_LABOR_HOURLY_RATE = 15;
export const DEFAULT_PACKAGING_COST = 1.5;
export const DEFAULT_OVERHEAD_PERCENT = 8;

const filamentCostPerGram = 0.15;

export function roundCurrency(value: number) {
  return roundToCents(value);
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nonNegativeNumber(value: unknown, fallback = 0) {
  return Math.max(0, finiteNumber(value, fallback));
}

function positiveNumber(value: unknown, fallback: number) {
  const resolved = finiteNumber(value, fallback);
  return resolved > 0 ? resolved : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hasProductionCostConfig(input: PricingInput) {
  if (input.profitMode === "margin" || input.profitMode === "markup") return true;

  return [
    input.spoolPricePerKg,
    input.machineHourlyRate,
    input.postProcessMinutes,
    input.laborHourlyRate,
    input.packagingCost,
    input.overheadPercent,
    input.profitTargetPercent,
  ].some((value) => typeof value === "number" && Number.isFinite(value));
}

export function calculateBaseCost(grams = 0, hours = 0, complexity = 1) {
  const material = Math.max(0, grams) * filamentCostPerGram;
  const machine = Math.max(5, Math.max(0, hours) * 6.9);
  const finishing = Math.max(4.5, Math.max(1, complexity) * 4.8);
  return roundCurrency(material + machine + finishing);
}

export function calculateProductionCostRecommendation(input: PricingInput): ProductionCostRecommendation {
  const grams = nonNegativeNumber(input.estimatedGrams ?? input.grams);
  const hours = nonNegativeNumber(input.estimatedHours ?? input.hours);
  const spoolPricePerKg = positiveNumber(input.spoolPricePerKg, DEFAULT_SPOOL_PRICE_PER_KG);
  const machineHourlyRate = positiveNumber(input.machineHourlyRate, DEFAULT_MACHINE_HOURLY_RATE);
  const postProcessMinutes = nonNegativeNumber(input.postProcessMinutes);
  const laborHourlyRate = positiveNumber(input.laborHourlyRate, DEFAULT_LABOR_HOURLY_RATE);
  const packagingCost = nonNegativeNumber(input.packagingCost, DEFAULT_PACKAGING_COST);
  const overheadPercent = clamp(nonNegativeNumber(input.overheadPercent, DEFAULT_OVERHEAD_PERCENT), 0, 300);
  const profitMode: ProfitMode = input.profitMode === "margin" ? "margin" : "markup";
  const targetPercent = clamp(
    nonNegativeNumber(input.profitTargetPercent, TARGET_LIQUID_MARGIN * 100),
    0,
    profitMode === "margin" ? 95 : 500
  );

  const costFilament = roundCurrency(grams * (spoolPricePerKg / 1000));
  const costMachine = roundCurrency(hours * machineHourlyRate);
  const costLabor = roundCurrency((postProcessMinutes / 60) * laborHourlyRate);
  const costPackaging = roundCurrency(packagingCost);
  const subtotal = costFilament + costMachine + costLabor + costPackaging;
  const costOverhead = roundCurrency(subtotal * (overheadPercent / 100));
  const totalCost = roundCurrency(subtotal + costOverhead);
  const rawPix =
    profitMode === "margin"
      ? totalCost / (1 - targetPercent / 100)
      : totalCost * (1 + targetPercent / 100);
  const recommendedPricePix = roundCurrency(Math.max(MIN_SITE_PRICE_PIX, rawPix));
  const recommendedPriceCard = calculateCardPrice(recommendedPricePix);
  const profitAmount = roundCurrency(recommendedPricePix - totalCost);
  const profitPercent = recommendedPricePix > 0 ? roundCurrency((profitAmount / recommendedPricePix) * 100) : 0;
  const referencePrice = roundCurrency(
    Math.max(
      input.marketplaceSuggested || 0,
      input.priceCard || 0,
      input.pricePix || 0,
      recommendedPricePix * REFERENCE_PRICE_MULTIPLIER
    )
  );

  return {
    costFilament,
    costMachine,
    costLabor,
    costPackaging,
    costOverhead,
    totalCost,
    recommendedPricePix,
    recommendedPriceCard,
    profitAmount,
    profitPercent,
    referencePrice,
  };
}

export function resolveBaseCost(input: PricingInput) {
  if (typeof input.baseCost === "number" && Number.isFinite(input.baseCost) && input.baseCost > 0) {
    return roundCurrency(input.baseCost);
  }

  if (
    typeof input.estimatedUnitCost === "number" &&
    Number.isFinite(input.estimatedUnitCost) &&
    input.estimatedUnitCost > 0
  ) {
    return roundCurrency(input.estimatedUnitCost);
  }

  return calculateBaseCost(input.grams, input.hours, input.complexity);
}

export function calculateFinalPrice(input: PricingInput) {
  if (hasProductionCostConfig(input)) {
    const recommendation = calculateProductionCostRecommendation(input);
    return {
      costBase: recommendation.totalCost,
      pricePix: recommendation.recommendedPricePix,
      priceCard: recommendation.recommendedPriceCard,
      referencePrice: recommendation.referencePrice,
      profitAmount: recommendation.profitAmount,
      marginPercent: recommendation.profitPercent / 100,
    };
  }

  const costBase = resolveBaseCost(input);
  const pricePix = roundCurrency(Math.max(MIN_SITE_PRICE_PIX, costBase / PIX_PRICE_DIVISOR));
  const priceCard = calculateCardPrice(pricePix);
  const referencePrice = roundCurrency(
    Math.max(
      input.marketplaceSuggested || 0,
      input.priceCard || 0,
      input.pricePix || 0,
      pricePix * REFERENCE_PRICE_MULTIPLIER
    )
  );
  const profitAmount = roundCurrency(pricePix - costBase);

  return {
    costBase,
    pricePix,
    priceCard,
    referencePrice,
    profitAmount,
    marginPercent: TARGET_LIQUID_MARGIN,
  };
}

export function calculateSalePrice(
  grams: number,
  hours: number,
  complexity = 1,
  paymentMethod: "pix" | "cartao" | "boleto" = "pix",
  channel: "site" | "mercadolivre" | "shopee" | "whatsapp" = "site"
) {
  const base = calculateFinalPrice({ grams, hours, complexity }).pricePix;
  let price = base;
  if (paymentMethod === "cartao") price = calculateCardPrice(base);
  if (paymentMethod === "boleto") price *= BOLETO_MULTIPLIER;
  if (channel === "mercadolivre") price *= MARKETPLACE_PRICE_MULTIPLIER;
  if (channel === "shopee") price *= 1.12;
  return roundCurrency(price);
}

import { getCachedData, cacheKeys, cacheTtl } from './cache';

export type DynamicPricingOptions = {
  material: string;
  color: string;
  infill: number;
  layerHeight: number;
  supports: boolean;
  quantity: number;
  urgency: 'normal' | 'express' | 'sameDay';
};

export type ProductPricingInput = PricingInput & {
  options: DynamicPricingOptions;
  slug: string;
};

// Material cost multipliers
const MATERIAL_MULTIPLIERS: Record<string, number> = {
  'pla': 1.0,
  'petg': 1.15,
  'abs': 1.25,
  'tpu': 1.8,
  'resina': 2.5,
  'madeira': 1.3,
  'metal': 3.2,
};

// Color complexity factors
const COLOR_FACTORS: Record<string, number> = {
  'preto': 1.0,
  'branco': 1.0,
  'cinza': 1.05,
  'azul': 1.1,
  'vermelho': 1.1,
  'verde': 1.1,
  'amarelo': 1.15,
  'laranja': 1.15,
  'rosa': 1.2,
  'roxo': 1.2,
  'transparente': 1.25,
  'metalico': 1.4,
  'neon': 1.6,
};

// Infill cost adjustments
const INFILL_MULTIPLIERS: Record<number, number> = {
  10: 0.85,
  15: 0.9,
  20: 1.0,
  30: 1.15,
  40: 1.3,
  50: 1.45,
  70: 1.7,
  90: 1.9,
  100: 2.1,
};

// Urgency multipliers
const URGENCY_MULTIPLIERS: Record<string, number> = {
  'normal': 1.0,
  'express': 1.4,
  'sameDay': 2.2,
};

export function calculateDynamicPricing(input: ProductPricingInput) {
  const { options, ...baseInput } = input;
  
  // Apply material multiplier
  const materialMultiplier = MATERIAL_MULTIPLIERS[options.material.toLowerCase()] || 1.0;
  
  // Apply color factor
  const colorFactor = COLOR_FACTORS[options.color.toLowerCase()] || 1.1;
  
  // Apply infill multiplier
  const infillMultiplier = INFILL_MULTIPLIERS[options.infill] || 1.0;
  
  // Apply urgency multiplier
  const urgencyMultiplier = URGENCY_MULTIPLIERS[options.urgency] || 1.0;
  
  // Calculate complexity based on options
  let complexity = baseInput.complexity || 1;
  if (options.supports) complexity += 0.3;
  if (options.layerHeight < 0.2) complexity += 0.2;
  if (options.material === 'tpu' || options.material === 'resina') complexity += 0.4;
  
  // Adjust base cost with multipliers
  const adjustedBaseCost = baseInput.baseCost 
    ? baseInput.baseCost * materialMultiplier * colorFactor * infillMultiplier
    : undefined;
  
  const adjustedHours = baseInput.hours 
    ? baseInput.hours * urgencyMultiplier
    : undefined;
  
  // Calculate final pricing
  const pricing = calculateFinalPrice({
    ...baseInput,
    baseCost: adjustedBaseCost,
    hours: adjustedHours,
    complexity,
  });
  
  // Apply quantity discount (bulk pricing)
  let quantityDiscount = 1.0;
  if (options.quantity >= 10) quantityDiscount = 0.85;
  else if (options.quantity >= 5) quantityDiscount = 0.9;
  else if (options.quantity >= 3) quantityDiscount = 0.95;
  
  const finalPricePix = roundCurrency(pricing.pricePix * quantityDiscount);
  const finalPriceCard = calculateCardPrice(finalPricePix);
  
  return {
    ...pricing,
    pricePix: finalPricePix,
    priceCard: finalPriceCard,
    originalPricePix: pricing.pricePix,
    originalPriceCard: calculateCardPrice(pricing.pricePix),
    quantityDiscount: 1 - quantityDiscount,
    appliedMultipliers: {
      material: materialMultiplier,
      color: colorFactor,
      infill: infillMultiplier,
      urgency: urgencyMultiplier,
      quantity: quantityDiscount,
    },
    breakdown: {
      materialCost: roundCurrency((pricing.costBase * materialMultiplier) / 3),
      laborCost: roundCurrency((pricing.costBase * urgencyMultiplier) / 3),
      finishingCost: roundCurrency(pricing.costBase / 3),
    },
  };
}

export async function getProductPricing(slug: string, options: DynamicPricingOptions) {
  const cacheKey = `${cacheKeys.productPrice(slug, JSON.stringify(options))}`;
  
  return getCachedData(
    cacheKey,
    async () => {
      // Fetch product base data
      const response = await fetch(`/api/products/${slug}/pricing-data`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      
      const productData = await response.json();
      
      return calculateDynamicPricing({
        ...productData,
        options,
        slug,
      });
    },
    {
      memoryTtl: cacheTtl.medium,
      redisTtl: cacheTtl.long,
      tags: ['product-pricing', slug],
    }
  );
}

export function generatePricingCacheKey(slug: string, options: DynamicPricingOptions): string {
  return `${cacheKeys.productPrice(slug, JSON.stringify(options))}`;
}

export function buildFixedMarginNarrative(_costBase: number, pricePix: number) {
  return `Pix ${pricePix.toFixed(2).replace(".", ",")} protegido por custo completo: material, máquina, acabamento, ferragens, embalagem e insumos de envio, reserva para falhas, despesas indiretas e margem bruta mínima de 30%. Frete real separado.`;
}
