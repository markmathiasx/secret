import "server-only";

import { getCatalogSnapshot } from "@/lib/catalog-repository";
import type { Product } from "@/lib/catalog";
import { hasUsableProductImage } from "@/lib/product-images";
import { isProductVisualVerified } from "@/lib/product-visuals";

export type PublicCatalogStats = {
  activeProductCount: number;
  visibleCatalogResultCount: number;
  indexedProductCount: number;
  validatedMediaCount: number;
  productsWithPhotoOrPreview: number;
  customizableCount: number;
  readyToShipCount: number;
  minPrice: number;
  averageTicket: number;
};

function roundMoney(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function buildPublicCatalogStats(products: Product[]): PublicCatalogStats {
  const activeProducts = products.filter((product) => Number(product.pricePix) > 0);
  const prices = activeProducts.map((product) => Number(product.pricePix)).filter((price) => price > 0);
  const totalPrice = prices.reduce((sum, price) => sum + price, 0);

  return {
    activeProductCount: activeProducts.length,
    visibleCatalogResultCount: activeProducts.length,
    indexedProductCount: activeProducts.length,
    validatedMediaCount: activeProducts.filter(isProductVisualVerified).length,
    productsWithPhotoOrPreview: activeProducts.filter(hasUsableProductImage).length,
    customizableCount: activeProducts.filter((product) => product.customizable).length,
    readyToShipCount: activeProducts.filter((product) => product.readyToShip || product.status === "Pronta entrega").length,
    minPrice: prices.length ? roundMoney(Math.min(...prices)) : 0,
    averageTicket: prices.length ? roundMoney(totalPrice / prices.length) : 0,
  };
}

export async function getPublicCatalogStats() {
  const products = await getCatalogSnapshot();
  return buildPublicCatalogStats(products);
}
