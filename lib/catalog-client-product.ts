import type { Product } from "@/lib/catalog";
import { getProductCardDescription } from "@/lib/catalog-content";
import { getProductVisual } from "@/lib/product-visuals";

export const CATALOG_INITIAL_PRODUCT_COUNT = 36;

function compactText(value: string | undefined, maxLength: number) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1).trimEnd()}…` : normalized;
}

/** Explicit public grid payload: internal costs and supplier metadata stay server-side. */
export function toCatalogClientProduct(product: Product): Product {
  const primaryImage = product.images?.[0] || product.image;
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    theme: product.theme,
    collection: product.collection,
    colors: product.colors,
    grams: product.grams,
    hours: product.hours,
    complexity: product.complexity,
    featured: product.featured,
    description: compactText(getProductCardDescription(product), 260),
    tags: product.tags,
    printTime: product.printTime,
    plaWeight: product.plaWeight,
    dimensions: product.dimensions,
    images: primaryImage ? [primaryImage] : [],
    image: primaryImage,
    imageAlt: compactText(product.imageAlt || product.name, 160),
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    availabilityMode: product.availabilityMode,
    marketplaceSuggested: product.marketplaceSuggested,
    productionWindow: product.productionWindow,
    imageHint: compactText(product.imageHint || product.name, 100),
    visualKind: getProductVisual(product).kind,
    material: product.material,
    finish: product.finish,
    status: product.status,
    stock: product.stock,
    customizable: product.customizable,
    readyToShip: product.readyToShip,
    pricingMode: product.pricingMode,
  };
}

export function toCatalogClientProducts(products: Product[]) {
  return products.map(toCatalogClientProduct);
}
