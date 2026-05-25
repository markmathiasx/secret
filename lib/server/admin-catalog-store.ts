import fs from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { MediaType, ProductStatus } from "@prisma/client";
import overridesJson from "@/data/admin-product-overrides.json";
import { catalog, type Product } from "@/lib/catalog";
import {
  DEFAULT_LABOR_HOURLY_RATE,
  DEFAULT_MACHINE_HOURLY_RATE,
  DEFAULT_SPOOL_PRICE_PER_KG,
  TARGET_LIQUID_MARGIN,
  calculateProductionCostRecommendation,
  roundCurrency,
} from "@/lib/pricing-engine";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { applyCatalogTaxonomy } from "@/lib/catalog-taxonomy";
import { slugify } from "@/lib/utils";
import type { AdminProductOverride, ProductionStage, RealImageStatusRecord, ProfitMode } from "@/types/admin-catalog";

const OVERRIDES_PATH = path.join(process.cwd(), "data", "admin-product-overrides.json");
const REAL_IMAGE_STATUS_PATH = path.join(process.cwd(), "data", "real-image-status.json");

export type AdminCatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  primaryCategory: string;
  productTypePath: string;
  buyingIntents: string[];
  objectType: string;
  useCaseTags: string[];
  seoKeywords: string[];
  tags: string[];
  confidence: string;
  classificationReason: string;
  taxonomyReviewRequested: boolean;
  collection: string;
  material: string;
  finish: string;
  status: Product["status"];
  stock: number;
  readyToShip: boolean;
  customizable: boolean;
  featured: boolean;
  costBase: number;
  pricePix: number;
  priceCard: number;
  referencePrice: number;
  marginPercent: number;
  estimatedGrams: number;
  estimatedHours: number;
  complexity: number;
  spoolPricePerKg: number;
  machineHourlyRate: number;
  postProcessMinutes: number;
  laborHourlyRate: number;
  packagingCost: number;
  overheadPercent: number;
  profitMode: ProfitMode;
  profitTargetPercent: number;
  estimatedProfitAmount: number;
  estimatedProfitPercent: number;
  costingUpdatedAt: string | null;
  productionStage: ProductionStage;
  imagePending: boolean;
  imageGallery: string[];
  imageSourceType: string | null;
  updatedAt: string | null;
};

const adminProductInclude = {
  category: true,
  collections: {
    include: {
      collection: true,
    },
  },
  media: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  inventory: true,
} satisfies Prisma.ProductInclude;

type AdminPrismaProduct = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

function normalizeProductionStage(value: string | undefined, readyToShip: boolean): ProductionStage {
  if (value === "recebido" || value === "imprimindo" || value === "pronto") return value;
  return readyToShip ? "pronto" : "recebido";
}

function deriveBaseCost(product: Product, override?: AdminProductOverride) {
  if (typeof override?.costBase === "number") return override.costBase;
  if (typeof override?.pricePix === "number") return Number((override.pricePix * 0.6).toFixed(2));
  if (typeof product.baseCost === "number") return product.baseCost;
  if (typeof product.estimatedUnitCost === "number") return product.estimatedUnitCost;
  return 0;
}

