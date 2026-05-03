export type PricingInput = {
  grams?: number;
  hours?: number;
  complexity?: number;
  baseCost?: number;
  estimatedUnitCost?: number;
  pricePix?: number;
  priceCard?: number;
  marketplaceSuggested?: number;
};

export const TARGET_LIQUID_MARGIN = 0.5;
export const PIX_PRICE_DIVISOR = 1 - TARGET_LIQUID_MARGIN;
export const CARD_MULTIPLIER = 1.12;
export const BOLETO_MULTIPLIER = 1.08;
export const MARKETPLACE_PRICE_MULTIPLIER = 1.15;
export const REFERENCE_PRICE_MULTIPLIER = 1.18;
export const FIXED_MARGIN_BADGE_LABEL = "Preco auditado";
export const LOCAL_PRODUCTION_BADGE_LABEL = "Produção local RJ";
export const MIN_SITE_PRICE_PIX = 39.9;

const filamentCostPerGram = 0.15;

export function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateBaseCost(grams = 0, hours = 0, complexity = 1) {
  const material = Math.max(0, grams) * filamentCostPerGram;
  const machine = Math.max(5, Math.max(0, hours) * 6.9);
  const finishing = Math.max(4.5, Math.max(1, complexity) * 4.8);
  return roundCurrency(material + machine + finishing);
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
  const costBase = resolveBaseCost(input);
  const pricePix = roundCurrency(Math.max(MIN_SITE_PRICE_PIX, costBase / PIX_PRICE_DIVISOR));
  const priceCard = roundCurrency(pricePix * CARD_MULTIPLIER);
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
  if (paymentMethod === "cartao") price *= CARD_MULTIPLIER;
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
  const finalPriceCard = roundCurrency(pricing.priceCard * quantityDiscount);
  
  return {
    ...pricing,
    pricePix: finalPricePix,
    priceCard: finalPriceCard,
    originalPricePix: pricing.pricePix,
    originalPriceCard: pricing.priceCard,
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
  return `Preco Pix calculado em R$ ${pricePix.toFixed(2)} com base em material, tempo de producao e acabamento estimados para a peca.`;
}
