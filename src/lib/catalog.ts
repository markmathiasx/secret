import {
  calculateBaseCost,
  calculateSalePrice,
  catalog,
  categories,
  collections,
  featuredCatalog,
  type PaymentMethod,
  type Product,
  type ProductImageStatus,
  type SalesChannel
} from "@/lib/catalog-seed";

export {
  calculateBaseCost,
  calculateSalePrice,
  catalog,
  categories,
  collections,
  featuredCatalog,
  type PaymentMethod,
  type Product,
  type ProductImageStatus,
  type SalesChannel
};

export function getProductUrl(product: Pick<Product, "slug">) {
  return `/catalogo/${product.slug}`;
}

export function findProduct(id: string) {
  return catalog.find((item) => item.id === id);
}

export function findProductBySlug(slug: string) {
  return catalog.find((item) => item.slug === slug);
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return catalog;

  return catalog.filter((item) =>
    [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export const defaultPricingExamples = [
  { title: "Dragao articulado premium", grams: 88, hours: 3.4, complexity: 1.06 },
  { title: "Suporte de controle desk", grams: 122, hours: 4.5, complexity: 1.08 },
  { title: "Vaso geometrico plus", grams: 194, hours: 6.3, complexity: 1.15 },
  { title: "Placa Pix comercial", grams: 160, hours: 5.1, complexity: 1.12 }
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site")
}));

