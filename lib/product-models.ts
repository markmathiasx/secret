import type { Product } from "@/lib/catalog";
import { getCatalogModelPreview, getCatalogPhotoEntry } from "@/lib/catalog-photo-manifest";

export function getProductModel3mf(product: Product) {
  return getCatalogPhotoEntry(product.id)?.model3mf || null;
}

export function getProductModelPreview(product: Product) {
  return getCatalogModelPreview(product.id);
}

export function hasProductModel3mf(product: Product) {
  return Boolean(getProductModel3mf(product));
}
