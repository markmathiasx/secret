import type { Product } from "@/lib/catalog";
import { slugify } from "@/lib/utils";

export const productPlaceholderSrc = "/catalog-assets/product-placeholder.jpg";
const productExts = ["jpg", "webp", "png", "svg"] as const;

export function getProductSlug(product: Product) {
  return `${product.id}-${slugify(product.name)}`;
}

function explicitGallery(product: Product) {
  const images = Array.isArray((product as Product & { images?: string[] }).images)
    ? (product as Product & { images?: string[] }).images?.filter(Boolean)
    : [];
  if (images && images.length) {
    return images.map((src, index) => ({
      id: `${product.id}-${index + 1}`,
      candidates: [src, productPlaceholderSrc],
      alt: `${product.name} - visão ${index + 1}`,
    }));
  }
  const single = (product as Product & { image?: string }).image;
  if (single) {
    return [{ id: `${product.id}-1`, candidates: [single, productPlaceholderSrc], alt: `${product.name} - visão 1` }];
  }
  return null;
}

function getProductShotCandidates(product: Product, shot: 1 | 2 | 3) {
  const slug = getProductSlug(product);
  const explicit = `/products/${slug}/${shot}`;
  return productExts.map((ext) => `${explicit}.${ext}`);
}

export function getProductImageCandidates(product: Product) {
  const explicit = explicitGallery(product);
  if (explicit?.length) {
    return explicit[0]?.candidates || [productPlaceholderSrc];
  }

  // Priorizar catalog-assets WebP (mais otimizado)
  const catalogWebp = `/catalog-assets/${product.id}.webp`;
  const catalogJpg = `/catalog-assets/${product.id}.jpg`;

  // Fallback para assets/images/products (legado)
  const legacyJpg = `/assets/images/products/product-${product.id.split('-')[1]}.jpg`;

  return [catalogWebp, catalogJpg, legacyJpg, productPlaceholderSrc];
}

export function resolveProductImage(product: Product) {
  return getProductImageCandidates(product)[0] || productPlaceholderSrc;
}

export function getProductGallery(product: Product) {
  const explicit = explicitGallery(product);
  if (explicit?.length) return explicit;

  // Usar apenas catalog-assets para galeria (WebP otimizado)
  return ([1, 2, 3] as const).map((shot) => ({
    id: `${product.id}-${shot}`,
    candidates: [
      `/catalog-assets/${product.id}.webp`,
      `/catalog-assets/${product.id}.jpg`,
      productPlaceholderSrc
    ],
    alt: `${product.name} - visão ${shot}`,
  }));
}
