import { deliveryZones, homepageCollections } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";
export type VisualType = "foto-real" | "render-fiel" | "conceitual";
export type ProductBadge =
  | "Mais vendido"
  | "Foto real"
  | "Personalizável"
  | "Sob encomenda"
  | "Pronta entrega";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  theme: string;
  collection: string;
  fulfillment: "Pronta entrega" | "Sob encomenda" | "Personalizável";
  colors: string[];
  grams: number;
  hours: number;
  complexity: number;
  featured: boolean;
  description: string;
  tags: string[];
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  material: string;
  finish: string;
  badges: ProductBadge[];
  visualType: VisualType;
  visualLabel: string;
  hasRealPhoto: boolean;
};

const filamentCostPerGram = 0.1;

const categoryThemes: Record<string, string[]> = {
  Anime: [
    "Hello Kitty studio",
    "Mascote ninja",
    "Mecha de mesa",
    "Samurai display",
    "Chibi coleção",
    "Katana stand",
    "Placa otaku",
    "Mini busto hero",
    "Base LED anime",
    "Painel fandom",
    "Totem de clã",
    "Figura articulada"
  ],
  Geek: [
    "Suporte de controle",
    "Headset stand",
    "Dock portátil",
    "Logo gamer",
    "Dice tower",
    "Mascote low poly",
    "Organizador setup",
    "Mini troféu",
    "Dragão articulado",
    "Display colecionável",
    "Placa retrô",
    "Luminária geek"
  ],
  Utilitarios: [
    "Suporte celular",
    "Porta-cabos",
    "Organizador de cozinha",
    "Gancho multiuso",
    "Porta-esponja",
    "Trava de porta",
    "Base multiuso",
    "Porta-controle",
    "Clip de mochila",
    "Case de ferramentas",
    "Suporte para tampa",
    "Organizador de banheiro",
    "Vaso geométrico",
    "Porta-chaves",
    "Gancho de parede",
    "Clip de mochila",
    "Base multiuso"
  ],
  Decoracao: [
    "Cachepot texturizado",
    "Luminária shell",
    "Centro de mesa",
    "Bandeja decorativa",
    "Arco decorativo",
    "Porta-velas",
    "Totem de parede",
    "Mandala premium",
    "Escultura fluida",
    "Suporte de cozinha",
    "Placa afetiva",
    "Enfeite de mesa",
    "Porta-joias",
    "Suporte para fotos"
  ],
  Escritorio: [
    "Dock de mesa",
    "Porta-canetas",
    "Suporte notebook",
    "Passa-cabos",
    "Stand celular",
    "Organizador A4",
    "Porta-cartões",
    "Suporte webcam",
    "Mini bandeja",
    "Calendário perpétuo",
    "Base de teclado",
    "Suporte tablet"
  ],
  Personalizados: [
    "Nome em 3D",
    "Topo de bolo",
    "Logo de empresa",
    "Brinde de evento",
    "QR decorativo",
    "Placa Pix",
    "Chaveiro de marca",
    "Troféu exclusivo",
    "Display de produto",
    "Tag premium",
    "Letreiro de festa",
    "Kit corporativo",
    "Kit padrinhos",
    "Caixa de lembrança",
    "Lembrança de aniversário",
    "Presente criativo",
    "Kit festa",
    "Pingente decor",
    "Tag de presente",
    "Logo corporativo",
    "Expositor de balcão",
    "Peça técnica",
    "Brinde de campanha",
    "Maquete visual",
    "Troféu em série",
    "Peça cenográfica",
    "Suporte sob medida",
    "Protótipo visual",
    "Display para feira",
    "Base para produto",
    "Peça de reposição"
  ]
};

const categoryFinishes: Record<string, string[]> = {
  Anime: ["fosco premium", "detalhes finos", "acabamento limpo"],
  Geek: ["fosco premium", "silk em cores especiais", "acabamento limpo"],
  Utilitarios: ["textura funcional", "acabamento resistente", "estrutura reforçada"],
  Decoracao: ["fosco premium", "textura orgânica", "visual decorativo"],
  Escritorio: ["acabamento limpo", "visual minimalista", "uso diário"],
  Personalizados: ["cor sob medida", "acabamento para presente", "identidade visual"]
};

