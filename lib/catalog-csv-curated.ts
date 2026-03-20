import type { Product } from "@/lib/catalog";
import curatedCsvRows from "@/data/catalogo_curado_160_itens_ptbr.json";

type CsvRow = {
  sku: string;
  title_pt: string;
  category: string;
  subcategory: string;
  description_pt_2lines: string;
  price_low_brl: string;
  price_median_brl: string;
  price_high_brl: string;
  margin_pct_suggested: string;
  tags_pt: string;
  photo_url_1: string;
  photo_url_2: string;
  photo_url_3: string;
  thumbnail_url: string;
  source_product_link: string;
  source_marketplace_hint: string;
  source_lang: string;
  shipping_weight_g: string;
  shipping_length_cm: string;
  shipping_width_cm: string;
  shipping_height_cm: string;
  compatibility_notes: string;
  cross_sell_sku_1: string;
  cross_sell_sku_2: string;
  pricing_strategy_notes: string;
};

const PLACEHOLDER_IMAGE = "/catalog-assets/product-placeholder.webp";

function toNumber(value: string, fallback: number) {
  const normalized = (value || "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeCategory(category: string) {
  const key = category.trim().toLowerCase();
  if (key === "chaveiros") return "Presentes Criativos";
  if (key === "decoração" || key === "decoracao") return "Casa & Decoração";
  if (key === "utilitários/ferramentas" || key === "utilitarios/ferramentas") return "Setup & Organização";
  if (key === "colecionáveis/merch" || key === "colecionaveis/merch") return "Geek & Colecionáveis";
  return category;
}

function inferTheme(title: string, tags: string[]) {
  const blob = `${title} ${tags.join(" ")}`.toLowerCase();
  if (blob.includes("valorant")) return "Valorant";
  if (blob.includes("league of legends")) return "League of Legends";
  if (blob.includes("call of duty")) return "Call of Duty";
  if (blob.includes("marvel")) return "Marvel";
  if (blob.includes("star wars")) return "Star Wars";
  if (blob.includes("anime")) return "Anime";
  if (blob.includes("pokémon") || blob.includes("pokemon")) return "Pokémon";
  return "Nerd/Gamer";
}

function inferMaterial(category: string) {
  const key = category.toLowerCase();
  if (key.includes("utilit")) return "PLA+ Reforçado";
  if (key.includes("decor")) return "PLA Silk";
  return "PLA Premium";
}

function inferFinish(category: string) {
  const key = category.toLowerCase();
  if (key.includes("utilit")) return "Texturizado";
  return "Premium";
}

function estimateHoursFromWeight(weightG: number) {
  return Number(Math.max(0.9, Math.min(12, weightG / 30)).toFixed(1));
}

function parseTags(tags: string) {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toImageList(row: CsvRow) {
  const candidates = [row.photo_url_1, row.photo_url_2, row.photo_url_3, row.thumbnail_url]
    .map((value) => value.trim())
    .filter((value) => /^https?:\/\//i.test(value) && !/não verificado/i.test(value));

  if (!candidates.length) return [PLACEHOLDER_IMAGE];
  return candidates;
}

function makeIdFromSku(sku: string) {
  return `csv-${sku.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function hasUnverifiedMedia(row: CsvRow) {
  return [row.photo_url_1, row.photo_url_2, row.photo_url_3, row.thumbnail_url].some((value) => /não verificado/i.test(value || ""));
}

function buildCsvProduct(row: CsvRow, featured: boolean): Product {
  const tags = parseTags(row.tags_pt);
  const category = normalizeCategory(row.category);
  const weightG = Math.max(8, Math.round(toNumber(row.shipping_weight_g, 60)));
  const lengthCm = Math.max(4, toNumber(row.shipping_length_cm, 12));
  const widthCm = Math.max(4, toNumber(row.shipping_width_cm, 8));
  const heightCm = Math.max(2, toNumber(row.shipping_height_cm, 6));
  const images = toImageList(row);
  const priceLow = toNumber(row.price_low_brl, 19.9);
  const priceMedian = toNumber(row.price_median_brl, Math.max(24.9, priceLow));
  const priceHigh = toNumber(row.price_high_brl, Number((priceMedian * 1.2).toFixed(2)));
  const hours = estimateHoursFromWeight(weightG);
  const unverifiedMedia = hasUnverifiedMedia(row);

  return {
    id: makeIdFromSku(row.sku),
    sku: row.sku.trim(),
    name: row.title_pt.trim(),
    category,
    subcategory: row.subcategory.trim(),
    theme: inferTheme(row.title_pt, tags),
    collection: `Curadoria CSV 160 • ${row.category.trim()}`,
    colors: ["Sob consulta"],
    grams: weightG,
    hours,
    complexity: 1.28,
    featured,
    description: row.description_pt_2lines.trim(),
    tags: [
      ...tags,
      row.category.trim(),
      row.subcategory.trim(),
      "deep-research-report",
      "csv-curado-160",
      ...(unverifiedMedia ? ["midia-nao-verificada"] : []),
    ],
    price: priceMedian,
    printTime: `${hours}h`,
    plaWeight: `${weightG}g`,
    dimensions: `${lengthCm}x${widthCm}x${heightCm}cm`,
    images,
    licenseType: "personal",
    variants: [{ color: "Sob consulta", available: true }],
    pricePix: priceMedian,
    priceCard: Number((priceMedian * 1.12).toFixed(2)),
    marketplaceSuggested: priceHigh,
    productionWindow: "3 a 7 dias",
    imageHint: row.title_pt.trim(),
    image: images[0] || PLACEHOLDER_IMAGE,
    material: inferMaterial(row.category),
    finish: inferFinish(row.category),
    status: "Sob encomenda",
    stock: 8,
    customizable: true,
    readyToShip: false,
    csvMeta: {
      sourceProductLink: row.source_product_link.trim(),
      sourceMarketplaceHint: row.source_marketplace_hint.trim(),
      sourceLang: row.source_lang.trim(),
      compatibilityNotes: row.compatibility_notes.trim(),
      crossSellSkus: [row.cross_sell_sku_1.trim(), row.cross_sell_sku_2.trim()].filter(Boolean),
      pricingStrategyNotes: row.pricing_strategy_notes.trim(),
      marginPctSuggested: toNumber(row.margin_pct_suggested, 0),
      priceLowBrl: priceLow,
      priceHighBrl: priceHigh,
      shippingWeightG: weightG,
      shippingLengthCm: lengthCm,
      shippingWidthCm: widthCm,
      shippingHeightCm: heightCm,
      mediaVerified: !unverifiedMedia,
    },
  };
}

const FEATURED_PER_CATEGORY = 4;

const featuredCategoryCount = new Map<string, number>();

export const csvCuratedCatalog: Product[] = (curatedCsvRows as CsvRow[]).map((row) => {
  const category = row.category.trim();
  const current = featuredCategoryCount.get(category) || 0;
  const featured = current < FEATURED_PER_CATEGORY;
  featuredCategoryCount.set(category, current + 1);
  return buildCsvProduct(row, featured);
});

if (csvCuratedCatalog.length !== 160) {
  throw new Error(`Importação CSV inválida: esperado 160 itens, recebido ${csvCuratedCatalog.length}.`);
}
