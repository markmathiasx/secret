import { calculateCardPrice } from "@/lib/payment-pricing";
import { slugify } from "@/lib/utils";

const PRODUCT_IMAGE_PLACEHOLDER = "/placeholders/product-card.svg";

const termReplacements: Array<[RegExp, string]> = [
  [/\bPok[eé]mon\b/gi, "criatura colecionável"],
  [/\bPikachu\b/gi, "mascote elétrico"],
  [/\bPok[eé]bola\b/gi, "esfera colecionável"],
  [/\bNintendo\b/gi, "console retrô"],
  [/\bGame\s*Boy\b/gi, "portátil retrô"],
  [/\bFire\s*Red\b/gi, "aventura retrô"],
  [/\bKirby\b/gi, "mascote retrô"],
  [/\bEevee\b/gi, "mascote evolutivo"],
  [/\bMario\b/gi, "herói retrô"],
  [/\bHello\s*Kitty\b/gi, "mascote temática"],
  [/\bRick\s*(?:and|&|-)?\s*Morty\b/gi, "dupla sci-fi"],
  [/\bHomer\b/gi, "personagem de humor"],
  [/mdh_impressao3d/gi, "mdh_3d.com.br"],
  [/foto\s+real/gi, "imagem do produto"],
  [/fotos\s+reais/gi, "imagens do produto"],
  [/render\s+fiel/gi, "visual validado"],
  [/12x\s+de/gi, "cartão"],
  [/Fechamento\s+r[áa]pido/gi, "Compra rápida"],
  [/Pre[çc]o\s+claro\s+no\s+site/gi, "Pix e cartão informados antes de comprar"],
];

const blockedImageTerms = [
  "pokemon",
  "pokémon",
  "pikachu",
  "nintendo",
  "game-boy",
  "gameboy",
  "fire-red",
  "fire_red",
  "fire%20red",
  "kirby",
  "eevee",
  "mario",
  "hello-kitty",
  "rick-morty",
  "homer",
];

type PublicProductLike = {
  id?: string;
  slug?: string;
  name?: string;
  category?: string;
  subcategory?: string;
  primaryCategory?: string;
  productTypePath?: string;
  objectType?: string;
  theme?: string;
  collection?: string;
  description?: string;
  dimensions?: string;
  imageHint?: string;
  imageAlt?: string;
  material?: string;
  finish?: string;
  pricingNarrative?: string;
  tags?: string[];
  colors?: string[];
  useCaseTags?: string[];
  seoKeywords?: string[];
  buyingIntents?: string[];
  images?: unknown[];
  image?: string;
  imageUrl?: string;
  primaryImage?: string;
  thumbnail?: string;
  gallery?: unknown[];
  imageGallery?: unknown[];
  media?: unknown[];
  pricePix?: number;
  priceCard?: number;
  variants?: Array<Record<string, unknown>>;
  makerWorldMeta?: Record<string, unknown>;
  csvMeta?: Record<string, unknown>;
};

export function sanitizePublicText(value: unknown) {
  if (typeof value !== "string") return value;
  return termReplacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function sanitizeDimensions(value: unknown) {
  if (typeof value !== "string") return value;
  return value.replace(/(\d)\s*x\s*(\d)/gi, "$1 x $2");
}

function sanitizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => sanitizePublicText(item)).filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : value;
}

function isSafePublicImage(src: unknown) {
  if (typeof src !== "string" || !src.trim()) return false;
  const normalized = src.toLowerCase();
  return !blockedImageTerms.some((term) => normalized.includes(term));
}

function sanitizeImageList(value: unknown) {
  const images = Array.isArray(value) ? value.filter(isSafePublicImage) : [];
  return images.length ? images : [PRODUCT_IMAGE_PLACEHOLDER];
}

function sanitizeMediaList(value: unknown) {
  if (!Array.isArray(value)) return value;
  const safe = value.filter((item) => {
    if (typeof item === "string") return isSafePublicImage(item);
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return isSafePublicImage(record.url) || isSafePublicImage(record.src);
  });
  return safe.length ? safe : [{ url: PRODUCT_IMAGE_PLACEHOLDER, src: PRODUCT_IMAGE_PLACEHOLDER }];
}

function sanitizeNestedObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      typeof item === "string" ? sanitizePublicText(item) : Array.isArray(item) ? sanitizeStringArray(item) : item,
    ])
  );
}

export function sanitizePublicProduct<T extends PublicProductLike>(product: T): T {
  const safeName = String(sanitizePublicText(product.name || "Produto MDH 3D"));
  const safeImages = sanitizeImageList(product.images);
  const safeImage = isSafePublicImage(product.image) ? String(product.image) : String(safeImages[0] || PRODUCT_IMAGE_PLACEHOLDER);
  const pricePix = typeof product.pricePix === "number" ? product.pricePix : undefined;

  return {
    ...product,
    name: safeName,
    slug: product.slug ? slugify(String(sanitizePublicText(product.slug))) : slugify(safeName),
    category: sanitizePublicText(product.category) as T["category"],
    subcategory: sanitizePublicText(product.subcategory) as T["subcategory"],
    primaryCategory: sanitizePublicText(product.primaryCategory) as T["primaryCategory"],
    productTypePath: sanitizePublicText(product.productTypePath) as T["productTypePath"],
    objectType: sanitizePublicText(product.objectType) as T["objectType"],
    theme: sanitizePublicText(product.theme) as T["theme"],
    collection: sanitizePublicText(product.collection) as T["collection"],
    description: sanitizePublicText(product.description) as T["description"],
    dimensions: sanitizeDimensions(product.dimensions) as T["dimensions"],
    imageHint: sanitizePublicText(product.imageHint) as T["imageHint"],
    imageAlt: sanitizePublicText(product.imageAlt || safeName) as T["imageAlt"],
    material: sanitizePublicText(product.material) as T["material"],
    finish: sanitizePublicText(product.finish) as T["finish"],
    pricingNarrative: sanitizePublicText(product.pricingNarrative) as T["pricingNarrative"],
    tags: sanitizeStringArray(product.tags) as T["tags"],
    colors: sanitizeStringArray(product.colors) as T["colors"],
    useCaseTags: sanitizeStringArray(product.useCaseTags) as T["useCaseTags"],
    seoKeywords: sanitizeStringArray(product.seoKeywords) as T["seoKeywords"],
    buyingIntents: sanitizeStringArray(product.buyingIntents) as T["buyingIntents"],
    images: safeImages as T["images"],
    image: safeImage,
    imageUrl: isSafePublicImage(product.imageUrl) ? product.imageUrl : safeImage,
    primaryImage: isSafePublicImage(product.primaryImage) ? product.primaryImage : safeImage,
    thumbnail: isSafePublicImage(product.thumbnail) ? product.thumbnail : safeImage,
    gallery: sanitizeMediaList(product.gallery) as T["gallery"],
    imageGallery: sanitizeMediaList(product.imageGallery) as T["imageGallery"],
    media: sanitizeMediaList(product.media) as T["media"],
    priceCard: typeof pricePix === "number" ? calculateCardPrice(pricePix) : product.priceCard,
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant) => sanitizeNestedObject(variant) as Record<string, unknown>)
      : product.variants,
    makerWorldMeta: undefined as T["makerWorldMeta"],
    csvMeta: undefined as T["csvMeta"],
  };
}

export function sanitizePublicCatalogProducts<T extends PublicProductLike>(products: T[]) {
  return products.map((product) => sanitizePublicProduct(product));
}
