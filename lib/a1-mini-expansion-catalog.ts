import expansionRows from "@/data/a1-mini-expansion-500.json";
import type { Product } from "@/lib/catalog";
import { calculateCardPrice } from "@/lib/payment-pricing";

type ExpansionRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  sourceTitle: string;
  sourceProductLink: string;
  sourceImageUrl: string;
  niche: string;
  nicheKey: string;
  category: string;
  subcategory: string;
  collection: string;
  shortDescription: string;
  longDescription: string;
  estimatedGrams: number;
  filamentCostBrl: number;
  minimumSalePriceBrl: number;
  finalPriceBrl: number;
  hours: number;
  dimensions: string;
  image: string;
  images: string[];
  tags: string[];
  material: string;
  finish: string;
  productionWindow: string;
  customizable: boolean;
  commercialLicensePriority: string;
  pricingPreset: string;
};

function money(value: number) {
  return Number(value.toFixed(2));
}

function buildExpansionProduct(row: ExpansionRow, index: number): Product {
  const baseCost = money(row.finalPriceBrl * 0.6);
  const priceCard = calculateCardPrice(row.finalPriceBrl);
  const marketplaceSuggested = money(row.finalPriceBrl * 1.18);

  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    theme: row.niche,
    collection: row.collection,
    colors: ["Preto", "Branco", "Cinza", "Sob consulta"],
    grams: row.estimatedGrams,
    hours: row.hours,
    complexity: 1.18,
    featured: index < 12,
    description: row.shortDescription,
    tags: row.tags,
    price: row.finalPriceBrl,
    printTime: `${row.hours}h`,
    plaWeight: `${row.estimatedGrams}g`,
    dimensions: row.dimensions,
    images: row.images,
    licenseType: "personal",
    variants: [
      { color: "Preto", available: true },
      { color: "Branco", available: true },
      { color: "Cinza", available: true },
      { color: "Sob consulta", available: true },
    ],
    pricePix: row.finalPriceBrl,
    priceCard,
    marketplaceSuggested,
    productionWindow: row.productionWindow,
    imageHint: row.sourceTitle,
    image: row.image,
    imageAlt: `${row.name} em impressão 3D para Bambu Lab A1 Mini`,
    material: row.material,
    finish: row.finish,
    status: "Sob encomenda",
    stock: 12,
    customizable: row.customizable,
    readyToShip: false,
    baseCost,
    estimatedUnitCost: baseCost,
    estimatedUnitProfit: money(row.finalPriceBrl - baseCost),
    pricingMode: "faixa-auditada",
    pricingNarrative: `Preço calculado por peso estimado: ${row.estimatedGrams}g de PLA, custo de filamento em R$ ${row.filamentCostBrl.toFixed(2)} e piso mínimo em R$ ${row.minimumSalePriceBrl.toFixed(2)} antes do arredondamento comercial.`,
    estimatedGrams: row.estimatedGrams,
    filamentCostBrl: row.filamentCostBrl,
    minimumSalePriceBrl: row.minimumSalePriceBrl,
    finalPriceBrl: row.finalPriceBrl,
    makerWorldMeta: {
      niche: row.niche,
      nicheKey: row.nicheKey,
      sourceTitle: row.sourceTitle,
      sourceProductLink: row.sourceProductLink,
      sourceImageUrl: row.sourceImageUrl,
      commercialLicensePriority: row.commercialLicensePriority,
      pricingPreset: row.pricingPreset,
      longDescription: row.longDescription,
    },
  };
}

export const a1MiniExpansionCatalog: Product[] = (expansionRows as ExpansionRow[]).map(buildExpansionProduct);

if (a1MiniExpansionCatalog.length !== 500) {
  throw new Error(`Expansão A1 Mini inválida: esperado 500 itens, recebido ${a1MiniExpansionCatalog.length}.`);
}
