import expansionRows from "@/data/copa-theme-expansion-300.json";
import type { Product } from "@/lib/catalog";
import { calculateCardPrice } from "@/lib/payment-pricing";

type CopaThemeRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  collection: string;
  theme: string;
  kind: string;
  estimatedGrams: number;
  hours: number;
  complexity: number;
  dimensions: string;
  material: string;
  finish: string;
  colors: string[];
  costBreakdown: {
    filament: number;
    machine: number;
    labor: number;
    packaging: number;
    overhead: number;
    totalCost: number;
    pix: number;
    card: number;
  };
  filamentPricePerKg: number;
  profitMarkupPercent: number;
  pricePix: number;
  priceCard: number;
  image: string;
  images: string[];
  tags: string[];
  description: string;
  productionWindow: string;
  customizable: boolean;
  source: string;
  sourceReference: string;
};

function money(value: number) {
  return Number(value.toFixed(2));
}

function buildCopaThemeProduct(row: CopaThemeRow, index: number): Product {
  const baseCost = money(row.costBreakdown.totalCost);
  const pricePix = money(row.pricePix);
  const priceCard = calculateCardPrice(pricePix);

  return {
    id: row.id,
    slug: `${row.slug}-${row.id}`,
    sku: row.sku,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    theme: row.theme,
    collection: row.collection,
    colors: row.colors,
    grams: row.estimatedGrams,
    hours: row.hours,
    complexity: row.complexity,
    featured: index < 18,
    description: row.description,
    tags: row.tags,
    price: pricePix,
    printTime: `${row.hours}h`,
    plaWeight: `${row.estimatedGrams}g`,
    dimensions: row.dimensions,
    images: row.images,
    image: row.image,
    imageAlt: `${row.name} em impressao 3D MDH3D`,
    licenseType: "personal",
    variants: row.colors.map((color) => ({ color, available: true })),
    pricePix,
    priceCard,
    marketplaceSuggested: money(pricePix * 1.18),
    productionWindow: row.productionWindow,
    imageHint: row.name,
    material: row.material,
    finish: row.finish,
    status: "Sob encomenda",
    stock: row.category === "Copa e Futebol" ? 18 : 12,
    customizable: row.customizable,
    readyToShip: false,
    baseCost,
    estimatedUnitCost: baseCost,
    estimatedUnitProfit: money(pricePix - baseCost),
    estimatedHours: row.hours,
    estimatedGrams: row.estimatedGrams,
    spoolPricePerKg: row.filamentPricePerKg,
    machineHourlyRate: 4.5,
    postProcessMinutes: Math.max(8, Math.round(row.complexity * 9)),
    laborHourlyRate: 15,
    packagingCost: row.costBreakdown.packaging,
    overheadPercent: 8,
    profitMode: "markup",
    profitTargetPercent: row.profitMarkupPercent,
    estimatedProfitAmount: money(pricePix - baseCost),
    estimatedProfitPercent: pricePix > 0 ? money(((pricePix - baseCost) / pricePix) * 100) : 0,
    pricingMode: "faixa-auditada",
    pricingNarrative: `Custo estimado R$ ${baseCost.toFixed(2)} com ${row.estimatedGrams}g de PLA e lucro de ${row.profitMarkupPercent}%. Cartao = Pix + R$ 1.`,
    csvMeta: {
      sourceMarketplaceHint: row.sourceReference,
      compatibilityNotes: row.source,
      marginPctSuggested: row.profitMarkupPercent,
      shippingWeightG: row.estimatedGrams,
      mediaVerified: true,
    },
  };
}

export const copaThemeExpansionCatalog: Product[] = (expansionRows as CopaThemeRow[]).map(buildCopaThemeProduct);

if (copaThemeExpansionCatalog.length !== 300) {
  throw new Error(`Expansao Copa/temas invalida: esperado 300 itens, recebido ${copaThemeExpansionCatalog.length}.`);
}
