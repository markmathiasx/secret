import type { Product } from "@/lib/catalog";
import { calculateCardPrice, normalizeMoney, roundToCents } from "@/lib/payment-pricing";

export const COMMERCIAL_PRICE_POINTS = [
  19.9,
  24.9,
  29.9,
  34.9,
  39.9,
  44.9,
  49.9,
  59.9,
  69.9,
  79.9,
  89.9,
  99.9,
  119.9,
  149.9,
  199.9,
] as const;

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
    return { id: "sob-medida", label: "Sob medida", min: 69.9, max: 199.9, minimumMargin: 0.4, preservePremium: true };
  }

  if (batch) {
    return { id: "lote", label: "Lotes e brindes", min: 24.9, max: 89.9, minimumMargin: 0.25 };
  }

  if (includesAny(blob, ["chaveiro", "pingente", "tag"])) {
    return grams > 45 || product.customizable
      ? { id: "chaveiro-personalizado", label: "Chaveiro maior/personalizado", min: 29.9, max: 39.9, minimumMargin: 0.3 }
      : { id: "chaveiro-simples", label: "Chaveiro simples", min: 19.9, max: 29.9, minimumMargin: 0.3 };
  }

  if (includesAny(blob, ["setup", "home office", "controle", "fone", "cabo", "mesa", "suporte"])) {
    return { id: "setup-pequeno", label: "Setup pequeno", min: 29.9, max: 59.9, minimumMargin: 0.3 };
  }

  if (includesAny(blob, ["casa", "organiz", "cozinha", "banheiro", "gaveta", "parede", "gancho", "porta "])) {
    return grams <= 55
      ? { id: "mini-utilidade", label: "Mini utilidade", min: 24.9, max: 39.9, minimumMargin: 0.3 }
      : { id: "casa-organizacao", label: "Casa e organização", min: 29.9, max: 49.9, minimumMargin: 0.3 };
  }

  if (product.customizable && !premium) {
    return { id: "personalizado", label: "Personalizado", min: 69.9, max: 149.9, minimumMargin: 0.4, preservePremium: true };
  }

  if (includesAny(blob, ["geek", "anime", "chibi", "miniatura", "decor", "colec", "pokemon", "nintendo", "dragon", "dragao"])) {
    if (premium || grams > 90) {
      return { id: "geek-premium", label: "Geek premium/pintado", min: 99.9, max: 159.9, minimumMargin: 0.4, preservePremium: true };
    }
    if (grams > 55) {
      return { id: "geek-medio", label: "Geek médio", min: 69.9, max: 99.9, minimumMargin: 0.35, preservePremium: true };
    }
    return { id: "geek-simples", label: "Geek simples", min: 39.9, max: 69.9, minimumMargin: 0.35 };
  }

  return { id: "entrada", label: "Produto de entrada", min: 24.9, max: 49.9, minimumMargin: 0.3 };
}

export function getMinimumSafePrice(product: Product) {
  const band = getCommercialPriceBand(product);
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
  const minimumSafePrice = roundToCents(totalCost / (1 - band.minimumMargin));

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

function roundUpToCommercialPoint(value: number) {
  const normalized = normalizeMoney(value);
  return COMMERCIAL_PRICE_POINTS.find((price) => price >= normalized) ?? roundToCents(Math.ceil(normalized / 10) * 10 - 0.1);
}

function nearestCommercialPoint(value: number) {
  const normalized = normalizeMoney(value);
  return COMMERCIAL_PRICE_POINTS.reduce((best, current) => (
    Math.abs(current - normalized) < Math.abs(best - normalized) ? current : best
  ), COMMERCIAL_PRICE_POINTS[0]);
}

function clampToBand(product: Product, band: PriceBand, floor: number) {
  const current = normalizeMoney(product.pricePix || product.price || band.min);
  const minimum = roundUpToCommercialPoint(Math.max(band.min, floor));

  if (band.preservePremium) {
    const protectedCurrent = current >= band.min && current <= band.max ? current : Math.min(Math.max(current, band.min), band.max);
    return roundUpToCommercialPoint(Math.max(minimum, nearestCommercialPoint(protectedCurrent)));
  }

  if (current > band.max) return roundUpToCommercialPoint(Math.max(minimum, band.max));
  if (current < band.min) return minimum;
  return roundUpToCommercialPoint(Math.max(minimum, nearestCommercialPoint(current)));
}

export function getRecommendedPixPrice(product: Product) {
  const band = getCommercialPriceBand(product);
  const cost = getMinimumSafePrice(product);
  return clampToBand(product, band, cost.minimumSafePrice);
}

export function getRecommendedCardPrice(product: Product) {
  return calculateCardPrice(getRecommendedPixPrice(product));
}
