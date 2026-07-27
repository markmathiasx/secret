import { getProductUrl, type Product } from "@/lib/catalog";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { calculateCardPrice, normalizeMoney } from "@/lib/payment-pricing";
import { getProductAvailabilityMode, getPublicAvailabilityLabel, getPublicStockQuantity } from "@/lib/product-availability";
import { slugify } from "@/lib/utils";
import type { ProductMasterRecord } from "./types";

const UNSAFE_LINK = /^(?:blob:|data:|javascript:)|localhost|127\.0\.0\.1|0\.0\.0\.0/i;

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeStatus(product: Pick<ProductMasterRecord, "availabilityMode"> & { status?: string | null }) {
  const availabilityLabel = getPublicAvailabilityLabel(product);
  if (availabilityLabel === "Pronta entrega") return "Pronta entrega";
  if (availabilityLabel === "Sob encomenda") return "Sob encomenda";
  return "Indisponivel";
}

function compactImages(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (value ? [value] : []))
        .map(cleanText)
        .filter((value) => value && !UNSAFE_LINK.test(value))
    )
  );
}

export function isUnsafePublicLink(value: string | undefined) {
  return Boolean(value && UNSAFE_LINK.test(value));
}

export function normalizePublicCatalogProduct(product: Product): ProductMasterRecord {
  const pricePix = normalizeMoney(product.pricePix ?? product.price ?? 0);
  const images = compactImages([product.image, ...(product.images || [])]);
  const slug = product.slug || slugify(product.name);
  const productUrl = getProductUrl({ ...product, slug });
  const availabilityMode = getProductAvailabilityMode(product);

  return {
    id: product.id,
    slug,
    sku: product.sku,
    name: cleanText(product.name),
    category: cleanText(product.category),
    subcategory: cleanText(product.subcategory),
    description: cleanText(product.description),
    tags: Array.from(new Set(product.tags || [])),
    pricePix,
    priceCard: calculateCardPrice(pricePix),
    stock: getPublicStockQuantity({ ...product, availabilityMode }),
    availabilityMode,
    status: normalizeStatus({ availabilityMode, status: product.status }),
    productionWindow: cleanText(product.productionWindow || product.printTime || "2 a 5 dias uteis"),
    dimensions: { label: cleanText(product.dimensions) },
    weightKg: product.grams ? Number((product.grams / 1000).toFixed(3)) : undefined,
    images,
    primaryImage: images[0],
    seoTitle: `${cleanText(product.name)} | MDH3D`,
    seoDescription: cleanText(product.description).slice(0, 155),
    source: "public-catalog",
    productUrl,
    whatsappEligible: true,
  };
}

export function normalizeSmartStoreProduct(product: SmartStoreProduct): ProductMasterRecord {
  const pricePix = normalizeMoney(product.pixPrice);
  const images = compactImages([product.image, ...(product.gallery || [])]);
  const availabilityMode: ProductMasterRecord["availabilityMode"] = product.stock > 0 ? "in_stock" : "out_of_stock";

  return {
    id: product.slug,
    slug: product.slug,
    sku: product.sku,
    name: cleanText(product.name),
    category: cleanText(product.category),
    description: cleanText(product.description),
    tags: Array.from(new Set(product.tags || [])),
    pricePix,
    priceCard: calculateCardPrice(pricePix),
    stock: Math.max(0, Number(product.stock || 0)),
    availabilityMode,
    status: product.stock > 0 ? "Sob encomenda" : "Indisponivel",
    productionWindow: cleanText(product.productionWindow || "2 a 5 dias uteis"),
    dimensions: product.dimensions,
    weightKg: product.weightKg,
    images,
    primaryImage: images[0],
    seoTitle: product.seoTitle || `${cleanText(product.name)} | MDH3D`,
    seoDescription: cleanText(product.seoDescription || product.description).slice(0, 155),
    source: "smart-store",
    productUrl: buildProductPagePath(product),
    nuvemshopUrl: product.nuvemshopUrl,
    whatsappEligible: !product.nuvemshopUrl,
  };
}
