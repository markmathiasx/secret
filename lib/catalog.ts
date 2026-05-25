import { deliveryZones } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { getProductCardDescription, getProductSearchScore, normalizeProductCategory } from "@/lib/catalog-content";
import { suggestPixPrice, type MarketBenchmark } from "@/lib/market-pricing";
import { applyCatalogMedia } from "@/lib/catalog-media";
import {
  applyCatalogTaxonomy,
  normalizePublicTaxonomyText,
  type BuyingIntent,
  type CatalogPrimaryCategory,
  type ProductObjectType,
  type TaxonomyConfidence,
} from "@/lib/catalog-taxonomy";
import { getProductVisual } from "@/lib/product-visuals";
import { applyA1MiniProfile } from "@/lib/a1-mini-catalog";
import adminProductOverridesJson from "@/data/admin-product-overrides.json";
import type { AdminProductOverride, ProductionStage, ProfitMode } from "@/types/admin-catalog";
import {
  buildFixedMarginNarrative,
  calculateBaseCost as calculateBaseCostFromEngine,
  calculateFinalPrice,
  calculateSalePrice as calculateSalePriceFromEngine,
} from "@/lib/pricing-engine";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { getRecommendedPixPrice } from "@/lib/catalog-pricing-policy";
import { sanitizePublicCatalogProducts } from "@/lib/public-product-copy";
import { professionalCatalogData } from "./professional-catalog-data";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";
export type Product = {
  id: string;
  slug?: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  primaryCategory?: CatalogPrimaryCategory;
  productTypePath?: string;
  buyingIntents?: BuyingIntent[];
  objectType?: ProductObjectType;
  useCaseTags?: string[];
  seoKeywords?: string[];
  confidence?: TaxonomyConfidence;
  classificationReason?: string;
  taxonomyReviewRequested?: boolean;
  theme: string;
  collection: string;
  colors: string[];
  grams: number;
  hours: number;
  complexity: number;
  featured: boolean;
  description: string;
  tags: string[];
  price?: number;
  printTime?: string;
  plaWeight?: string;
  dimensions: string;
  images: string[];
  licenseType?: 'personal' | 'commercial';
  variants?: { color: string; available: boolean }[];
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  image?: string;
  imageAlt?: string;
  material: string;
  finish: string;
  status: "Pronta entrega" | "Sob encomenda";
  stock: number;
  customizable: boolean;
  readyToShip?: boolean;
  productionStage?: ProductionStage;
  baseCost?: number;
  estimatedUnitCost?: number;
  estimatedUnitProfit?: number;
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
  costingUpdatedAt?: string;
  manualPriceOverride?: boolean;
  pricingMode?: "faixa-auditada" | "referencia-de-encomenda";
  pricingNarrative?: string;
  marketBenchmark?: MarketBenchmark;
  csvMeta?: {
    sourceProductLink?: string;
    sourceMarketplaceHint?: string;
    sourceLang?: string;
    compatibilityNotes?: string;
    crossSellSkus?: string[];
    pricingStrategyNotes?: string;
    marginPctSuggested?: number;
    priceLowBrl?: number;
    priceHighBrl?: number;
    shippingWeightG?: number;
    shippingLengthCm?: number;
    shippingWidthCm?: number;
    shippingHeightCm?: number;
    mediaVerified?: boolean;
  };
  estimatedGrams?: number;
  filamentCostBrl?: number;
  minimumSalePriceBrl?: number;
  finalPriceBrl?: number;
  makerWorldMeta?: {
    niche: string;
    nicheKey: string;
    sourceTitle: string;
    sourceProductLink: string;
    sourceImageUrl: string;
    commercialLicensePriority: string;
    pricingPreset: string;
    longDescription: string;
  };
};

const adminProductOverrides = adminProductOverridesJson as unknown as Record<string, AdminProductOverride>;

