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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

const supabaseAssetBase = process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL?.trim() || "";

function getPrimaryAsset(product: Product) {
  if (supabaseAssetBase) {
    return `${supabaseAssetBase.replace(/\/+$/, "")}/${product.id}.webp`;
  }

  return `/catalog-assets/${product.id}.webp`;
}

const supabaseAssetBase = process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL?.trim() || "";

function getPrimaryAsset(product: Product) {
  if (supabaseAssetBase) {
    return `${supabaseAssetBase.replace(/\/+$/, "")}/${product.id}.webp`;
  }

  return `/catalog-assets/${product.id}.webp`;
}

export function getProductGallery(product: Product) {
<<<<<<< ours
<<<<<<< ours
  return ([1, 2, 3] as const).map((shot) => ({
    id: `${product.id}-${shot}`,
    candidates: [...getProductShotCandidates(product, shot), `/catalog-assets/${product.id}.webp`, productPlaceholderSrc],
    alt: `${product.name} - visual ${shot}`
=======
=======
>>>>>>> theirs
  const src = getPrimaryAsset(product);

  return [0, 1, 2].map((variant) => ({
    id: `${product.id}-${variant}`,
    src,
    alt: `${product.name} - visão ${variant + 1}`
>>>>>>> theirs
=======

export function getProductGallery(product: Product) {
=======

export function getProductGallery(product: Product) {
>>>>>>> theirs
=======

export function getProductGallery(product: Product) {
>>>>>>> theirs
=======

export function getProductGallery(product: Product) {
>>>>>>> theirs
  return ([1, 2, 3] as const).map((shot) => ({
    id: `${product.id}-${shot}`,
    candidates: [...getProductShotCandidates(product, shot), `/catalog-assets/${product.id}.webp`, productPlaceholderSrc],
    alt: `${product.name} - visão ${shot}`
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  }));
}
