import type { Product } from "@/lib/catalog";
import type { ProductVisualKind } from "@/lib/product-visuals";

export type MarketSegment =
  | "personalized-keychain"
  | "headphone-stand"
  | "controller-stand"
  | "desk-utility"
  | "pocket-accessory"
  | "decor-panel"
  | "decor-vase"
  | "chibi-collectible"
  | "articulated-collectible"
  | "painted-collectible"
  | "custom-sculpture"
  | "generic";

export type MarketResearchSource = {
  id: string;
  label: string;
  url: string;
  observed: string;
  note: string;
};

export type MarketBenchmark = {
  segment: MarketSegment;
  label: string;
  min: number;
  anchor: number;
  premium: number;
  sourceIds: string[];
};

export const MARKET_RESEARCH_SNAPSHOT_DATE = "2026-03-19";
export const TARGET_PRICE_MULTIPLE_ON_COST = 3;
export const TARGET_PROFIT_MULTIPLE_ON_COST = 2;

export const marketResearchSources: MarketResearchSource[] = [
  {
    id: "ml-headset-2026-03",
    label: "Mercado Livre - suporte para headset/headphone impresso em 3D",
    url: "https://www.mercadolivre.com.br/suporte-headset-gamer-headphone-fone-ouvido-reforcado-mesa-cor-branco/p/MLB42127840",
    observed: "3 produtos novos a partir de R$25,11",
    note: "Serve como piso de mercado para suporte compacto de fone/headset.",
  },
  {
    id: "elo7-ps5-2026-03",
    label: "Elo7 - suporte premium temático para controles de PS5",
    url: "https://www.elo7.com.br/suporte-premium-coffe-ps5-3d-playstation-5-porta-controles/dp/214B595",
    observed: "R$69,90 ou R$66,40 no Pix",
    note: "Referência para suporte temático premium voltado a setup gamer.",
  },
  {
    id: "ml-ps5-2026-03",
    label: "Mercado Livre - lista de suportes para controles de PS5",
    url: "https://lista.mercadolivre.com.br/suporte-ps5-controles",
    observed: "lista ativa de suportes de mesa e bases para PS5",
    note: "Confirma demanda e competição aberta no segmento de suporte para controles.",
  },
  {
    id: "4most-keychain-2026-03",
    label: "4Most - chaveiro NFC 3D personalizado",
    url: "https://4most.com.br/produtos/chaveiro-personalizado-3d-nfc/",
    observed: "R$15,90",
    note: "Piso de varejo para lembrança personalizada simples com proposta funcional.",
  },
  {
    id: "dunneit-vase-2026-03",
    label: "Dünne It - vasos geométricos decorativos 3D",
    url: "https://www.dunneit.com.br/",
    observed: "vaso pequeno R$78,90, vaso grande R$109,90, dupla R$139,90",
    note: "Faixa forte de decoração premium para peças com apelo visual de casa.",
  },
  {
    id: "magalu-chibi-2026-03",
    label: "Magazine Luiza - boneco Naruto Uzumaki chibi 14 cm",
    url: "https://www.magazineluiza.com.br/busca/star%2Bwars%2Bdarth%2Bvader%2Bpreto%2Bbranco%2Be%2Bvermelho/",
    observed: "R$74,96 no Pix",
    note: "Referência de colecionável chibi de porte médio para público geek.",
  },
  {
    id: "magalu-articulado-2026-03",
    label: "Magazine Luiza - brinquedo articulado estilo desk toy",
    url: "https://www.magazineluiza.com.br/busca/impress%C3%A3o%2B3d%2Barticulado/",
    observed: "R$55,79 no Pix",
    note: "Serve como base para articulados e desk toys de apelo casual.",
  },
  {
    id: "fablab3d-miniatura-2026-03",
    label: "Fab Lab 3D - miniatura 3D de pessoa premium",
    url: "https://www.fablab3d.com.br/w0iyscfjd-impressao-3d-miniatura-3d-de-pessoa-padrao",
    observed: "R$2.298,00 padrão e R$2.998,00 premium",
    note: "Âncora de mercado para miniaturas personalizadas de alto valor agregado.",
  },
];

