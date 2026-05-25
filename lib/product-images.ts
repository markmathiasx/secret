import type { Product } from "@/lib/catalog";
import { buildProductImageAlt } from "@/lib/catalog-media";
import { slugify } from "@/lib/utils";
import { getCatalogPhotoCandidates, hasExplicitCatalogGallery } from "@/lib/catalog-photo-manifest";
import { getProductVisualImageCandidates } from "@/lib/product-visuals";

export const PRODUCT_IMAGE_PLACEHOLDER = "/placeholders/product-card.svg";
export const productPlaceholderSrc = PRODUCT_IMAGE_PLACEHOLDER;
const productExts = ["jpg", "webp", "png", "svg"] as const;

type FlexibleImageProduct = Partial<Product> & {
  imageGallery?: unknown;
  gallery?: unknown;
  media?: unknown;
  imageUrl?: unknown;
  primaryImage?: unknown;
  thumbnail?: unknown;
};

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
      candidates: [src],
      alt: buildProductImageAlt(product.name, index + 1),
    }));
  }
  const single = (product as Product & { image?: string }).image;
  if (single) {
    return [{ id: `${product.id}-1`, candidates: [single], alt: buildProductImageAlt(product.name, 1) }];
  }
  return null;
}

function getProductShotCandidates(product: Product, shot: 1 | 2 | 3) {
  const slug = getProductSlug(product);
  const explicit = `/products/${slug}/${shot}`;
  return productExts.map((ext) => `${explicit}.${ext}`);
}

function normalizeProductId(id: string) {
  // Some product IDs use padded zeros (e.g., mdh-005) while the file
  // names are written without padding (mdh-5). This normalizes both.
  return id.replace(/-(0+)(\d+)$/, (_match, _zeros, number) => `-${Number(number)}`);
}

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function firstArrayEntry(value: unknown) {
  return Array.isArray(value) && value.length ? value[0] : null;
}

function readCollectionField(product: FlexibleImageProduct, key: "imageGallery" | "gallery" | "media", field: "url" | "src") {
  const entry = firstArrayEntry(product[key]);
  if (!entry) return null;
  if (typeof entry === "string") return field === "url" ? cleanString(entry) : null;
  if (typeof entry === "object") return cleanString((entry as Record<string, unknown>)[field]);
  return null;
}

function readFirstImage(product: FlexibleImageProduct) {
  const entry = firstArrayEntry(product.images);
  if (!entry) return null;
  if (typeof entry === "string") return cleanString(entry);
  if (typeof entry === "object") {
    return cleanString((entry as Record<string, unknown>).url) || cleanString((entry as Record<string, unknown>).src);
  }
  return null;
}

export function isPublicSafeImageSource(src: string) {
  const normalized = src.toLowerCase();
  const blocked = [
    "pokemon",
    "pokémon",
    "pikachu",
    "nintendo",
    "game-boy",
    "gameboy",
    "fire-red",
    "fire_red",
    "fire%20red",
    "hello-kitty",
    "rick-morty",
    "homer",
  ];
  return !blocked.some((term) => normalized.includes(term));
}

export function getPrimaryImageFieldCandidates(product: FlexibleImageProduct | null | undefined) {
  if (!product) return [PRODUCT_IMAGE_PLACEHOLDER];
  return [
    readCollectionField(product, "imageGallery", "url"),
    readCollectionField(product, "imageGallery", "src"),
    readCollectionField(product, "gallery", "url"),
    readCollectionField(product, "gallery", "src"),
    readCollectionField(product, "media", "url"),
    readCollectionField(product, "media", "src"),
    readFirstImage(product),
    cleanString(product.image),
    cleanString(product.imageUrl),
    cleanString(product.primaryImage),
    cleanString(product.thumbnail),
    PRODUCT_IMAGE_PLACEHOLDER,
  ].filter(Boolean) as string[];
}

function uniqueSafeCandidates(candidates: string[]) {
  const unique = Array.from(new Set(candidates.filter(Boolean)));
  const safe = unique.filter((src) => src === PRODUCT_IMAGE_PLACEHOLDER || isPublicSafeImageSource(src));
  return safe.includes(PRODUCT_IMAGE_PLACEHOLDER) ? safe : [...safe, PRODUCT_IMAGE_PLACEHOLDER];
}

