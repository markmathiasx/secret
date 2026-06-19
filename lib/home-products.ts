import type { Product } from "@/lib/catalog";
import { getFirstSaleProducts } from "@/lib/commerce/first-sale-products";

export type HomeProductSections = {
  hero: Product[];
  featured: Product[];
  entry: Product[];
  setup: Product[];
  geek: Product[];
  custom: Product[];
};

function byFeaturedThenPrice(left: Product, right: Product) {
  return Number(right.featured) - Number(left.featured) || left.pricePix - right.pricePix || left.name.localeCompare(right.name, "pt-BR");
}

function byPrice(left: Product, right: Product) {
  return left.pricePix - right.pricePix || left.name.localeCompare(right.name, "pt-BR");
}

function matches(product: Product, pattern: RegExp) {
  return pattern.test(`${product.category} ${product.subcategory} ${product.collection} ${product.name} ${product.tags.join(" ")}`);
}

function takeUnique(pool: Product[], count: number, used: Set<string>) {
  const output: Product[] = [];
  for (const product of pool) {
    if (!product?.id || used.has(product.id) || product.pricePix <= 0) continue;
    used.add(product.id);
    output.push(product);
    if (output.length >= count) break;
  }
  return output;
}

export function buildUniqueHomeSections(products: Product[]): HomeProductSections {
  const used = new Set<string>();
  const available = products.filter((product) => product.pricePix > 0);
  const catalogById = new Map(available.map((product) => [product.id, product]));
  const curatedFirstSale = getFirstSaleProducts()
    .map((item) => catalogById.get(item.product.id) || item.product)
    .filter((product) => product.pricePix > 0);
  const featuredPool = [...curatedFirstSale, ...available.filter((product) => product.featured).sort(byFeaturedThenPrice), ...available.sort(byFeaturedThenPrice)];

  const hero = takeUnique(featuredPool, 3, used);
  const featured = takeUnique(featuredPool, 8, used);
  const entry = takeUnique([...available].sort(byPrice).filter((product) => product.pricePix <= 50), 8, used);
  const setup = takeUnique(available.filter((product) => matches(product, /casa|organiza|setup|office|suporte|organizador|mesa|cabos?/i)).sort(byPrice), 8, used);
  const geek = takeUnique(available.filter((product) => matches(product, /geek|colecion|anime|gamer|miniatura|decor|fandom/i)).sort(byFeaturedThenPrice), 8, used);
  const custom = takeUnique(available.filter((product) => product.customizable).sort(byFeaturedThenPrice), 4, used);

  return { hero, featured, entry, setup, geek, custom };
}

export function getHomeDuplicateIds(sections: HomeProductSections) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const products of Object.values(sections)) {
    for (const product of products) {
      if (seen.has(product.id)) duplicates.add(product.id);
      seen.add(product.id);
    }
  }
  return Array.from(duplicates);
}

