import fs from "node:fs/promises";
import path from "node:path";
import overridesJson from "@/data/admin-product-overrides.json";
import { catalog, type Product } from "@/lib/catalog";
import { calculateFinalPrice } from "@/lib/pricing-engine";
import { slugify } from "@/lib/utils";
import type { AdminProductOverride, ProductionStage, RealImageStatusRecord } from "@/types/admin-catalog";

const OVERRIDES_PATH = path.join(process.cwd(), "data", "admin-product-overrides.json");
const REAL_IMAGE_STATUS_PATH = path.join(process.cwd(), "data", "real-image-status.json");

export type AdminCatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
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
  productionStage: ProductionStage;
  imagePending: boolean;
  imageGallery: string[];
  imageSourceType: string | null;
  updatedAt: string | null;
};

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

function buildAdminCatalogProduct(
  product: Product,
  override: AdminProductOverride | undefined,
  realImageStatus: RealImageStatusRecord | undefined
): AdminCatalogProduct {
  const title = override?.title ?? product.name;
  const description = override?.description ?? product.description;
  const status = override?.status ?? product.status;
  const readyToShip = override?.readyToShip ?? status === "Pronta entrega";
  const pricing = calculateFinalPrice({
    baseCost: deriveBaseCost(product, override),
    estimatedUnitCost: deriveBaseCost(product, override),
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    marketplaceSuggested: product.marketplaceSuggested,
  });

  return {
    id: product.id,
    slug: `${product.id}-${product.slug || slugify(title)}`,
    title,
    description,
    category: override?.category ?? product.category,
    collection: override?.collection ?? product.collection,
    material: override?.material ?? product.material,
    finish: override?.finish ?? product.finish,
    status,
    stock: typeof override?.stock === "number" ? override.stock : product.stock,
    readyToShip,
    customizable: override?.customizable ?? product.customizable,
    featured: override?.featured ?? product.featured,
    costBase: pricing.costBase,
    pricePix: pricing.pricePix,
    priceCard: pricing.priceCard,
    referencePrice: pricing.referencePrice,
    marginPercent: pricing.marginPercent,
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

  return catalog
    .map((product) => buildAdminCatalogProduct(product, overrides[product.id], realImageStatusMap[product.id]))
    .sort((left, right) => {
      if (left.imagePending !== right.imagePending) return Number(left.imagePending) - Number(right.imagePending);
      if (left.readyToShip !== right.readyToShip) return Number(right.readyToShip) - Number(left.readyToShip);
      return left.title.localeCompare(right.title);
    });
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
