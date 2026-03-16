import type { Product } from "@/lib/catalog";
import { getProductImageCandidates } from "@/lib/product-images";

export function getProductImageSources(product: Product) {
  return getProductImageCandidates(product);
}

export function getPrimaryProductImage(product: Product) {
  const [src, ...fallbackSrcs] = getProductImageSources(product);

  return {
    src,
    fallbackSrcs,
    alt: `${product.name} - imagem do produto`
  };
}