export function getProductImageCandidates(product: Product) {
  const directCandidates = getPrimaryImageFieldCandidates(product);
  const explicit = explicitGallery(product);
  const visualCandidates = getProductVisualImageCandidates(product);
  const catalogPhotoCandidates = getCatalogPhotoCandidates(product.id);
  if (explicit?.length) {
    return uniqueSafeCandidates([
      ...directCandidates,
      ...(explicit[0]?.candidates || []),
      ...visualCandidates,
      ...catalogPhotoCandidates,
      productPlaceholderSrc,
    ]);
  }

  const normalizedId = normalizeProductId(product.id);

  // Priorizar catalog-assets WebP (mais otimizado)
  const catalogWebp = `/catalog-assets/${product.id}.webp`;
  const catalogWebpNormalized = `/catalog-assets/${normalizedId}.webp`;
  const catalogJpg = `/catalog-assets/${product.id}.jpg`;
  const catalogJpgNormalized = `/catalog-assets/${normalizedId}.jpg`;

  // Fallback para assets/images/products (legado)
  const legacyJpg = `/assets/images/products/product-${product.id.split('-')[1]}.jpg`;

  return uniqueSafeCandidates([
    ...directCandidates,
    ...catalogPhotoCandidates,
    ...visualCandidates,
    catalogWebp,
    catalogWebpNormalized,
    catalogJpg,
    catalogJpgNormalized,
    legacyJpg,
    productPlaceholderSrc,
  ]);
}

export function resolveProductImage(product: Product) {
  return getProductImageCandidates(product)[0] || productPlaceholderSrc;
}

export function getPrimaryProductImage(product: Product | null | undefined) {
  if (!product) return PRODUCT_IMAGE_PLACEHOLDER;
  return getProductImageCandidates(product)[0] || PRODUCT_IMAGE_PLACEHOLDER;
}

export function getProductImageAlt(product: FlexibleImageProduct | null | undefined) {
  return cleanString(product?.imageAlt) || cleanString(product?.name) || "Imagem do produto MDH 3D";
}

export function hasUsableProductImage(product: Product | null | undefined) {
  if (!product) return false;
  return getProductImageCandidates(product).some((src) => src !== PRODUCT_IMAGE_PLACEHOLDER);
}

export function getProductGallery(product: Product) {
  const explicit = explicitGallery(product);
  const visualCandidates = getProductVisualImageCandidates(product);
  const catalogPhotoCandidates = getCatalogPhotoCandidates(product.id);
  if (explicit?.length) {
      return explicit.map((item) => ({
      ...item,
      candidates: uniqueSafeCandidates([...item.candidates, ...visualCandidates, ...catalogPhotoCandidates, productPlaceholderSrc]),
    }));
  }
  if (catalogPhotoCandidates.length) {
    if (hasExplicitCatalogGallery(product.id)) {
      return catalogPhotoCandidates.map((src, index) => ({
        id: `${product.id}-catalog-${index + 1}`,
        candidates: uniqueSafeCandidates([src, productPlaceholderSrc]),
        alt: `${product.name} - catálogo ${index + 1}`,
      }));
    }
    return [
      {
        id: `${product.id}-catalog-1`,
        candidates: uniqueSafeCandidates([...catalogPhotoCandidates, ...visualCandidates, productPlaceholderSrc]),
        alt: `${product.name} - catálogo principal`,
      },
    ];
  }

  // Usar apenas catalog-assets para galeria (WebP otimizado)
  const normalizedId = normalizeProductId(product.id);

  return ([1, 2, 3] as const).map((shot) => ({
    id: `${product.id}-${shot}`,
    candidates: [
      ...visualCandidates,
      `/catalog-assets/${product.id}.webp`,
      `/catalog-assets/${normalizedId}.webp`,
      `/catalog-assets/${product.id}.jpg`,
      `/catalog-assets/${normalizedId}.jpg`,
      productPlaceholderSrc,
    ].filter((src) => isPublicSafeImageSource(src) || src === productPlaceholderSrc),
    alt: buildProductImageAlt(product.name, shot),
  }));
}
