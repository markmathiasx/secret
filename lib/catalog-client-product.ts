import type { Product } from "@/lib/catalog";

export const CATALOG_INITIAL_PRODUCT_COUNT = 36;

function compactText(value: string | undefined, maxLength: number) {
  const normalized = (value || "").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1).trimEnd()}…` : normalized;
}

export function toCatalogClientProduct(product: Product): Product {
  const primaryImage = product.images?.[0] || product.image;
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    primaryCategory: product.primaryCategory,
    objectType: product.objectType,
    mediaProvenance: product.mediaProvenance,
    theme: product.theme,
    collection: product.collection,
    colors: product.colors,
    grams: product.grams,
    hours: product.hours,
    complexity: product.complexity,
    featured: product.featured,
    description: product.description,
    tags: product.tags,
    buyingIntents: product.buyingIntents,
    printTime: product.printTime,
    plaWeight: product.plaWeight,
    dimensions: product.dimensions,
    images: product.images,
    image: primaryImage,
    imageAlt: compactText(product.imageAlt || product.name, 160),
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    availabilityMode: product.availabilityMode,
    marketplaceSuggested: product.marketplaceSuggested,
    productionWindow: product.productionWindow,
    imageHint: compactText(product.imageHint || product.name, 100),
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
