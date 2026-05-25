import { catalog, type Product } from "@/lib/catalog";
import { validateProductMedia } from "@/lib/media-validation";
import { getProductVisual } from "@/lib/product-visuals";

export type PublicProductPayload = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  primaryCategory?: string;
  productTypePath?: string;
  buyingIntents?: string[];
  objectType?: string;
  useCaseTags?: string[];
  seoKeywords?: string[];
  confidence?: string;
  classificationReason?: string;
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
  stock: number;
  featured: boolean;
  customizable: boolean;
  readyToShip?: boolean;
  visualKind: string;
  visualLabel: string;
  visualStatus: string;
  merchantReady: boolean;
};

export function isPublicCatalogProduct(product: Product) {
  return Boolean(product.id && (product.slug || product.name) && product.pricePix > 0);
}

export function filterPublicCatalogProducts(products: Product[]) {
  return products.filter(isPublicCatalogProduct);
}

export function serializePublicProduct(product: Product): PublicProductPayload {
  const visual = getProductVisual(product);
  const mediaRecord = validateProductMedia(product);

  return {
    id: product.id,
    slug: product.slug || product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    primaryCategory: product.primaryCategory,
    productTypePath: product.productTypePath,
    buyingIntents: product.buyingIntents,
    objectType: product.objectType,
    useCaseTags: product.useCaseTags,
    seoKeywords: product.seoKeywords,
    confidence: product.confidence,
    classificationReason: product.classificationReason,
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
    stock: product.stock,
    featured: product.featured,
    customizable: product.customizable,
    readyToShip: product.readyToShip,
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
export const publicFeaturedCatalog = publicCatalog.filter((product) => product.featured);
