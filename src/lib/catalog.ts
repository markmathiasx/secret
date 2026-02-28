import { deliveryZones, homepageCollections } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";

export type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  theme: string;
  collection: string;
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
};

const filamentCostPerGram = 0.1;

const categoryThemes: Record<string, string[]> = {
  Anime: ["Hello Kitty", "Ninja", "Mecha", "Samurai", "Mascote", "Mini busto", "Chibi", "Placa de parede", "Katana display", "Base LED"],
  Games: ["Suporte controle", "Headset stand", "Dock portátil", "Logo decor", "Card holder", "Case portátil", "Wall mount", "Mascote low poly", "Organizador setup", "Mini troféu"],
  Casa: ["Vaso geométrico", "Porta-chave", "Organizador cozinha", "Gancho adesivo", "Suporte banheiro", "Porta-esponja", "Puxador custom", "Clips multiuso", "Porta-controle remoto", "Luminária shell"],
  Oficina: ["Suporte furadeira", "Clip cabo", "Template de obra", "Marcador de furo", "Trava de gaveta", "Guia de corte", "Organizador parafuso", "Suporte broca", "Calço técnico", "Nivelador"],
  Escritorio: ["Dock mesa", "Porta-canetas", "Suporte notebook", "Passa-cabos", "Calendário perpétuo", "Stand celular", "Porta-cartões", "Organizador de mesa", "Suporte webcam", "Mini bandeja"],
  Decoracao: ["Estátua abstrata", "Lua decorativa", "Planeta low poly", "Luminária vazada", "Placa neon fake", "Cachepot texturizado", "Quadro modular", "Mandala", "Escultura espiral", "Porta-velas"],
  Utilidades: ["Chaveiro", "Abridor", "Porta-copo", "Suporte celular", "Trava de porta", "Organizador mochila", "Presilha", "Case ferramentas", "Porta-escova", "Base multiuso"],
  Geek: ["Dragão articulado", "Cobra articulada", "Mascote slime", "Robot dummy", "Suporte pokémon", "Porta livros", "Display colecionável", "Placa retrô", "Pote temático", "Luminária geek"],
  Pets: ["Comedouro elevado", "Tag nome", "Porta-saquinho", "Suporte coleira", "Brinquedo puzzle", "Plaquinha pet", "Organizador ração", "Gancho guia", "Kit pet mesa", "Decor pet"],
  Personalizados: ["Nome em 3D", "Topo de bolo", "Logo empresa", "Brinde evento", "QR decorativo", "Placa PIX", "Chaveiro marca", "Troféu personalizado", "Display produto", "Tag premium"]
};

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
  let price = cost * 2;

  if (paymentMethod === "cartao") price *= 1.04;
  if (paymentMethod === "boleto") price += 3.49;
  if (paymentMethod === "pix") price *= 1.01;

  if (channel === "mercadolivre") price *= 1.18;
  if (channel === "shopee") price *= 1.14;

  return toPriceEnding(price);
}

function buildColorPalette(index: number) {
  const all = ["Preto", "Branco", "Azul", "Roxo", "Vermelho", "Verde", "Dourado", "Prata"];
  if (index % 4 === 0) return ["Preto", "Branco"];
  if (index % 4 === 1) return ["Preto", "Branco", "Azul"];
  if (index % 4 === 2) return ["Preto", "Branco", "Roxo", "Azul"];
  return all;
}

function buildDescription(category: string, theme: string, grams: number, hours: number) {
  return `${theme} da linha ${category}, produzido em PLA, ideal para venda sob encomenda com acabamento limpo e opção de personalização de cor. Peso médio de ${grams} g e janela de impressão de ${hours.toFixed(1)} h.`;
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
        const pricePix = calculateSalePrice(grams, hours, complexity, "pix", "site");
        const priceCard = calculateSalePrice(grams, hours, complexity, "cartao", "site");
        const marketplaceSuggested = calculateSalePrice(grams, hours, complexity, "cartao", "mercadolivre");

        products.push({
          id: `mdh-${id}`,
          sku: `MDH-${String(id).padStart(4, "0")}`,
          name: `${theme} ${size.label}`,
          category,
          theme,
          collection: homepageCollections[id % homepageCollections.length],
          colors: buildColorPalette(id),
          grams,
          hours,
          complexity,
          featured: sizeIndex === 3 || sizeIndex === 5,
          description: buildDescription(category, theme, grams, hours),
          tags: [category.toLowerCase(), theme.toLowerCase(), size.label.toLowerCase(), "pla", "rio de janeiro"],
          pricePix,
          priceCard,
          marketplaceSuggested,
          productionWindow: hours <= 4 ? "24h" : hours <= 8 ? "1-2 dias" : "2-4 dias",
          imageHint: `${category} ${theme}`
        });
        id += 1;
      });
    });
  });

  return products;
}

export const catalog = createCatalog();
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 12);
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
  { title: "Boneco articulado pequeno", grams: 80, hours: 3, complexity: 1.05 },
  { title: "Suporte de controle padrão", grams: 110, hours: 4.1, complexity: 1.08 },
  { title: "Vaso decorativo médio", grams: 150, hours: 5.2, complexity: 1.12 },
  { title: "Organizador geek grande", grams: 300, hours: 9.6, complexity: 1.28 }
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site")
}));

export const deliverySummary = [...deliveryZones];
