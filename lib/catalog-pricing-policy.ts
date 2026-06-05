import type { Product } from "@/lib/catalog";
import { calculateCardPrice, normalizeMoney, roundToCents } from "@/lib/payment-pricing";

const DEFAULTS = {
  spoolPricePerKg: 100,
  machineHourlyRate: 4.5,
  laborHourlyRate: 15,
  packagingCostSmall: 1.5,
  packagingCostMedium: 2.5,
  overheadPercent: 8,
};

type PriceBand = {
  id: string;
  label: string;
  min: number;
  max: number;
  minimumMargin: number;
  preservePremium?: boolean;
};

const BASE_VALUE_MARGIN = 0;
const OPEN_PRICE_CEILING = 100000;

function textBlob(product: Pick<Product, "name" | "category" | "subcategory" | "collection" | "tags" | "finish" | "material">) {
  return [
    product.name,
    product.category,
    product.subcategory,
    product.collection,
    product.finish,
    product.material,
    ...(product.tags || []),
  ]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(blob: string, values: string[]) {
  return values.some((value) => blob.includes(value));
}

export function getCommercialPriceBand(product: Product): PriceBand {
  const blob = textBlob(product);
  const grams = normalizeMoney(product.estimatedGrams ?? product.grams);
  const premium = includesAny(blob, ["premium", "pintad", "silk", "custom", "personaliz", "colecionavel", "colecionáveis"]);
  const batch = includesAny(blob, ["lote", "brinde", "corporativo", "atacado"]);
  const madeToMeasure = includesAny(blob, ["sob medida", "stl", "3mf", "obj", "step", "iges"]);

  if (madeToMeasure) {
    return { id: "sob-medida", label: "Sob medida", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN, preservePremium: true };
  }

  if (batch) {
    return { id: "lote", label: "Lotes e brindes", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
  }

  if (includesAny(blob, ["chaveiro", "pingente", "tag"])) {
    return grams > 45 || product.customizable
      ? { id: "chaveiro-personalizado", label: "Chaveiro maior/personalizado", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN }
      : { id: "chaveiro-simples", label: "Chaveiro simples", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
  }

  if (includesAny(blob, ["setup", "home office", "controle", "fone", "cabo", "mesa", "suporte"])) {
    return { id: "setup-pequeno", label: "Setup pequeno", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
  }

  if (includesAny(blob, ["casa", "organiz", "cozinha", "banheiro", "gaveta", "parede", "gancho", "porta "])) {
    return grams <= 55
      ? { id: "mini-utilidade", label: "Mini utilidade", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN }
      : { id: "casa-organizacao", label: "Casa e organização", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
  }

  if (product.customizable && !premium) {
    return { id: "personalizado", label: "Personalizado", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN, preservePremium: true };
  }

  if (includesAny(blob, ["geek", "anime", "chibi", "miniatura", "decor", "colec", "pokemon", "nintendo", "dragon", "dragao"])) {
    if (premium || grams > 90) {
      return { id: "geek-premium", label: "Geek premium/pintado", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN, preservePremium: true };
    }
    if (grams > 55) {
      return { id: "geek-medio", label: "Geek médio", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN, preservePremium: true };
    }
    return { id: "geek-simples", label: "Geek simples", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
  }

  return { id: "entrada", label: "Produto de entrada", min: 0.01, max: OPEN_PRICE_CEILING, minimumMargin: BASE_VALUE_MARGIN };
}

export function getMinimumSafePrice(product: Product) {
  const band = getCommercialPriceBand(product);
  const explicitCost = normalizeMoney(product.estimatedUnitCost ?? product.baseCost);

  if (product.manualPriceOverride && explicitCost > 0) {
    return {
      filament: 0,
      machine: 0,
      labor: 0,
      packaging: 0,
      overhead: 0,
      totalCost: explicitCost,
      minimumMargin: band.minimumMargin,
      minimumSafePrice: roundToCents(explicitCost * (1 + band.minimumMargin)),
    };
  }

  const grams = Math.max(0, normalizeMoney(product.estimatedGrams ?? product.grams));
  const hours = Math.max(0, normalizeMoney(product.estimatedHours ?? product.hours));
  const complexity = Math.max(1, normalizeMoney(product.complexity || 1));
  const spoolPricePerKg = Math.max(1, normalizeMoney(product.spoolPricePerKg) || DEFAULTS.spoolPricePerKg);
  const machineHourlyRate = Math.max(0, normalizeMoney(product.machineHourlyRate) || DEFAULTS.machineHourlyRate);
  const laborHourlyRate = Math.max(0, normalizeMoney(product.laborHourlyRate) || DEFAULTS.laborHourlyRate);
  const postProcessMinutes = Math.max(0, normalizeMoney(product.postProcessMinutes) || Math.round(Math.max(8, complexity * 10)));
  const packagingCost =
    normalizeMoney(product.packagingCost) ||
    (grams > 80 || band.preservePremium ? DEFAULTS.packagingCostMedium : DEFAULTS.packagingCostSmall);
  const overheadPercent = Math.min(300, Math.max(0, normalizeMoney(product.overheadPercent) || DEFAULTS.overheadPercent));

  const filament = roundToCents(grams * (spoolPricePerKg / 1000));
  const machine = roundToCents(hours * machineHourlyRate);
  const labor = roundToCents((postProcessMinutes / 60) * laborHourlyRate);
  const subtotal = roundToCents(filament + machine + labor + packagingCost);
  const overhead = roundToCents(subtotal * (overheadPercent / 100));
  const totalCost = roundToCents(subtotal + overhead);
  const minimumSafePrice = roundToCents(totalCost * (1 + band.minimumMargin));

  return {
    filament,
    machine,
    labor,
    packaging: roundToCents(packagingCost),
    overhead,
    totalCost,
    minimumMargin: band.minimumMargin,
    minimumSafePrice,
  };
}

export function getRecommendedPixPrice(product: Product) {
  const cost = getMinimumSafePrice(product);
  return roundToCents(Math.max(0.01, cost.minimumSafePrice));
}

export function getRecommendedCardPrice(product: Product) {
  return calculateCardPrice(getRecommendedPixPrice(product));
}
