import type { Product } from "@/lib/catalog";
import { getProductPreviewImage, withProductPreviewCandidates } from "@/lib/product-image-variants";

export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholders/product-card.svg";
export const productPlaceholderSrc = PRODUCT_IMAGE_PLACEHOLDER;

type ProductLike = Partial<Product> & Record<string, unknown>;

export type ProductGalleryImage = {
  id: string;
  src: string;
  alt: string;
  candidates: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readIndexedSource(value: unknown, key: "url" | "src"): string | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const first = value[0];
  if (typeof first === "string" && key === "src") return readString(first);
  if (isRecord(first)) return readString(first[key]);
  return null;
}

function readArraySources(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return readString(entry);
      if (isRecord(entry)) return readString(entry.url) || readString(entry.src);
      return null;
    })
    .filter((entry): entry is string => Boolean(entry));
}

export function isPublicSafeImageSource(src: unknown): boolean {
  const value = readString(src);
  if (!value) return false;
  if (/^data:/i.test(value)) return false;
  if (/example\.com/i.test(value)) return false;
  return true;
}

export function getProductImageAlt(product: Partial<Product> | null | undefined): string {
  if (!product) return "Imagem do produto MDH 3D";
  return product.imageAlt || product.name || "Imagem do produto MDH 3D";
}

export function getPrimaryImageFieldCandidates(product: Partial<Product> | null | undefined): string[] {
  if (!product) return [PRODUCT_IMAGE_PLACEHOLDER];
  const item = product as ProductLike;

  const candidates = [
    readIndexedSource(item.imageGallery, "url"),
    readIndexedSource(item.imageGallery, "src"),
    readIndexedSource(item.gallery, "url"),
    readIndexedSource(item.gallery, "src"),
    readIndexedSource(item.media, "url"),
    readIndexedSource(item.media, "src"),
    Array.isArray(product.images) ? readString(product.images[0]) : null,
    readString(product.image),
    readString(item.imageUrl),
    readString(item.primaryImage),
    readString(item.thumbnail),
  ].filter((entry): entry is string => Boolean(entry));

  return candidates.length > 0 ? candidates : [PRODUCT_IMAGE_PLACEHOLDER];
}

export function getProductImageCandidates(product: Partial<Product> | null | undefined): string[] {
  const ordered = [
    ...getPrimaryImageFieldCandidates(product),
    ...readArraySources((product as ProductLike | null | undefined)?.imageGallery),
    ...readArraySources((product as ProductLike | null | undefined)?.gallery),
    ...readArraySources((product as ProductLike | null | undefined)?.media),
    ...(Array.isArray(product?.images) ? product.images : []),
  ];

  const deduped = Array.from(new Set(ordered.filter(isPublicSafeImageSource)));
  return deduped.length > 0 ? deduped : [PRODUCT_IMAGE_PLACEHOLDER];
}

export function getPrimaryProductImage(product: Partial<Product> | null | undefined): string {
  return getProductImageCandidates(product)[0] || PRODUCT_IMAGE_PLACEHOLDER;
}

export function getPrimaryProductPreviewImage(product: Partial<Product> | null | undefined): string {
  const primary = getPrimaryProductImage(product);
  return getProductPreviewImage(primary) || primary;
}

export function hasUsableProductImage(product: Partial<Product> | null | undefined): boolean {
  return getProductImageCandidates(product).some((src) => src !== PRODUCT_IMAGE_PLACEHOLDER);
}

export function getAllProductImages(product: Partial<Product> | null | undefined): string[] {
  return getProductImageCandidates(product);
}

export function getProductGallery(product: Partial<Product> | null | undefined): ProductGalleryImage[] {
  const candidates = getProductImageCandidates(product);
  const alt = getProductImageAlt(product);
  return candidates.map((src, index) => ({
    id: `${readString(product?.id) || "product"}-${index}`,
    src,
    alt: index === 0 ? alt : `${alt} ${index + 1}`,
    candidates: withProductPreviewCandidates([src, PRODUCT_IMAGE_PLACEHOLDER]),
  }));
}

export function resolveProductImage(product: Partial<Product> | null | undefined): string {
  return getPrimaryProductImage(product);
}
