import type { Product } from "@/lib/catalog";

export function getProductGallery(product: Product) {
  const src = `/catalog-assets/${product.id}.webp`;
  return [0, 1, 2].map((variant) => ({
    id: `${product.id}-${variant}`,
    src,
    alt: `${product.name} - visão ${variant + 1}`
  }));
}