const MARKET_BENCHMARKS: Record<MarketSegment, MarketBenchmark> = {
  "personalized-keychain": {
    segment: "personalized-keychain",
    label: "Chaveiro ou lembrança personalizada",
    min: 15.9,
    anchor: 24.9,
    premium: 37.9,
    sourceIds: ["4most-keychain-2026-03"],
  },
  "headphone-stand": {
    segment: "headphone-stand",
    label: "Suporte compacto para fone ou headset",
    min: 25.11,
    anchor: 34.9,
    premium: 49.9,
    sourceIds: ["ml-headset-2026-03"],
  },
  "controller-stand": {
    segment: "controller-stand",
    label: "Suporte gamer para controles",
    min: 39.9,
    anchor: 54.9,
    premium: 69.9,
    sourceIds: ["elo7-ps5-2026-03", "ml-ps5-2026-03"],
  },
  "desk-utility": {
    segment: "desk-utility",
    label: "Utilidade compacta de setup ou bancada",
    min: 22.9,
    anchor: 34.9,
    premium: 54.9,
    sourceIds: ["ml-headset-2026-03"],
  },
  "pocket-accessory": {
    segment: "pocket-accessory",
    label: "Acessório de bolso ou utilidade pessoal",
    min: 29.9,
    anchor: 39.9,
    premium: 59.9,
    sourceIds: ["4most-keychain-2026-03"],
  },
  "decor-panel": {
    segment: "decor-panel",
    label: "Decoração de parede, stencil ou painel",
    min: 39.9,
    anchor: 54.9,
    premium: 79.9,
    sourceIds: ["dunneit-vase-2026-03"],
  },
  "decor-vase": {
    segment: "decor-vase",
    label: "Vaso ou peça decorativa de mesa",
    min: 68.9,
    anchor: 89.9,
    premium: 139.9,
    sourceIds: ["dunneit-vase-2026-03"],
  },
  "chibi-collectible": {
    segment: "chibi-collectible",
    label: "Colecionável chibi ou miniatura geek",
    min: 49.9,
    anchor: 74.9,
    premium: 99.9,
    sourceIds: ["magalu-chibi-2026-03"],
  },
  "articulated-collectible": {
    segment: "articulated-collectible",
    label: "Articulado ou desk toy colecionável",
    min: 55.79,
    anchor: 79.9,
    premium: 109.9,
    sourceIds: ["magalu-articulado-2026-03"],
  },
  "painted-collectible": {
    segment: "painted-collectible",
    label: "Colecionável premium pintado à mão",
    min: 89.9,
    anchor: 129.9,
    premium: 189.9,
    sourceIds: ["magalu-chibi-2026-03", "fablab3d-miniatura-2026-03"],
  },
  "custom-sculpture": {
    segment: "custom-sculpture",
    label: "Miniatura ou escultura personalizada",
    min: 189.9,
    anchor: 289.9,
    premium: 2998,
    sourceIds: ["fablab3d-miniatura-2026-03"],
  },
  generic: {
    segment: "generic",
    label: "Produto impresso em 3D de varejo",
    min: 29.9,
    anchor: 49.9,
    premium: 79.9,
    sourceIds: ["ml-headset-2026-03"],
  },
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function toPriceEnding(value: number) {
  const base = Math.max(9, Math.ceil(value));
  return Number((base - 0.1).toFixed(2));
}

function getSizeFactor(product: Pick<Product, "grams" | "hours">) {
  if (product.grams >= 150 || product.hours >= 8) return 1.6;
  if (product.grams >= 110 || product.hours >= 6) return 1.38;
  if (product.grams >= 80 || product.hours >= 4) return 1.22;
  if (product.grams >= 50 || product.hours >= 2.8) return 1.08;
  if (product.grams <= 24 && product.hours <= 1.2) return 0.88;
  return 1;
}

function getValueFactor(
  product: Pick<Product, "customizable" | "finish" | "readyToShip">,
  visualKind: ProductVisualKind
) {
  let factor = 1;

  if (product.customizable) factor *= 1.05;
  if (product.readyToShip) factor *= 1.03;

  const finish = normalizeText(product.finish || "");
  if (finish.includes("pintado")) factor *= 1.18;
  else if (finish.includes("silk")) factor *= 1.08;
  else if (finish.includes("colorido")) factor *= 1.06;

  if (visualKind === "foto-real") factor *= 1.05;
  if (visualKind === "render-fiel") factor *= 1.03;

  return factor;
}

export function inferMarketSegment(product: Pick<Product, "name" | "category" | "subcategory" | "theme" | "tags" | "finish">): MarketSegment {
  const blob = normalizeText(
    [product.name, product.category, product.subcategory, product.theme, product.finish, ...(product.tags || [])].join(" ")
  );

  if (/(familia|família|boneca personalizada|miniatura personalizada|miniatura 3d de pessoa|escultura personalizada)/.test(blob)) {
    return "custom-sculpture";
  }
  if (/(pintado|demogorgon|jedi|homer|mashup)/.test(blob)) {
    return "painted-collectible";
  }
  if (/(articulado|articulada|dragao|dragão|polvo|coruja|desk toy)/.test(blob)) {
    return "articulated-collectible";
  }
  if (/(naruto|sasuke|goku|luffy|elsa|totoro|pikachu|mario|sonic|chibi|anime|hello kitty|creeper|steve|pochita|anya)/.test(blob)) {
    return "chibi-collectible";
  }
  if (/(ps5|playstation|xbox|controle)/.test(blob)) {
    return "controller-stand";
  }
  if (/(headphone|headset|fone)/.test(blob)) {
    return "headphone-stand";
  }
  if (/(chaveiro|medalha|lembrancinha|nome 3d|placa com nome)/.test(blob)) {
    return "personalized-keychain";
  }
  if (/(grinder|isqueiro|case de isqueiro|acessorio de bolso|acessório de bolso)/.test(blob)) {
    return "pocket-accessory";
  }
  if (/(vaso|cachepot|centro de mesa|decora[cç][aã]o de mesa)/.test(blob)) {
    return "decor-vase";
  }
  if (/(stencil|quadro|painel|placa decorativa|luminaria|luminária)/.test(blob)) {
    return "decor-panel";
  }
  if (/(organizador|suporte|porta creme|porta-copos|celular|cabos|setup|utilidade|banheiro|bancada)/.test(blob)) {
    return "desk-utility";
  }

  return "generic";
}

export function getMarketBenchmark(product: Pick<Product, "name" | "category" | "subcategory" | "theme" | "tags" | "finish">) {
  return MARKET_BENCHMARKS[inferMarketSegment(product)];
}

export function getMarketSourcesForBenchmark(benchmark: MarketBenchmark) {
  return benchmark.sourceIds
    .map((id) => marketResearchSources.find((source) => source.id === id))
    .filter((source): source is MarketResearchSource => Boolean(source));
}

export function suggestPixPrice(
  product: Pick<Product, "name" | "category" | "subcategory" | "theme" | "tags" | "finish" | "grams" | "hours" | "customizable" | "readyToShip">,
  baseCost: number,
  visualKind: ProductVisualKind
) {
  const benchmark = getMarketBenchmark(product);
  const sizeFactor = getSizeFactor(product);
  const valueFactor = getValueFactor(product, visualKind);
  const marketReference = benchmark.anchor * sizeFactor * valueFactor;
  const profitabilityFloor = baseCost * TARGET_PRICE_MULTIPLE_ON_COST;
  const pricePix = toPriceEnding(Math.max(benchmark.min, profitabilityFloor, marketReference));
  const priceCard = toPriceEnding(pricePix * 1.12);
  const marketplaceSuggested = toPriceEnding(pricePix * 1.18);
  const estimatedProfit = Number((pricePix - baseCost).toFixed(2));

  return {
    benchmark,
    pricePix,
    priceCard,
    marketplaceSuggested,
    estimatedProfit,
    profitabilityFloor: Number(profitabilityFloor.toFixed(2)),
    pricingMode:
      visualKind === "imagem-conceitual"
        ? ("referencia-de-encomenda" as const)
        : ("faixa-auditada" as const),
    narrative:
      visualKind === "imagem-conceitual"
        ? `Estimativa inicial alinhada ao segmento de ${benchmark.label.toLowerCase()}, sujeita a ajuste por escala, acabamento e personalização.`
        : `Preço confirmado para compra direta, considerando porte da peça, acabamento e faixa atual de ${benchmark.label.toLowerCase()}.`,
  };
}
