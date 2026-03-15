import type { Product } from "@/lib/catalog";

const supabaseAssetBase = process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL?.trim() || "";

function getPrimaryAsset(product: Product) {
  if (supabaseAssetBase) {
    return `${supabaseAssetBase.replace(/\/+$/, "")}/${product.id}.webp`;
  }

  return `/catalog-assets/${product.id}.webp`;
}

export function getProductGallery(product: Product) {
  const src = getPrimaryAsset(product);

  return [0, 1, 2].map((variant) => ({
    id: `${product.id}-${variant}`,
    src,
    alt: `${product.name} - visão ${variant + 1}`
  }));
}
