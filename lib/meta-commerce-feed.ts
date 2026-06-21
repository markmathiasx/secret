import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  getProductImageCandidates,
  hasUsableProductImage,
} from "@/lib/product-images";
import { normalizeMoney, roundToCents } from "@/lib/payment-pricing";
import { filterPublicCatalogProducts } from "@/lib/public-catalog";

export const META_COMMERCE_BASE_URL = "https://www.mdh3d.com.br";

export const META_COMMERCE_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
  "google_product_category",
  "product_type",
] as const;

type MetaCommerceColumn = (typeof META_COMMERCE_COLUMNS)[number];

export type MetaCommerceProduct = Record<MetaCommerceColumn, string>;

export type MetaCommerceSkippedProduct = {
  id: string;
  title: string;
  reasons: string[];
};

export type MetaCommerceFeedData = {
  generatedAt: string;
  totalPublicProducts: number;
  totalWithOwnImage: number;
  totalUsingPlaceholder: number;
  included: number;
  skipped: MetaCommerceSkippedProduct[];
  products: MetaCommerceProduct[];
};

const LEGACY_INSTAGRAM_PATTERN = new RegExp(`@?${["mdh", "impressao3d"].join("_")}`, "gi");
const LEGACY_PHONE_PATTERN = new RegExp(`\\(21\\)\\s*${["99999", "9999"].join("-")}`, "gi");

const FORBIDDEN_COPY_PATTERNS = [
  /foto\s+real/gi,
  /fotos\s+reais/gi,
  /render\s+fiel/gi,
  /fechamento\s+r[aá]pido/gi,
  /pre[cç]o\s+claro(?:\s+no\s+site)?/gi,
  /pre[cç]o\s+auditado/gi,
  /simula[cç][aã]o\s+ativa/gi,
  /\b12x(?:\s+de)?\b/gi,
  LEGACY_INSTAGRAM_PATTERN,
  LEGACY_PHONE_PATTERN,
  /@?mdh_3d.com.br/gi,
];

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanPublicCopy(value: unknown, fallback: string) {
  let text = typeof value === "string" ? value : "";
  text = decodeBasicHtmlEntities(text)
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/www\.instagram\.com\/mdh_3d.com.br\/?/gi, "https://www.instagram.com/mdh_3d.com.br/");

  for (const pattern of FORBIDDEN_COPY_PATTERNS) {
    text = text.replace(pattern, " ");
  }

  text = text.replace(/\s+/g, " ").trim();
  return text || fallback;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength - 1).trimEnd();
}

function normalizeRelativePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function toAbsoluteStorefrontUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return null;
  const value = pathOrUrl.trim();
  if (!value) return null;
  if (/^https:\/\/www\.mdh3d\.com\.br\//i.test(value)) return value;
  if (value.startsWith("/")) return `${META_COMMERCE_BASE_URL}${value}`;
  return `${META_COMMERCE_BASE_URL}${normalizeRelativePath(value)}`;
}