function decimalToNumber(value: Prisma.Decimal | number | null | undefined, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (value === null || value === undefined) return fallback;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function decimalToOptionalNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) return undefined;
  const numberValue = decimalToNumber(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function normalizeProfitMode(value: unknown): ProfitMode {
  return value === "markup" ? "markup" : "margin";
}

function mapStatusToLegacy(status: ProductStatus): Product["status"] {
  return status === ProductStatus.READY_TO_SHIP ? "Pronta entrega" : "Sob encomenda";
}

function mapPrismaProduct(record: AdminPrismaProduct): Product {
  const images = record.media
    .filter((item) => item.type === MediaType.IMAGE || item.type === MediaType.THUMBNAIL)
    .map((item) => item.url);

  const category = record.category?.name || "Catálogo";
  const collection = record.collections[0]?.collection.name || "Marketplace";

  return applyCatalogTaxonomy({
    id: record.id,
    slug: record.slug,
    sku: record.sku,
    name: record.title,
    category,
    subcategory: record.subcategory || category,
    theme: record.theme || category,
    collection,
    colors: record.colors,
    grams: record.grams,
    hours: decimalToNumber(record.hours),
    complexity: record.complexity,
    featured: record.featured,
    description: record.description,
    tags: record.tags,
    price: decimalToNumber(record.pricePix),
    printTime: record.printTimeLabel || `${decimalToNumber(record.hours)}h`,
    plaWeight: record.plaWeightLabel || `${record.grams}g`,
    dimensions: record.dimensions || "",
    images,
    licenseType: record.licenseType === "commercial" ? "commercial" : "personal",
    variants: [],
    pricePix: decimalToNumber(record.pricePix),
    priceCard: calculateCardPrice(decimalToNumber(record.pricePix)),
    marketplaceSuggested: decimalToNumber(record.marketplaceSuggested),
    productionWindow: record.productionWindow,
    imageHint: record.imageHint || record.title,
    image: images[0],
    imageAlt: record.imageAlt || undefined,
    material: record.material,
    finish: record.finish,
    status: mapStatusToLegacy(record.status),
    stock: record.inventory?.quantity ?? record.stock,
    customizable: record.customizable,
    readyToShip: record.readyToShip,
    baseCost: decimalToNumber(record.estimatedUnitCost),
    estimatedUnitCost: decimalToOptionalNumber(record.estimatedUnitCost),
    estimatedUnitProfit: decimalToOptionalNumber(record.estimatedUnitProfit),
    estimatedGrams: decimalToOptionalNumber(record.estimatedGrams),
    estimatedHours: decimalToOptionalNumber(record.estimatedHours),
    spoolPricePerKg: decimalToOptionalNumber(record.spoolPricePerKg),
    machineHourlyRate: decimalToOptionalNumber(record.machineHourlyRate),
    postProcessMinutes: record.postProcessMinutes ?? undefined,
    laborHourlyRate: decimalToOptionalNumber(record.laborHourlyRate),
    packagingCost: decimalToOptionalNumber(record.packagingCost),
    overheadPercent: decimalToOptionalNumber(record.overheadPercent),
    profitMode: record.profitMode ? normalizeProfitMode(record.profitMode) : undefined,
    profitTargetPercent: decimalToOptionalNumber(record.profitTargetPercent),
    estimatedProfitAmount: decimalToOptionalNumber(record.estimatedProfitAmount),
    estimatedProfitPercent: decimalToOptionalNumber(record.estimatedProfitPercent),
    costingUpdatedAt: record.costingUpdatedAt?.toISOString(),
  });
}

function buildAdminCatalogProduct(
  product: Product,
  override: AdminProductOverride | undefined,
  realImageStatus: RealImageStatusRecord | undefined
): AdminCatalogProduct {
  const title = override?.title ?? product.name;
  const description = override?.description ?? product.description;
  const status = override?.status ?? product.status;
  const readyToShip = override?.readyToShip ?? status === "Pronta entrega";
  const estimatedGrams = override?.estimatedGrams ?? product.estimatedGrams ?? product.grams;
  const estimatedHours = override?.estimatedHours ?? product.estimatedHours ?? product.hours;
  const complexity = override?.complexity ?? product.complexity ?? 1;
  const spoolPricePerKg = override?.spoolPricePerKg ?? product.spoolPricePerKg ?? DEFAULT_SPOOL_PRICE_PER_KG;
  const machineHourlyRate = override?.machineHourlyRate ?? product.machineHourlyRate ?? DEFAULT_MACHINE_HOURLY_RATE;
  const postProcessMinutes = override?.postProcessMinutes ?? product.postProcessMinutes ?? Math.round(Math.max(8, complexity * 10));
  const laborHourlyRate = override?.laborHourlyRate ?? product.laborHourlyRate ?? DEFAULT_LABOR_HOURLY_RATE;
  const packagingCost = override?.packagingCost ?? product.packagingCost ?? 2.5;
  const overheadPercent = override?.overheadPercent ?? product.overheadPercent ?? 12;
  const profitMode = normalizeProfitMode(override?.profitMode ?? product.profitMode);
  const profitTargetPercent = override?.profitTargetPercent ?? product.profitTargetPercent ?? TARGET_LIQUID_MARGIN * 100;
  const pricePix = override?.pricePix ?? product.pricePix;
  const priceCard = calculateCardPrice(pricePix);
  const recommendation = calculateProductionCostRecommendation({
    estimatedGrams,
    estimatedHours,
    complexity,
    spoolPricePerKg,
    machineHourlyRate,
    postProcessMinutes,
    laborHourlyRate,
    packagingCost,
    overheadPercent,
    profitMode,
    profitTargetPercent,
    pricePix,
    priceCard,
    marketplaceSuggested: product.marketplaceSuggested,
  });
  const estimatedProfitAmount = override?.estimatedProfitAmount ?? product.estimatedProfitAmount ?? roundCurrency(pricePix - recommendation.totalCost);
  const estimatedProfitPercent =
    override?.estimatedProfitPercent ??
    product.estimatedProfitPercent ??
    (pricePix > 0 ? roundCurrency((estimatedProfitAmount / pricePix) * 100) : 0);

  return {
    id: product.id,
    slug: `${product.id}-${product.slug || slugify(title)}`,
    title,
    description,
    category: override?.category ?? product.category,
    subcategory: override?.subcategory ?? product.subcategory,
    primaryCategory: override?.primaryCategory ?? product.primaryCategory ?? product.category,
    productTypePath: override?.productTypePath ?? product.productTypePath ?? `Catálogo > ${product.category} > ${product.subcategory}`,
    buyingIntents: override?.buyingIntents ?? product.buyingIntents ?? [],
    objectType: override?.objectType ?? product.objectType ?? "outro",
    useCaseTags: override?.useCaseTags ?? product.useCaseTags ?? [],
    seoKeywords: override?.seoKeywords ?? product.seoKeywords ?? [],
    tags: override?.tags ?? product.tags ?? [],
    confidence: override?.confidence ?? product.confidence ?? "low",
    classificationReason: override?.classificationReason ?? product.classificationReason ?? "Sem classificação registrada.",
    taxonomyReviewRequested: override?.taxonomyReviewRequested ?? product.taxonomyReviewRequested ?? false,
    collection: override?.collection ?? product.collection,
    material: override?.material ?? product.material,
    finish: override?.finish ?? product.finish,
    status,
    stock: typeof override?.stock === "number" ? override.stock : product.stock,
    readyToShip,
    customizable: override?.customizable ?? product.customizable,
    featured: override?.featured ?? product.featured,
    costBase: recommendation.totalCost || deriveBaseCost(product, override),
    pricePix,
    priceCard,
    referencePrice: recommendation.referencePrice,
    marginPercent: estimatedProfitPercent / 100,
    estimatedGrams,
    estimatedHours,
    complexity,
    spoolPricePerKg,
    machineHourlyRate,
    postProcessMinutes,
    laborHourlyRate,
    packagingCost,
    overheadPercent,
    profitMode,
    profitTargetPercent,
    estimatedProfitAmount,
    estimatedProfitPercent,
    costingUpdatedAt: override?.costingUpdatedAt || product.costingUpdatedAt || null,
    productionStage: normalizeProductionStage(override?.productionStage, readyToShip),
    imagePending: !realImageStatus,
    imageGallery: realImageStatus?.gallery || product.images || [],
    imageSourceType: realImageStatus?.sourceType || null,
    updatedAt: override?.updatedAt || null,
  };
}

async function readOverridesFile() {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    return JSON.parse(raw) as Record<string, AdminProductOverride>;
  } catch {
    return overridesJson as unknown as Record<string, AdminProductOverride>;
  }
}

