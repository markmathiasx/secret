import { slugify } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";
export type ProductImageStatus = "pending" | "imported" | "placeholder" | "failed";

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  theme: string;
  collection: string;
  colors: string[];
  grams: number;
  hours: number;
  complexity: number;
  featured: boolean;
  published: boolean;
  description: string;
  merchandising: string;
  tags: string[];
  materials: string[];
  finishNotes: string;
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  imageQuery: string;
  imagePath: string | null;
  imageAlt: string;
  imageStatus: ProductImageStatus;
  sortOrder: number;
  metadata: Record<string, string | number | boolean | null>;
};

const filamentCostPerGram = 0.11;

const variantPresets = [
  { id: "compact", label: "Compact", grams: 72, hours: 2.6, complexity: 0.98 },
  { id: "desk", label: "Desk", grams: 118, hours: 4.1, complexity: 1.06 },
  { id: "plus", label: "Plus", grams: 188, hours: 6.2, complexity: 1.15 },
  { id: "collector", label: "Collector", grams: 278, hours: 9.2, complexity: 1.28 }
] as const;

const curatedCollections = [
  "Otaku Studio",
  "Setup Arena",
  "Liquid Loft",
  "Gift Lab",
  "Creator Tools",
  "Home Upgrade"
] as const;

const curatedThemes = [
  {
    category: "Anime",
    theme: "Hello Kitty Organizer",
    merchandising: "Peça com apelo de presente e mesa decorada, ótima para kits e vendas por impulso.",
    description:
      "Organizador inspirado no universo kawaii, com acabamento limpo, ideal para setup, penteadeira ou home office com personalidade.",
    colors: ["Branco", "Rosa", "Preto"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Pode receber nome frontal, detalhes em cor contrastante e acabamento acetinado.",
    tags: ["anime", "hello kitty", "organizador", "presente", "kawaii"]
  },
  {
    category: "Anime",
    theme: "Naruto Kunai Display",
    merchandising: "Display de coleção com forte apelo geek para decoração de quarto ou estúdio.",
    description:
      "Suporte cenográfico para kunais, canetas ou mini props, pensado para fãs que querem decorar a bancada sem perder utilidade.",
    colors: ["Preto", "Laranja", "Cinza grafite"],
    materials: ["PLA premium", "PETG sob consulta"],
    finishNotes: "Aceita gravação de símbolo da vila e personalização por cor.",
    tags: ["anime", "naruto", "display", "decoracao", "geek"]
  },
  {
    category: "Anime",
    theme: "One Piece Wanted Plaque",
    merchandising: "Peça de parede e bancada com forte leitura visual para presentes e colecionadores.",
    description:
      "Quadro/placa inspirada em cartazes de recompensa, com relevo e profundidade para compor cenários, estantes e setups temáticos.",
    colors: ["Areia", "Preto", "Dourado"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber nome, número e acabamento envelhecido.",
    tags: ["anime", "one piece", "placa", "parede", "presente"]
  },
  {
    category: "Games",
    theme: "Suporte Controle Duplo",
    merchandising: "Produto campeão para setup e ticket de entrada, ótimo para tráfego pago e catálogo principal.",
    description:
      "Suporte robusto para dois controles com base estável, pensado para mesa gamer e organização visual do setup.",
    colors: ["Preto", "Branco", "Azul"],
    materials: ["PLA premium", "PETG sob consulta"],
    finishNotes: "Pode receber cor de destaque, logo e base antiderrapante.",
    tags: ["games", "controle", "setup", "suporte", "organizador"]
  },
  {
    category: "Games",
    theme: "Headset Dock Neon",
    merchandising: "Peça premium para setups e streamers, com ótimo apelo visual em fotos e reels.",
    description:
      "Dock para headset com linhas curvas e presença visual forte, desenhado para valorizar setups RGB sem ocupar muito espaço.",
    colors: ["Preto", "Branco", "Roxo"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Combina com fitas LED, nome frontal e variações de cor por time ou jogo.",
    tags: ["games", "headset", "dock", "setup", "rgb"]
  },
  {
    category: "Geek",
    theme: "Dragao Articulado Premium",
    merchandising: "Best seller clássico com alto potencial de presente, vídeo curto e vitrine principal.",
    description:
      "Dragão articulado com leitura premium e movimento fluido, excelente para decoração, presente e conteúdo de rede social.",
    colors: ["Preto", "Verde", "Roxo", "Dourado"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Aceita combinações multicoloridas e versões temáticas sob encomenda.",
    tags: ["geek", "dragao", "articulado", "presente", "colecionavel"]
  },
  {
    category: "Geek",
    theme: "Dice Tower Mistica",
    merchandising: "Item de nicho com ticket melhor para RPG e presentes geeks mais qualificados.",
    description:
      "Torre para dados com visual místico e canal interno estável, pensada para mesas de RPG e coleções de fantasia.",
    colors: ["Preto", "Cinza pedra", "Roxo"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber brasão, iniciais ou base temática.",
    tags: ["geek", "rpg", "dados", "dice tower", "mesa"]
  },
  {
    category: "Casa",
    theme: "Vaso Geometrico Wave",
    merchandising: "Produto transversal que vende bem em catálogo aberto e conteúdo de decoração.",
    description:
      "Vaso escultural com textura ondulada para plantas secas, arranjos e composição de interiores modernos.",
    colors: ["Branco", "Areia", "Terracota", "Preto"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber versão fosca, marmorizada ou kit com múltiplos tamanhos.",
    tags: ["casa", "decoracao", "vaso", "minimalista", "presente"]
  },
  {
    category: "Decoracao",
    theme: "Luminaria Lua Vazada",
    merchandising: "Peça cenográfica premium com alto valor percebido e ótima conversão em presente.",
    description:
      "Luminária decorativa com desenho vazado e atmosfera suave, ideal para quarto, sala, estúdio e composição de presente.",
    colors: ["Branco", "Perolado", "Dourado"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Compatível com LED interno e personalização de frase.",
    tags: ["decoracao", "luminaria", "lua", "presente", "quarto"]
  },
  {
    category: "Decoracao",
    theme: "Mandala Orbit",
    merchandising: "Peça leve para parede com apelo forte em decoração e personalização.",
    description:
      "Mandala de parede em camadas com presença visual elegante, pensada para salas, halls, quartos e kits de decoração.",
    colors: ["Branco", "Preto", "Dourado"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber composição bicolor e tamanho sob medida.",
    tags: ["decoracao", "mandala", "parede", "presente", "casa"]
  },
  {
    category: "Personalizados",
    theme: "Placa Pix Premium",
    merchandising: "Produto de fluxo de caixa rápido, excelente para B2B local e Instagram.",
    description:
      "Placa Pix de balcão com identidade visual forte, organizada para pequenos negócios, eventos e atendimento presencial.",
    colors: ["Branco", "Preto", "Verde", "Dourado"],
    materials: ["PLA premium", "Acrilico via parceiro sob consulta"],
    finishNotes: "Recebe QR, logo, arroba e acabamento comercial sob medida.",
    tags: ["personalizado", "pix", "negocio", "balcao", "empresa"]
  },
  {
    category: "Personalizados",
    theme: "Nome 3D Signature",
    merchandising: "Peça versátil para quarto, festa, mesa e presente, com boa margem e alto valor percebido.",
    description:
      "Nome em relevo com visual limpo para decoração, branding ou eventos, pronto para presentear ou compor cenários autorais.",
    colors: ["Branco", "Preto", "Rosa", "Azul"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Totalmente personalizável em texto, cor e estilo de base.",
    tags: ["personalizado", "nome 3d", "presente", "festa", "decoracao"]
  }
] as const;

function toPriceEnding(value: number) {
  const ceil = Math.ceil(value);
  return Number((ceil - 0.1).toFixed(2));
}

export function calculateBaseCost(grams: number, hours: number, complexity = 1) {
  const material = grams * filamentCostPerGram;
  const wasteAndSupports = material * 0.12 * complexity;
  const energy = Math.max(1, hours * 0.42);
  const machineReserve = Math.max(1.5, hours * 0.52);
  const packaging = grams <= 90 ? 3.2 : grams <= 180 ? 5.4 : 8.5;
  const subtotal = material + wasteAndSupports + energy + machineReserve + packaging;
  const failureReserve = subtotal * 0.22;
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
  let price = cost * 2.18;

  if (paymentMethod === "cartao") price *= 1.05;
  if (paymentMethod === "boleto") price += 4.5;
  if (paymentMethod === "pix") price *= 1.01;

  if (channel === "mercadolivre") price *= 1.18;
  if (channel === "shopee") price *= 1.13;

  return toPriceEnding(price);
}

function buildProductionWindow(hours: number) {
  if (hours <= 3.4) return "24h";
  if (hours <= 7.2) return "1-2 dias";
  return "2-4 dias";
}

function buildImagePath(slug: string) {
  return `/catalog-assets/${slug}.webp`;
}

function createCatalog(): Product[] {
  return curatedThemes.flatMap((theme, themeIndex) =>
    variantPresets.map((variant, variantIndex) => {
      const grams = variant.grams + themeIndex * 6;
      const hours = Number((variant.hours + themeIndex * 0.18).toFixed(1));
      const complexity = Number((variant.complexity + (themeIndex % 3) * 0.03).toFixed(2));
      const pricePix = calculateSalePrice(grams, hours, complexity, "pix", "site");
      const priceCard = calculateSalePrice(grams, hours, complexity, "cartao", "site");
      const marketplaceSuggested = calculateSalePrice(grams, hours, complexity, "cartao", "mercadolivre");
      const baseSlug = slugify(theme.theme);
      const slug = slugify(`${theme.theme} ${variant.label}`);
      const id = `mdh-${baseSlug}-${variant.id}`;
      const sortOrder = themeIndex * 10 + variantIndex;

      return {
        id,
        sku: `MDH-${String(sortOrder + 1).padStart(4, "0")}`,
        slug,
        name: `${theme.theme} ${variant.label}`,
        category: theme.category,
        theme: theme.theme,
        collection: curatedCollections[themeIndex % curatedCollections.length],
        colors: [...theme.colors],
        grams,
        hours,
        complexity,
        featured: variantIndex <= 1 || theme.category === "Personalizados",
        published: true,
        description: `${theme.description} Versao ${variant.label.toLowerCase()} com producao media de ${hours} h e acabamento pensado para venda premium.`,
        merchandising: theme.merchandising,
        tags: [...theme.tags, variant.label.toLowerCase(), "mdh 3d", "rio de janeiro"],
        materials: [...theme.materials],
        finishNotes: theme.finishNotes,
        pricePix,
        priceCard,
        marketplaceSuggested,
        productionWindow: buildProductionWindow(hours),
        imageHint: `${theme.category} ${theme.theme}`,
        imageQuery: `${theme.theme} ${theme.category} 3d print`,
        imagePath: buildImagePath(slug),
        imageAlt: `${theme.theme} ${variant.label} da MDH 3D`,
        imageStatus: "pending",
        sortOrder,
        metadata: {
          baseTheme: theme.theme,
          variant: variant.label,
          giftable: variantIndex !== 0,
          readyForAds: theme.category !== "Personalizados"
        }
      };
    })
  );
}

export const catalog = createCatalog();
export const featuredCatalog = catalog.filter((product) => product.featured).slice(0, 12);
export const categories = Array.from(new Set(catalog.map((product) => product.category)));
export const collections = Array.from(new Set(catalog.map((product) => product.collection)));