function toAbsoluteImageUrl(src: string | null | undefined) {
  if (!src) return null;
  const value = src.trim();
  if (!value || value === PRODUCT_IMAGE_PLACEHOLDER) return null;
  if (/^(?:data|blob|file):/i.test(value)) return null;
  if (/localhost|127\.0\.0\.1|\\/.test(value)) return null;
  if (/^https:\/\//i.test(value)) return value;
  if (/^http:\/\//i.test(value)) return null;
  if (value.startsWith("/")) return `${META_COMMERCE_BASE_URL}${value}`;
  return `${META_COMMERCE_BASE_URL}${normalizeRelativePath(value)}`;
}

function getGoogleProductCategory(product: Product) {
  const category = `${product.primaryCategory || ""} ${product.category || ""} ${product.subcategory || ""}`.toLowerCase();
  if (/casa|organiza|decor|mesa|setup|home office/.test(category)) {
    return "Home & Garden > Decor";
  }
  return "Arts & Entertainment > Hobbies & Creative Arts";
}

function getProductType(product: Product) {
  return product.primaryCategory || product.category || "Impressao 3D";
}

function hasBudgetOnlyCopy(product: Product) {
  const text = `${product.name} ${product.description} ${product.category} ${product.subcategory}`.toLowerCase();
  return /or[cç]amento|sob medida|consultoria|servi[cç]o/.test(text) && normalizeMoney(product.pricePix) <= 0;
}

function getStableId(product: Product) {
  return cleanPublicCopy(product.sku || product.id, product.id).replace(/\s+/g, "-").slice(0, 120);
}

export function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  const escaped = text.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function getMetaAvailability(product: Product) {
  if ((typeof product.stock === "number" && product.stock > 0) || product.readyToShip === true) {
    return "in stock";
  }

  if (product.status === "Sob encomenda") {
    return "preorder";
  }

  return "out of stock";
}

export function getMetaProductImage(product: Product) {
  for (const src of getProductImageCandidates(product)) {
    const absolute = toAbsoluteImageUrl(src);
    if (absolute) return absolute;
  }

  return null;
}

export function getMetaProductUrl(product: Product) {
  return toAbsoluteStorefrontUrl(getProductUrl(product));
}

export function buildMetaCommerceFeedData(): MetaCommerceFeedData {
  const products: MetaCommerceProduct[] = [];
  const skipped: MetaCommerceSkippedProduct[] = [];
  const seenIds = new Set<string>();
  const publicProducts = filterPublicCatalogProducts(catalog).filter((product) => normalizeMoney(product.pricePix ?? product.price) > 0);

  for (const product of publicProducts) {
    try {
      const reasons: string[] = [];
      const id = getStableId(product);
      const title = truncate(cleanPublicCopy(product.name, "Produto MDH 3D"), 150);
      const description = truncate(
        cleanPublicCopy(product.description, `Produto em impressao 3D da MDH 3D: ${title}.`),
        5000
      );
      const pricePix = roundToCents(normalizeMoney(product.pricePix ?? product.price));
      const link = getMetaProductUrl(product);
      const imageLink = getMetaProductImage(product);

      if (!id) reasons.push("missing_id");
      if (seenIds.has(id)) reasons.push("duplicate_id");
      if (!title) reasons.push("missing_title");
      if (!description || description.length < 8) reasons.push("missing_description");
      if (pricePix <= 0) reasons.push("missing_fixed_pix_price");
      if (hasBudgetOnlyCopy(product)) reasons.push("budget_only_product");
      if (!link || !/^https:\/\/www\.mdh3d\.com\.br\//i.test(link)) reasons.push("invalid_product_url");
      if (!imageLink) reasons.push("missing_public_image");

      if (reasons.length > 0) {
        skipped.push({ id: product.id, title: product.name, reasons });
        continue;
      }

      seenIds.add(id);
      products.push({
        id,
        title,
        description,
        availability: getMetaAvailability(product),
        condition: "new",
        price: `${pricePix.toFixed(2)} BRL`,
        link: link as string,
        image_link: imageLink as string,
        brand: "MDH 3D",
        google_product_category: getGoogleProductCategory(product),
        product_type: getProductType(product),
      });
    } catch (error) {
      skipped.push({
        id: String(product?.id || "unknown_product"),
        title: String(product?.name || "Produto invalido"),
        reasons: [`exception_${error instanceof Error ? error.name : "unknown"}`],
      });
    }
  }

  const totalWithOwnImage = publicProducts.filter((product) => hasUsableProductImage(product)).length;

  return {
    generatedAt: new Date().toISOString(),
    totalPublicProducts: publicProducts.length,
    totalWithOwnImage,
    totalUsingPlaceholder: publicProducts.length - totalWithOwnImage,
    included: products.length,
    skipped,
    products,
  };
}

export function buildMetaCommerceProducts() {
  return buildMetaCommerceFeedData().products;
}

export function buildMetaCommerceCsv(products = buildMetaCommerceProducts()) {
  const header = META_COMMERCE_COLUMNS.join(",");
  const lines = products.map((product) => META_COMMERCE_COLUMNS.map((column) => escapeCsv(product[column])).join(","));
  return `${[header, ...lines].join("\n")}\n`;
}