function applyAdminOverride(product: Product): Product {
  const override = adminProductOverrides[product.id];
  if (!override) return product;

  const derivedBaseCost =
    typeof override.costBase === "number"
      ? override.costBase
      : typeof override.pricePix === "number"
        ? Number((override.pricePix * 0.6).toFixed(2))
        : product.baseCost;
  const nextStatus = override.status ?? product.status;
  const manualPriceOverride = override.pricePix !== undefined;
  const overridePricePix = override.pricePix ?? product.pricePix;

  return {
    ...product,
    name: override.title ?? product.name,
    description: normalizePublicTaxonomyText(override.description ?? product.description),
    category: override.category ?? product.category,
    subcategory: override.subcategory ?? product.subcategory,
    primaryCategory: (override.primaryCategory as CatalogPrimaryCategory | undefined) ?? product.primaryCategory,
    productTypePath: override.productTypePath ?? product.productTypePath,
    buyingIntents: (override.buyingIntents as BuyingIntent[] | undefined) ?? product.buyingIntents,
    objectType: (override.objectType as ProductObjectType | undefined) ?? product.objectType,
    useCaseTags: override.useCaseTags ?? product.useCaseTags,
    seoKeywords: override.seoKeywords ?? product.seoKeywords,
    confidence: override.confidence ?? product.confidence,
    classificationReason: override.classificationReason ?? product.classificationReason,
    taxonomyReviewRequested: override.taxonomyReviewRequested ?? product.taxonomyReviewRequested,
    collection: override.collection ?? product.collection,
    tags: override.tags ?? product.tags,
    material: override.material ?? product.material,
    finish: override.finish ?? product.finish,
    status: nextStatus,
    stock: typeof override.stock === "number" ? override.stock : product.stock,
    readyToShip: override.readyToShip ?? (nextStatus === "Pronta entrega"),
    customizable: override.customizable ?? product.customizable,
    featured: override.featured ?? product.featured,
    baseCost: derivedBaseCost,
    pricePix: overridePricePix,
    priceCard: calculateCardPrice(overridePricePix),
    grams: Math.round(override.estimatedGrams ?? product.grams),
    hours: override.estimatedHours ?? product.hours,
    complexity: override.complexity ?? product.complexity,
    estimatedGrams: override.estimatedGrams ?? product.estimatedGrams,
    estimatedHours: override.estimatedHours ?? product.estimatedHours,
    spoolPricePerKg: override.spoolPricePerKg ?? product.spoolPricePerKg,
    machineHourlyRate: override.machineHourlyRate ?? product.machineHourlyRate,
    postProcessMinutes: override.postProcessMinutes ?? product.postProcessMinutes,
    laborHourlyRate: override.laborHourlyRate ?? product.laborHourlyRate,
    packagingCost: override.packagingCost ?? product.packagingCost,
    overheadPercent: override.overheadPercent ?? product.overheadPercent,
    profitMode: override.profitMode ?? product.profitMode,
    profitTargetPercent: override.profitTargetPercent ?? product.profitTargetPercent,
    estimatedProfitAmount: override.estimatedProfitAmount ?? product.estimatedProfitAmount,
    estimatedProfitPercent: override.estimatedProfitPercent ?? product.estimatedProfitPercent,
    costingUpdatedAt: override.costingUpdatedAt ?? product.costingUpdatedAt,
    manualPriceOverride,
    productionStage: override.productionStage ?? product.productionStage,
  };
}

