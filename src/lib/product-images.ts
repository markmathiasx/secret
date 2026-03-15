import type { Product } from "@/lib/catalog";
import { getProductGallerySources } from "@/lib/product-media";

export function getProductGallery(product: Product) {
  return getProductGallerySources(product);
}

