export type ProductRouteInput = {
  id: string;
  slug?: string;
  name: string;
};

function slugifyProductName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function getProductUrl(product: ProductRouteInput) {
  return `/catalogo/${product.id}-${product.slug || slugifyProductName(product.name)}`;
}
