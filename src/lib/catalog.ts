import { catalogCollections, deliveryZones } from "@/lib/constants";
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
  material: string;
  finish: string;
  readyToShip: boolean;
};

const filamentCostPerGram = 0.1;

const categoryThemes: Record<string, string[]> = {
  Anime: [
    "Hello Kitty",
    "Mascote chibi",
    "Busto colecionavel",
    "Suporte katana",
    "Placa otaku",
    "Display mecha",
    "Portal tematico",
    "Mini santuario",
    "Logo anime",
    "Base iluminada"
  ],
  Geek: [
    "Suporte de controle",
    "Headset stand",
    "Display colecionavel",
    "Dragao articulado",
    "Placa retro",
    "Dock gamer",
    "Mascote low poly",
    "Organizador de setup",
    "Porta cards",
    "Suporte de headset"
  ],
  Utilitarios: [
    "Porta-chave",
    "Organizador modular",
    "Suporte de celular",
    "Abridor multiuso",
    "Trava de porta",
    "Porta-copos",
    "Clip de cabos",
    "Gancho de parede",
    "Case compacto",
    "Base multiuso"
  ],
  Personalizados: [
    "Nome em 3D",
    "Topo de bolo",
    "Logo de empresa",
    "Brinde de evento",
    "Placa PIX",
    "Tag premium",
    "Trofeu personalizado",
    "QR decorativo",
    "Display de marca",
    "Chaveiro de marca"
  ],
  Decoracao: [
    "Vaso geometrico",
    "Lua decorativa",
    "Mandala",
    "Cachepot texturizado",
    "Escultura espiral",
    "Planeta low poly",
    "Porta-velas",
    "Quadro modular",
    "Luminaria vazada",
    "Estatua abstrata"
  ],
  Escritorio: [
    "Dock de mesa",
    "Porta-canetas",
    "Suporte notebook",
    "Passa-cabos",
    "Stand de celular",
    "Porta-cartoes",
    "Organizador de mesa",
    "Suporte webcam",
    "Mini bandeja",
    "Base para agenda"
  ]
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
  let price = cost * 2.05;

  if (paymentMethod === "cartao") price *= 1.04;
  if (paymentMethod === "boleto") price += 3.49;
  if (paymentMethod === "pix") price *= 1.01;

  if (channel === "mercadolivre") price *= 1.18;
  if (channel === "shopee") price *= 1.14;

  return toPriceEnding(price);
}

function buildColorPalette(index: number) {
  const palettes = [
    ["Preto", "Branco"],
    ["Preto", "Branco", "Azul"],
    ["Preto", "Branco", "Vermelho"],
    ["Preto", "Branco", "Prata"],
    ["Preto", "Branco", "Dourado"],
    ["Preto", "Branco", "Roxo", "Azul"]
  ];

  return palettes[index % palettes.length];
}

function buildMaterial(index: number) {
  return index % 4 === 0 ? "PLA Silk" : "PLA Premium";
}

function buildFinish(index: number) {
  const finishes = ["Acabamento tecnico", "Acabamento premium", "Acabamento texturizado"];
  return finishes[index % finishes.length];
}

function buildDescription(category: string, theme: string, grams: number, hours: number, material: string, finish: string) {
  return `${theme} da linha ${category}, produzido em ${material}, com ${finish.toLowerCase()} e opcao de personalizacao de cor. Peso medio de ${grams} g e janela de impressao estimada em ${hours.toFixed(1)} h para operacao local no Rio de Janeiro.`;
}

function buildProductionWindow(hours: number, readyToShip: boolean) {
  if (readyToShip) return "24h a 48h";
  if (hours <= 4) return "2 dias uteis";
  if (hours <= 8) return "3 dias uteis";
  return "4 a 6 dias uteis";
}

function createCatalog(): Product[] {
  const sizes = [
    { label: "Mini", grams: 35, hours: 1.8, complexity: 0.95 },
    { label: "Compact", grams: 60, hours: 2.6, complexity: 1.0 },
    { label: "Desk", grams: 85, hours: 3.2, complexity: 1.02 },
    { label: "Padrao", grams: 110, hours: 4.1, complexity: 1.08 },
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
        const material = buildMaterial(id);
        const finish = buildFinish(id);
        const readyToShip = sizeIndex <= 1 && themeIndex % 3 === 0;
        const productionWindow = buildProductionWindow(hours, readyToShip);

        products.push({
          id: `mdh-${id}`,
          sku: `MDH-${String(id).padStart(4, "0")}`,
          name: `${theme} ${size.label}`,
          category,
          theme,
          collection: catalogCollections[(id - 1) % catalogCollections.length],
          colors: buildColorPalette(id),
          grams,
          hours,
          complexity,
          featured: sizeIndex === 2 || sizeIndex === 3 || readyToShip,
          description: buildDescription(category, theme, grams, hours, material, finish),
          tags: [
            category.toLowerCase(),
            theme.toLowerCase(),
            size.label.toLowerCase(),
            material.toLowerCase(),
            "rio de janeiro",
            readyToShip ? "pronta entrega" : "sob encomenda"
          ],
          pricePix,
          priceCard,
          marketplaceSuggested,
          productionWindow,
          imageHint: `${category} ${theme}`,
          material,
          finish,
          readyToShip
        });
        id += 1;
      });
    });
  });

  return products;
}

export const catalog = createCatalog();
export const featuredCatalog = catalog.filter((item) => item.featured).slice(0, 12);
export const categories = Array.from(new Set(catalog.map((item) => item.category)));
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

  return catalog.filter((item) =>
    [item.name, item.category, item.theme, item.description, item.collection, ...item.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export const defaultPricingExamples = [
  { title: "Boneco articulado pequeno", grams: 80, hours: 3, complexity: 1.05 },
  { title: "Suporte de controle padrao", grams: 110, hours: 4.1, complexity: 1.08 },
  { title: "Vaso decorativo medio", grams: 150, hours: 5.2, complexity: 1.12 },
  { title: "Organizador geek grande", grams: 300, hours: 9.6, complexity: 1.28 }
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site")
}));

export const deliverySummary = [...deliveryZones];
