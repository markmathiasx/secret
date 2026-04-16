type PricingInput = {
  grams?: number;
  hours?: number;
  complexity?: number;
  baseCost?: number;
  estimatedUnitCost?: number;
  pricePix?: number;
  priceCard?: number;
  marketplaceSuggested?: number;
};

export const TARGET_LIQUID_MARGIN = 0.4;
export const PIX_PRICE_DIVISOR = 1 - TARGET_LIQUID_MARGIN;
export const CARD_MULTIPLIER = 1.12;
export const BOLETO_MULTIPLIER = 1.08;
export const MARKETPLACE_PRICE_MULTIPLIER = 1.15;
export const REFERENCE_PRICE_MULTIPLIER = 1.18;
export const FIXED_MARGIN_BADGE_LABEL = "Preco auditado";
export const LOCAL_PRODUCTION_BADGE_LABEL = "Produção local RJ";

const filamentCostPerGram = 0.11;

export function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateBaseCost(grams = 0, hours = 0, complexity = 1) {
  const material = Math.max(0, grams) * filamentCostPerGram;
  const machine = Math.max(2, Math.max(0, hours) * 2.75);
  const finishing = Math.max(1.5, Math.max(1, complexity) * 2.2);
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
  const pricePix = roundCurrency(costBase / PIX_PRICE_DIVISOR);
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

export function buildFixedMarginNarrative(_costBase: number, pricePix: number) {
  return `Preco Pix calculado em R$ ${pricePix.toFixed(2)} com base em material, tempo de producao e acabamento estimados para a peca.`;
}
