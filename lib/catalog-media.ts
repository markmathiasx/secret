import { slugify } from "@/lib/utils";
import productGalleryMap from "@/data/product-gallery-map.json";
import productImageMap from "@/product-image-map.json";
import plannedProductImageMap from "@/planned-product-image-map.json";

type ProductImageShape = {
  id?: string;
  name: string;
  slug?: string;
  images?: string[];
  image?: string;
  imageAlt?: string;
};

const galleryByProductId = productGalleryMap as Record<string, string[]>;
const primaryImageByProductId = productImageMap as Record<string, string>;
const plannedPrimaryImageByProductId = plannedProductImageMap as Record<string, string>;

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function getMappedGallery(productId?: string) {
  if (!productId) return [];
  return Array.isArray(galleryByProductId[productId]) ? galleryByProductId[productId].filter(Boolean) : [];
}

function getMappedPrimaryImage(productId?: string) {
  if (!productId) return "";
  return primaryImageByProductId[productId] || plannedPrimaryImageByProductId[productId] || "";
}

export function getProductSlugValue(product: Pick<ProductImageShape, "name" | "slug">) {
  const provided = product.slug?.trim();
  if (provided) return slugify(provided);
  return slugify(product.name);
}

export function buildProductImageAlt(title: string, index?: number) {
  return index && index > 1
    ? `Impressão 3D de ${title} - MDH 3D Store (${index})`
    : `Impressão 3D de ${title} - MDH 3D Store`;
}

export function buildGeneratedProductImages(slug: string, imageCount = 4, productId?: string) {
  const mappedGallery = getMappedGallery(productId);
  if (mappedGallery.length) {
    return mappedGallery.slice(0, Math.max(1, Math.min(imageCount, mappedGallery.length)));
  }

  const mappedPrimaryImage = getMappedPrimaryImage(productId);
  if (mappedPrimaryImage) {
    return [mappedPrimaryImage];
  }

  // No verified images mapped for this product — return empty rather than showing
  // unrelated placeholder images (picsum, etc.) which are never semantically correct.
  return [];
}

export function applyCatalogMedia<T extends ProductImageShape>(
  product: T,
  options?: {
    preserveExisting?: boolean;
    preferExistingImages?: boolean;
    imageCount?: number;
  }
) {
  const slug = getProductSlugValue(product);
  const preserveExisting = options?.preserveExisting ?? false;
  const preferExistingImages = options?.preferExistingImages ?? false;
  const mappedGallery = getMappedGallery(product.id);
  const existingImages = product.images?.filter(Boolean) || [];
  const baseImages = preferExistingImages && existingImages.length
    ? existingImages
    : mappedGallery.length
      ? mappedGallery
      : preserveExisting && existingImages.length
        ? existingImages
      : buildGeneratedProductImages(slug, options?.imageCount ?? 4, product.id);
  const images = unique(baseImages.filter(Boolean));
  const image = preferExistingImages
    ? product.image?.trim() || images[0] || getMappedPrimaryImage(product.id) || buildGeneratedProductImages(slug, 1, product.id)[0]
    : getMappedPrimaryImage(product.id) || images[0] || buildGeneratedProductImages(slug, 1, product.id)[0];
  const imageAlt = product.imageAlt?.trim() || buildProductImageAlt(product.name);

  return {
    ...product,
    slug,
    images,
    image,
    imageAlt,
  };
}