async function writeOverridesFile(value: Record<string, AdminProductOverride>) {
  await fs.writeFile(OVERRIDES_PATH, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readRealImageStatusFile() {
  try {
    const raw = await fs.readFile(REAL_IMAGE_STATUS_PATH, "utf8");
    return JSON.parse(raw) as Record<string, RealImageStatusRecord>;
  } catch {
    return {} as Record<string, RealImageStatusRecord>;
  }
}

export async function getAdminCatalogSnapshot() {
  const overrides = await readOverridesFile();
  const realImageStatusMap = await readRealImageStatusFile();

  if (await canConnectToDatabase()) {
    try {
      const records = await prisma.product.findMany({
        include: adminProductInclude,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      });
      if (records.length) {
        return records
          .map((record) => {
            const product = mapPrismaProduct(record);
            return buildAdminCatalogProduct(product, overrides[product.id], realImageStatusMap[product.id]);
          })
          .sort(sortAdminProducts);
      }
    } catch {
      // Keep local override fallback available for development and degraded DB modes.
    }
  }

  return catalog
    .map((product) => buildAdminCatalogProduct(product, overrides[product.id], realImageStatusMap[product.id]))
    .sort(sortAdminProducts);
}

function sortAdminProducts(left: AdminCatalogProduct, right: AdminCatalogProduct) {
  if (left.imagePending !== right.imagePending) return Number(left.imagePending) - Number(right.imagePending);
  if (left.readyToShip !== right.readyToShip) return Number(right.readyToShip) - Number(left.readyToShip);
  return left.title.localeCompare(right.title);
}

export async function updateAdminCatalogProduct(productId: string, patch: Partial<AdminProductOverride>) {
  const product = catalog.find((item) => item.id === productId);
  if (!product) {
    throw new Error("Produto não encontrado.");
  }

  const overrides = await readOverridesFile();
  const current = overrides[productId] || { id: productId };
  const next: AdminProductOverride = {
    ...current,
    ...patch,
    id: productId,
    updatedAt: new Date().toISOString(),
  };

  overrides[productId] = next;
  await writeOverridesFile(overrides);

  const realImageStatusMap = await readRealImageStatusFile();
  return buildAdminCatalogProduct(product, next, realImageStatusMap[productId]);
}
