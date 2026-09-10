import { catalog, type Product } from "@/lib/catalog";
import { isPublicSafe, validateProductMedia } from "@/lib/media-validation";
import { getProductVisual } from "@/lib/product-visuals";
import { getProductAvailabilityMode, getPublicStockQuantity, type ProductAvailabilityMode } from "@/lib/product-availability";

export type PublicProductPayload = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  theme: string;
  collection: string;
  colors: string[];
  description: string;
  tags: string[];
  dimensions: string;
  images: string[];
  image?: string;
  imageAlt?: string;
  licenseType?: "personal" | "commercial";
  variants?: { color: string; available: boolean }[];
  pricePix: number;
  priceCard: number;
  printTime?: string;
  plaWeight?: string;
  productionWindow: string;
  material: string;
  finish: string;
  status: Product["status"];
  availabilityMode: ProductAvailabilityMode;
  stock: number;
  featured: boolean;
  customizable: boolean;
  readyToShip?: boolean;
  pricingMode: NonNullable<Product["pricingMode"]>;
  requiresCommercialReview: boolean;
  mediaProvenance?: Product["mediaProvenance"];
  visualKind: string;
  visualLabel: string;
  visualStatus: string;
  merchantReady: boolean;
};

export function isPublicCatalogProduct(product: Product) {
  const mediaRecord = validateProductMedia(product);
  const visual = getProductVisual(product);
  const hasProductMedia = mediaRecord.gallery.some((item) => !/placeholder/i.test(item.url));
  return visual.merchantReady && isPublicSafe(mediaRecord.status) && hasProductMedia;
}

export function filterPublicCatalogProducts(products: Product[]) {
  return products.filter(isPublicCatalogProduct);
}

export function isDirectSaleCatalogProduct(product: Product) {
  return (
    isPublicCatalogProduct(product) &&
    product.pricingMode === "faixa-auditada" &&
    product.mediaProvenance?.commercialUse !== "review-required"
  );
}

export function filterDirectSaleCatalogProducts(products: Product[]) {
  return products.filter(isDirectSaleCatalogProduct);
}

export function serializePublicProduct(product: Product): PublicProductPayload {
  const visual = getProductVisual(product);
  const mediaRecord = validateProductMedia(product);
  const availabilityMode = getProductAvailabilityMode(product);

  return {
    id: product.id,
    slug: product.slug || product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    theme: product.theme,
    collection: product.collection,
    colors: product.colors,
    description: product.description,
    tags: product.tags,
    dimensions: product.dimensions,
    images: product.images,
    image: product.image,
    imageAlt: product.imageAlt,
    licenseType: product.licenseType,
    variants: product.variants,
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    printTime: product.printTime,
    plaWeight: product.plaWeight,
    productionWindow: product.productionWindow,
    material: product.material,
    finish: product.finish,
    status: product.status,
    availabilityMode,
    stock: getPublicStockQuantity({ ...product, availabilityMode }),
    featured: product.featured,
    customizable: product.customizable,
    readyToShip: product.readyToShip,
    pricingMode: product.pricingMode || "faixa-auditada",
    requiresCommercialReview:
      product.pricingMode !== "faixa-auditada" || product.mediaProvenance?.commercialUse === "review-required",
    mediaProvenance: product.mediaProvenance,
    visualKind: visual.kind,
    visualLabel: visual.label,
    visualStatus: mediaRecord.status,
    merchantReady: visual.merchantReady,
  };
}

export function serializePublicProducts(products: Product[]) {
  return products.map(serializePublicProduct);
}

export const publicCatalog = filterPublicCatalogProducts(catalog);
export const directSaleCatalog = filterDirectSaleCatalogProducts(catalog);
export const publicFeaturedCatalog = publicCatalog.filter((product) => product.featured);
