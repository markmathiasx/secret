import type { Product } from "@/lib/catalog";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getPrimaryImageFieldCandidates,
  getProductImageAlt,
  isPublicSafeImageSource,
} from "@/lib/product-images";
import { getProductPreviewImage, withProductPreviewCandidates } from "@/lib/product-image-variants";

export const PRODUCT_CARD_PLACEHOLDER = PRODUCT_IMAGE_PLACEHOLDER;

type FlexibleProduct = Partial<Product> & {
  imageGallery?: unknown;
  gallery?: unknown;
  media?: unknown;
  imageUrl?: unknown;
  primaryImage?: unknown;
  thumbnail?: unknown;
};

export type ProductCardImageSource =
  | "imageGallery[0].url"
  | "imageGallery[0].src"
  | "gallery[0].url"
  | "gallery[0].src"
  | "media[0].url"
  | "media[0].src"
  | "images[0]"
  | "image"
  | "imageUrl"
  | "primaryImage"
  | "thumbnail"
  | "placeholder";

export type ProductCardImageResult = {
  src: string;
  alt: string;
  source: ProductCardImageSource;
  usedPlaceholder: boolean;
  candidates: string[];
};

function asCleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readArrayEntry(value: unknown) {
  return Array.isArray(value) && value.length ? value[0] : null;
}

function readMediaField(product: FlexibleProduct | null | undefined, key: "imageGallery" | "gallery" | "media", field: "url" | "src") {
  const entry = readArrayEntry(product?.[key]);
  if (!entry) return null;
  if (typeof entry === "string") return field === "url" ? asCleanString(entry) : null;
  if (typeof entry === "object" && field in entry) return asCleanString((entry as Record<string, unknown>)[field]);
  return null;
}

function readImagesFirst(product: FlexibleProduct | null | undefined) {
  const entry = readArrayEntry(product?.images);
  if (!entry) return null;
  if (typeof entry === "string") return asCleanString(entry);
  if (typeof entry === "object") {
    return asCleanString((entry as Record<string, unknown>).url) || asCleanString((entry as Record<string, unknown>).src);
  }
  return null;
}

export function getProductCardImage(product: FlexibleProduct | null | undefined): ProductCardImageResult {
  const candidates: Array<{ source: ProductCardImageSource; src: string | null }> = [
    { source: "imageGallery[0].url", src: readMediaField(product, "imageGallery", "url") },
    { source: "imageGallery[0].src", src: readMediaField(product, "imageGallery", "src") },
    { source: "gallery[0].url", src: readMediaField(product, "gallery", "url") },
    { source: "gallery[0].src", src: readMediaField(product, "gallery", "src") },
    { source: "media[0].url", src: readMediaField(product, "media", "url") },
    { source: "media[0].src", src: readMediaField(product, "media", "src") },
    { source: "images[0]", src: readImagesFirst(product) },
    { source: "image", src: asCleanString(product?.image) },
    { source: "imageUrl", src: asCleanString(product?.imageUrl) },
    { source: "primaryImage", src: asCleanString(product?.primaryImage) },
    { source: "thumbnail", src: asCleanString(product?.thumbnail) },
  ];

  const selected = candidates.find((candidate) => candidate.src && isPublicSafeImageSource(candidate.src));
  const ownCandidates = Array.from(
    new Set(getPrimaryImageFieldCandidates(product).filter((src) => src !== PRODUCT_CARD_PLACEHOLDER && isPublicSafeImageSource(src)))
  );
  const sourceSrc = selected?.src || PRODUCT_CARD_PLACEHOLDER;
  const src = getProductPreviewImage(sourceSrc) || sourceSrc;

  return {
    src,
    alt: getProductImageAlt(product),
    source: selected?.source || "placeholder",
    usedPlaceholder: !selected,
    candidates: withProductPreviewCandidates([...ownCandidates, PRODUCT_CARD_PLACEHOLDER]),
  };
}
