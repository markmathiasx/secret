import { getProductUrl, type Product } from "@/lib/catalog";
import type { SmartStoreProduct } from "@/lib/mdh-store/products";
import { buildProductPagePath } from "@/lib/mdh-store/links";
import { calculateCardPrice, normalizeMoney } from "@/lib/payment-pricing";
import { slugify } from "@/lib/utils";
import type { ProductMasterRecord } from "./types";

const UNSAFE_LINK = /^(?:blob:|data:|javascript:)|localhost|127\.0\.0\.1|0\.0\.0\.0/i;

function cleanText(value: unknown) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeStatus(value: unknown, stock: number): ProductMasterRecord["status"] {
  const text = cleanText(value);
  if (/pronta entrega/i.test(text)) return "Pronta entrega";
  if (stock <= 0 && /indispon/i.test(text)) return "Indisponivel";
  return "Sob encomenda";
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
    stock: Math.max(0, Number(product.stock || 0)),
    status: normalizeStatus(product.status, product.stock || 0),
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
