import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import type { SupportCategorySummary, SupportIntent, SupportPriceRange, SupportProduct, SupportProductFilters } from "@/lib/support/support-types";

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s/+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getMainImage(product: Product) {
  return product.image || product.images?.[0] || "/placeholder.svg";
}

function toSupportProduct(product: Product): SupportProduct {
  const url = getProductUrl(product);
  const tags = Array.from(new Set([...(product.tags || []), ...(product.useCaseTags || []), ...(product.buyingIntents || [])].filter(Boolean).map(String)));
  const description = String(product.description || "").replace(/\s+/g, " ").trim();
  const searchText = normalizeText([
    product.id,
    product.sku,
    product.name,
    product.category,
    product.subcategory,
    product.primaryCategory,
    product.productTypePath,
    product.collection,
    product.theme,
    product.material,
    product.finish,
    product.status,
    product.description,
    tags.join(" "),
  ].filter(Boolean).join(" "));

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug || product.id,
    name: product.name,
    category: product.category,
    collection: product.collection,
    url,
    pricePix: product.pricePix,
    priceCard: product.priceCard,
    material: product.material,
    finish: product.finish,
    productionWindow: product.productionWindow,
    status: product.status,
    stock: product.stock,
    customizable: Boolean(product.customizable),
    tags,
    description: description.length > 180 ? `${description.slice(0, 177).trim()}...` : description,
    image: getMainImage(product),
    searchText,
  };
}

let supportCatalogIndex: SupportProduct[] | null = null;

export function buildSupportCatalogIndex() {
  if (!supportCatalogIndex) {
    supportCatalogIndex = catalog.map(toSupportProduct);
  }
  return supportCatalogIndex;
}

function intentTerms(intent?: SupportIntent) {
  switch (intent) {
    case "chaveiro":
      return ["chaveiro", "keychain", "pingente", "tag", "lembrancinha"];
    case "presente":
    case "presente_barato":
      return ["presente", "gift", "lembranca", "criativo", "kawaii"];
    case "geek":
      return ["geek", "anime", "colecionavel", "colecionaveis", "chibi", "miniatura", "fandom", "desk toy"];
    case "decoracao":
      return ["decoracao", "decor", "casa", "vaso", "luminaria", "parede", "porta copos"];
    case "setup":
      return ["setup", "mesa", "controle", "fone", "suporte", "dock", "cabo", "home office"];
    case "organizador":
      return ["organizador", "organiza", "gaveta", "porta", "suporte", "holder", "case"];
    case "utilidade":
      return ["utilidade", "funcional", "suporte", "organizador", "cozinha", "banheiro", "gancho"];
    case "personalizado":
      return ["personalizado", "personalizavel", "sob medida", "custom", "nome", "logo", "stl"];
    case "lote_brinde":
      return ["lote", "brinde", "lembrancinha", "corporativo", "quantidade", "evento"];
    default:
      return [];
  }
}

function scoreProduct(product: SupportProduct, queryTerms: string[], filters: SupportProductFilters) {
  let score = 0;
  const searchText = product.searchText;
  const terms = [...queryTerms, ...intentTerms(filters.intent).map(normalizeText)].filter(Boolean);

  for (const term of terms) {
    if (!term) continue;
    if (normalizeText(product.name).includes(term)) score += 12;
    if (normalizeText(product.category).includes(term)) score += 6;
    if (normalizeText(product.collection).includes(term)) score += 4;
    if (product.tags.some((tag) => normalizeText(tag).includes(term))) score += 5;
    if (searchText.includes(term)) score += 2;
  }

  if (filters.intent === "produto_barato" || filters.intent === "presente_barato") score += Math.max(0, 100 - product.pricePix) / 10;
  if (filters.intent === "produto_caro") score += product.pricePix / 20;
  if (filters.customizable && product.customizable) score += 8;
  if (product.status === "Pronta entrega") score += 1.5;
  return score;
}

export function searchSupportProducts(query: string, filters: SupportProductFilters = {}) {
  const limit = Math.min(Math.max(filters.limit || 6, 1), 12);
  const normalized = normalizeText(query);
  const queryTerms = normalized.split(" ").filter((term) => term.length > 2);

  let products = buildSupportCatalogIndex().filter((product) => {
    if (filters.category && !normalizeText(product.category).includes(normalizeText(filters.category))) return false;
    if (typeof filters.minPrice === "number" && product.pricePix < filters.minPrice) return false;
    if (typeof filters.maxPrice === "number" && product.pricePix > filters.maxPrice) return false;
    if (typeof filters.customizable === "boolean" && product.customizable !== filters.customizable) return false;
    return true;
  });

  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, queryTerms, filters) }))
    .filter(({ score }) => score > 0 || filters.sort === "price_asc" || filters.sort === "price_desc" || filters.intent === "produto_barato" || filters.intent === "presente_barato" || filters.intent === "produto_caro");

  products = scored
    .sort((a, b) => {
      if (filters.sort === "price_asc" || filters.intent === "produto_barato" || filters.intent === "presente_barato") return a.product.pricePix - b.product.pricePix || b.score - a.score;
      if (filters.sort === "price_desc" || filters.intent === "produto_caro") return b.product.pricePix - a.product.pricePix || b.score - a.score;
      return b.score - a.score || a.product.pricePix - b.product.pricePix;
    })
    .map(({ product }) => product);

  return products.slice(0, limit);
}

export function getSupportPriceRange(products: SupportProduct[]): SupportPriceRange {
  const prices = products.map((product) => product.pricePix).filter((price) => price > 0);
  return {
    min: prices.length ? Math.min(...prices) : 0,
    max: prices.length ? Math.max(...prices) : 0,
    count: products.length,
  };
}

export function getSupportCategorySummary(category: string): SupportCategorySummary {
  const normalized = normalizeText(category);
  const products = buildSupportCatalogIndex().filter((product) => normalizeText(product.category).includes(normalized));
  return {
    category,
    count: products.length,
    priceRange: getSupportPriceRange(products),
    materials: Array.from(new Set(products.map((product) => product.material).filter(Boolean))).slice(0, 8),
    collections: Array.from(new Set(products.map((product) => product.collection).filter(Boolean))).slice(0, 8),
  };
}

export function getSupportCatalogStats() {
  const products = buildSupportCatalogIndex();
  return {
    products: products.length,
    priceRange: getSupportPriceRange(products),
    categories: Array.from(new Set(products.map((product) => product.category))).sort(),
  };
}