function enrichProduct(product: Product): Product {
  const overridden = applyA1MiniProfile(applyAdminOverride(product));
  const normalized = {
    ...overridden,
    category: normalizeProductCategory(overridden),
    description: normalizePublicTaxonomyText(getProductCardDescription(overridden)),
  };
  const taxonomized = applyCatalogTaxonomy(normalized);

  const visual = getProductVisual(taxonomized);
  const marketPricing = suggestPixPrice(
    taxonomized,
    calculateBaseCostFromEngine(taxonomized.grams, taxonomized.hours, taxonomized.complexity),
    visual.kind
  );
  const pricing = calculateFinalPrice({
    ...taxonomized,
    baseCost: taxonomized.baseCost,
    estimatedUnitCost: taxonomized.estimatedUnitCost,
    estimatedGrams: taxonomized.estimatedGrams,
    estimatedHours: taxonomized.estimatedHours,
    spoolPricePerKg: taxonomized.spoolPricePerKg,
    machineHourlyRate: taxonomized.machineHourlyRate,
    postProcessMinutes: taxonomized.postProcessMinutes,
    laborHourlyRate: taxonomized.laborHourlyRate,
    packagingCost: taxonomized.packagingCost,
    overheadPercent: taxonomized.overheadPercent,
    profitMode: taxonomized.profitMode,
    profitTargetPercent: taxonomized.profitTargetPercent,
  });
  const policyPricePix = getRecommendedPixPrice({
    ...taxonomized,
    baseCost: pricing.costBase,
    estimatedUnitCost: pricing.costBase,
  });
  const pricePix = taxonomized.manualPriceOverride ? taxonomized.pricePix : policyPricePix;
  const priceCard = calculateCardPrice(pricePix);
  const profitAmount = Number((pricePix - pricing.costBase).toFixed(2));

  return {
    ...taxonomized,
    price: pricePix,
    baseCost: pricing.costBase,
    pricePix,
    priceCard,
    marketplaceSuggested: pricing.referencePrice,
    estimatedUnitCost: pricing.costBase,
    estimatedUnitProfit: profitAmount,
    pricingMode: "faixa-auditada",
    pricingNarrative: buildFixedMarginNarrative(pricing.costBase, pricePix),
    marketBenchmark: marketPricing.benchmark,
  };
}

export function calculateSalePrice(
  grams: number,
  hours: number,
  complexity = 1,
  paymentMethod: PaymentMethod = "pix",
  channel: SalesChannel = "site"
) {
  return calculateSalePriceFromEngine(grams, hours, complexity, paymentMethod, channel);
}

export const calculateBaseCost = calculateBaseCostFromEngine;

const fullCatalog = professionalCatalogData.map((data) => {
  const product = {
    slug: slugify(data.name || ""),
    theme: "Professional",
    subcategory: "Premium",
    colors: ["Preto", "Branco", "Cinza", "Silk Silver", "Silk Gold"],
    images: [`https://picsum.photos/seed/${data.id}/1600/1600`],
    licenseType: "personal" as const,
    variants: [
      { color: "Preto", available: true },
      { color: "Branco", available: true },
    ],
    productionStage: "draft" as ProductionStage,
    ...data,
  } as Product;

  return applyCatalogMedia(enrichProduct(product), { preserveExisting: true });
});

export const catalog = sanitizePublicCatalogProducts(fullCatalog);
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 12);
export const categories = Array.from(new Set(catalog.map((item) => item.category)));
export const collections = Array.from(new Set(catalog.map((item) => item.collection)));

export function getProductUrl(product: Product) {
  return `/loja/${slugify(product.category)}/${product.id}-${product.slug || slugify(product.name)}`;
}

export function findProduct(id: string) {
  return catalog.find((item) => item.id === id);
}

export function findProductBySlug(slug: string) {
  return catalog.find((item) => slug === item.slug || slug.startsWith(`${item.id}-`) || getProductUrl(item).endsWith(slug));
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return catalog;
  return catalog
    .map((item) => ({ item, score: getProductSearchScore(item, normalized) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.id.localeCompare(a.item.id))
    .map(({ item }) => item);
}

export const defaultPricingExamples = [
  { title: "Chibi premium", grams: 32, hours: 1.9, complexity: 1.1 },
  { title: "Suporte de controle", grams: 92, hours: 3.2, complexity: 1.35 },
  { title: "Vaso geométrico", grams: 96, hours: 3.8, complexity: 1.4 },
  { title: "Nome 3D personalizado", grams: 86, hours: 3.2, complexity: 1.3 },
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site"),
}));

export const deliverySummary = [...deliveryZones];
