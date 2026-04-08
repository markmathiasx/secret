import { slugify } from "@/lib/utils";

type ProductImageShape = {
  name: string;
  slug?: string;
  images?: string[];
  image?: string;
  imageAlt?: string;
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
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

export function buildGeneratedProductImages(slug: string, imageCount = 3) {
  const normalizedSlug = slugify(slug);
  const variants = [
    `https://picsum.photos/seed/mdh-3d-${normalizedSlug}/1200/800`,
    `https://picsum.photos/seed/mdh-3d-${normalizedSlug}-square/600/600`,
    `https://picsum.photos/seed/mdh-3d-${normalizedSlug}-detail/1200/900`,
  ];

  return variants.slice(0, Math.max(1, Math.min(imageCount, variants.length)));
}

export function applyCatalogMedia<T extends ProductImageShape>(
  product: T,
  options?: {
    preserveExisting?: boolean;
    imageCount?: number;
  }
) {
  const slug = getProductSlugValue(product);
  const preserveExisting = options?.preserveExisting ?? false;
  const baseImages = preserveExisting && product.images?.length
    ? product.images
    : buildGeneratedProductImages(slug, options?.imageCount ?? 3);
  const images = unique(baseImages.filter(Boolean));
  const image = images[0] || buildGeneratedProductImages(slug, 1)[0];
  const imageAlt = product.imageAlt?.trim() || buildProductImageAlt(product.name);

  return {
    ...product,
    slug,
    images,
    image,
    imageAlt,
  };
}