const realPhotoProductIds = new Set(
  (process.env.NEXT_PUBLIC_REAL_PHOTO_PRODUCT_IDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
);

function toPriceEnding(value: number) {
  const ceil = Math.ceil(value);
  return Number((ceil - 0.1).toFixed(2));
}

export function calculateBaseCost(grams: number, hours: number, complexity = 1) {
  const material = grams * filamentCostPerGram;
  const wasteAndSupports = material * 0.1 * complexity;
  const energy = Math.max(0.8, hours * 0.35);
  const machineReserve = Math.max(1.2, hours * 0.45);
  const packaging = grams <= 60 ? 2.5 : grams <= 180 ? 3.9 : 6.5;
  const subtotal = material + wasteAndSupports + energy + machineReserve + packaging;
  const failureReserve = subtotal * 0.2;
  return Number((subtotal + failureReserve).toFixed(2));
}

export function calculateSalePrice(
  grams: number,
  hours: number,
  complexity = 1,
  paymentMethod: PaymentMethod = "pix",
  channel: SalesChannel = "site"
) {
  const cost = calculateBaseCost(grams, hours, complexity);
  let price = cost * 2.08;

  if (paymentMethod === "cartao") price *= 1.04;
  if (paymentMethod === "boleto") price += 3.49;
  if (paymentMethod === "pix") price *= 1.01;

  if (channel === "mercadolivre") price *= 1.18;
  if (channel === "shopee") price *= 1.14;

  return toPriceEnding(price);
}

function buildColorPalette(index: number) {
  const all = ["Preto", "Branco", "Grafite", "Azul", "Vermelho", "Verde", "Dourado", "Prata"];
  if (index % 5 === 0) return ["Preto", "Branco"];
  if (index % 5 === 1) return ["Preto", "Branco", "Azul"];
  if (index % 5 === 2) return ["Preto", "Branco", "Vermelho"];
  if (index % 5 === 3) return ["Preto", "Grafite", "Verde"];
  return all;
}

function buildMaterial(category: string, grams: number, themeIndex: number) {
  if (category === "Utilitarios" || category === "Escritorio") {
    return grams > 180 || themeIndex % 3 === 0 ? "PETG reforçado" : "PLA premium";
  }

  if (category === "Personalizados") {
    return themeIndex % 4 === 0 ? "PETG para marca" : "PLA premium";
  }

  return themeIndex % 5 === 0 ? "PLA silk" : "PLA premium";
}

function buildFinish(category: string, themeIndex: number) {
  const finishes = categoryFinishes[category] || ["acabamento limpo"];
  return finishes[themeIndex % finishes.length];
}

function buildFulfillment(themeIndex: number, sizeIndex: number): Product["fulfillment"] {
  if (sizeIndex <= 1) return "Pronta entrega";
  if ((themeIndex + sizeIndex) % 3 === 0) return "Personalizável";
  return "Sob encomenda";
}

function buildDescription(category: string, theme: string, grams: number, hours: number, material: string, finish: string) {
  return `${theme} da curadoria ${category}, produzida em ${material} com ${finish} e opção de ajuste de cor, escala ou base. Peso médio de ${grams} g e janela de produção de ${hours.toFixed(1)} h.`;
}

function buildProductionWindow(hours: number, fulfillment: Product["fulfillment"]) {
  if (fulfillment === "Pronta entrega") return "Retirada em 24h";
  if (hours <= 4.2) return "1 a 3 dias";
  if (hours <= 7.5) return "3 a 5 dias";
  return "5 a 7 dias";
}

function buildBadges(featured: boolean, fulfillment: Product["fulfillment"], hasRealPhoto: boolean): ProductBadge[] {
  const badges: ProductBadge[] = [];

  if (hasRealPhoto) badges.push("Foto real");
  if (featured) badges.push("Mais vendido");
  if (fulfillment === "Pronta entrega") badges.push("Pronta entrega");
  if (fulfillment === "Sob encomenda") badges.push("Sob encomenda");
  if (fulfillment === "Personalizável") badges.push("Personalizável");

  return badges.slice(0, 3);
}

function createCatalog(): Product[] {
  const sizes = [
    { label: "Mini", grams: 35, hours: 1.8, complexity: 0.95 },
    { label: "Compact", grams: 60, hours: 2.6, complexity: 1.0 },
    { label: "Desk", grams: 85, hours: 3.2, complexity: 1.02 },
    { label: "Padrão", grams: 110, hours: 4.1, complexity: 1.08 },
    { label: "Plus", grams: 145, hours: 5.1, complexity: 1.12 },
    { label: "Max", grams: 190, hours: 6.4, complexity: 1.15 },
    { label: "Wall", grams: 225, hours: 7.2, complexity: 1.2 },
    { label: "Pro", grams: 260, hours: 8.0, complexity: 1.24 },
    { label: "Premium", grams: 310, hours: 9.5, complexity: 1.3 },
    { label: "Collector", grams: 380, hours: 11.0, complexity: 1.38 }
  ];

  const products: Product[] = [];
  let id = 1;

  Object.entries(categoryThemes).forEach(([category, themes]) => {
    themes.forEach((theme, themeIndex) => {
      sizes.forEach((size, sizeIndex) => {
        const grams = size.grams + themeIndex * 4;
        const hours = Number((size.hours + themeIndex * 0.18).toFixed(1));
        const complexity = Number((size.complexity + (themeIndex % 3) * 0.03).toFixed(2));
        const featured = sizeIndex === 3 || sizeIndex === 4 || (themeIndex % 5 === 0 && sizeIndex === 1);
        const material = buildMaterial(category, grams, themeIndex);
        const finish = buildFinish(category, themeIndex);
        const fulfillment = buildFulfillment(themeIndex, sizeIndex);
        const productId = `mdh-${id}`;
        const hasRealPhoto = realPhotoProductIds.has(productId);
        const visualType: VisualType = hasRealPhoto ? "foto-real" : "render-fiel";
        const visualLabel = hasRealPhoto ? "Foto real da peca" : "Render fiel da peca";
        const pricePix = calculateSalePrice(grams, hours, complexity, "pix", "site");
        const priceCard = calculateSalePrice(grams, hours, complexity, "cartao", "site");
        const marketplaceSuggested = calculateSalePrice(grams, hours, complexity, "cartao", "mercadolivre");

        products.push({
          id: productId,
          sku: `MDH-${String(id).padStart(4, "0")}`,
          name: `${theme} ${size.label}`,
          category,
          theme,
          collection: homepageCollections[(id - 1) % homepageCollections.length],
          fulfillment,
          colors: buildColorPalette(id),
          grams,
          hours,
          complexity,
          featured,
          description: buildDescription(category, theme, grams, hours, material, finish),
          tags: [category.toLowerCase(), theme.toLowerCase(), material.toLowerCase(), finish.toLowerCase(), fulfillment.toLowerCase(), "rio de janeiro"],
          pricePix,
          priceCard,
          marketplaceSuggested,
          productionWindow: buildProductionWindow(hours, fulfillment),
          imageHint: `${category} ${theme}`,
          material,
          finish,
          badges: buildBadges(featured, fulfillment, hasRealPhoto),
          visualType,
          visualLabel,
          hasRealPhoto
        });
        id += 1;
      });
    });
  });

  return products;
}

export const catalog = createCatalog();
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 8);
export const categories = Object.keys(categoryThemes);
export const collections = Array.from(new Set(catalog.map((item) => item.collection)));

export function getProductUrl(product: Product) {
  return `/catalogo/${product.id}-${slugify(product.name)}`;
}

export function findProduct(id: string) {
  return catalog.find((item) => item.id === id);
}

export function findProductBySlug(slug: string) {
  const id = slug.split("-").slice(0, 2).join("-");
  return findProduct(id);
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return catalog;
  return catalog.filter((item) => {
    return [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}

export const defaultPricingExamples = [
  { title: "Mascote geek de mesa", grams: 80, hours: 3, complexity: 1.05 },
  { title: "Suporte de controle premium", grams: 110, hours: 4.1, complexity: 1.08 },
  { title: "Vaso decorativo médio", grams: 150, hours: 5.2, complexity: 1.12 },
  { title: "Display sob medida", grams: 300, hours: 9.6, complexity: 1.28 }
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site")
}));

export const deliverySummary = [...deliveryZones];
