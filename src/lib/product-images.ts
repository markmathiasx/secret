import type { Product } from "@/lib/catalog";
import { slugify } from "@/lib/utils";

export const productPlaceholderSrc = "/placeholders/product-card.svg";

const productExts = ["webp", "jpg", "png"] as const;

export function getProductSlug(product: Product) {
  return `${product.id}-${slugify(product.name)}`;
}

function getProductShotCandidates(product: Product, shot: 1 | 2 | 3) {
  const slug = getProductSlug(product);
  return productExts.map((ext) => `/products/${slug}/${shot}.${ext}`);
}

export function getProductImageCandidates(product: Product) {
  return [...getProductShotCandidates(product, 1), `/catalog-assets/${product.id}.webp`, productPlaceholderSrc];
}

export function resolveProductImage(product: Product) {
  return getProductImageCandidates(product)[0] || productPlaceholderSrc;
}

export function getProductGallery(product: Product) {
  return ([1, 2, 3] as const).map((shot) => ({
    id: `${product.id}-${shot}`,
    candidates: [...getProductShotCandidates(product, shot), `/catalog-assets/${product.id}.webp`, productPlaceholderSrc],
    alt: `${product.name} - visual ${shot}`
  }));
}
