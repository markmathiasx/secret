"use strict";

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
  { id: "compact", seedLabel: "Compact", grams: 72, hours: 2.6, complexity: 0.98 },
  { id: "desk", seedLabel: "Desk", grams: 118, hours: 4.1, complexity: 1.06 },
  { id: "plus", seedLabel: "Plus", grams: 188, hours: 6.2, complexity: 1.15 },
  { id: "collector", seedLabel: "Collector", grams: 278, hours: 9.2, complexity: 1.28 }
] as const;

type VariantId = (typeof variantPresets)[number]["id"];

type ThemeDefinition = {
  category: string;
  theme: string;
  collection: string;
  merchandising: string;
  description: string;
  idealFor: string;
  whereToUse: string;
  customization: string;
  finishHighlight: string;
  socialProof: string;
  colors: string[];
  materials: string[];
  finishNotes: string;
  tags: string[];
  publishedVariants: readonly VariantId[];
  featuredVariants?: readonly VariantId[];
  variantNames: Partial<Record<VariantId, string>>;
  variantSubtitles: Partial<Record<VariantId, string>>;
  variantBadges: Partial<Record<VariantId, string>>;
};

const curatedThemes: ThemeDefinition[] = [
  {
    category: "Presentes Criativos",
    theme: "Hello Kitty Organizer",
    collection: "Presentes Criativos",
    merchandising: "Peça kawaii com apelo imediato para presente, penteadeira e mesa organizada.",
    description:
      "Organizador com leitura delicada, acabamento limpo e cara de presente que chama atenção no quarto, na penteadeira e no setup.",
    idealFor: "presentear, montar kit kawaii ou dar charme a uma mesa compacta",
    whereToUse: "home office, penteadeira, nicho decorado ou cantinho de estudo",
    customization: "nome frontal, detalhe em cor contrastante e combinacao de base sob encomenda",
    finishHighlight: "acabamento acetinado com frente limpa e bordas suaves",
    socialProof: "linha que costuma performar bem em presentes e posts de decoracao",
    colors: ["Branco", "Rosa", "Preto"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Pode receber nome frontal, detalhes em cor contrastante e acabamento acetinado.",
    tags: ["hello kitty", "kawaii", "organizador", "presente criativo", "mesa fofa"],
    publishedVariants: ["compact", "desk", "plus"],
    featuredVariants: ["desk", "plus"],
    variantNames: {
      compact: "Organizador Hello Kitty Mini",
      desk: "Organizador Hello Kitty Desk",
      plus: "Estacao Hello Kitty Duo"
    },
    variantSubtitles: {
      compact: "Versao enxuta para mesa pequena, com visual fofo e utilidade imediata.",
      desk: "Equilibrio entre espaco, organizacao e presenca visual para uso diario.",
      plus: "Leitura mais premium para presente, setup completo ou composicao com outros itens."
    },
    variantBadges: {
      compact: "Presente fofo",
      desk: "Mais pedido",
      plus: "Setup favorito"
    }
  },
  {
    category: "Geek & Anime",
    theme: "Naruto Kunai Display",
    collection: "Geek & Anime",
    merchandising: "Decor geek com presenca cenografica para quarto, estante e setup.",
    description:
      "Display com silhouette forte inspirado no universo ninja, pensado para decorar com mais personalidade do que um suporte comum.",
    idealFor: "fãs de anime, quarto geek, estante de colecao e presente tematico",
    whereToUse: "setup, escritorio, estante, painel de colecionaveis ou bancada gamer",
    customization: "simbolo da vila, combinacao de cores e nome curto gravado sob consulta",
    finishHighlight: "acabamento fosco com linhas marcantes para valorizar a silhueta da peça",
    socialProof: "forte para decor geek, vitrine de presentes e venda assistida no WhatsApp",
    colors: ["Preto", "Laranja", "Cinza grafite"],
    materials: ["PLA premium", "PETG sob consulta"],
    finishNotes: "Aceita gravação de símbolo da vila e personalização por cor.",
    tags: ["naruto", "anime", "decor geek", "display", "colecionavel"],
    publishedVariants: ["desk", "collector"],
    featuredVariants: ["collector"],
    variantNames: {
      desk: "Display Kunai Naruto para Setup",
      collector: "Display Kunai Naruto Signature"
    },
    variantSubtitles: {
      desk: "Versao de bancada para destacar props, canetas ou mini itens de colecao.",
      collector: "Peça statement para quem quer um ponto de destaque mais cenografico."
    },
    variantBadges: {
      desk: "Decor geek",
      collector: "Edicao destaque"
    }
  },
  {
    category: "Geek & Anime",
    theme: "One Piece Wanted Plaque",
    collection: "Geek & Anime",
    merchandising: "Placa de parede e bancada com apelo de presente e colecao para fã.",
    description:
      "Placa inspirada nos cartazes de recompensa, com relevo e presenca visual para transformar quarto, estante ou escritorio.",
    idealFor: "presentear fã de anime, montar parede geek ou destacar a estante",
    whereToUse: "quarto, parede de setup, estante, nicho ou escritorio criativo",
    customization: "nome, frase curta e acabamento envelhecido sob encomenda",
    finishHighlight: "camadas em relevo e visual de poster colecionavel",
    socialProof: "boa peça de entrada para presente geek e composicao de parede",
    colors: ["Areia", "Preto", "Dourado"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber nome, número e acabamento envelhecido.",
    tags: ["one piece", "placa", "decor geek", "parede", "presente anime"],
    publishedVariants: ["compact", "plus"],
    featuredVariants: ["plus"],
    variantNames: {
      compact: "Placa Wanted One Piece Mini",
      plus: "Placa Wanted One Piece Decor"
    },
    variantSubtitles: {
      compact: "Formato ideal para bancada ou composicao com outros itens geek.",
      plus: "Leitura de parede mais marcante para presentear ou montar um canto tematico."
    },
    variantBadges: {
      compact: "Presente geek",
      plus: "Parede favorita"
    }
  },
  {
    category: "Setup & Organizacao",
    theme: "Suporte Controle Duplo",
    collection: "Setup Organizado",
    merchandising: "Campeao de setup para quem quer mesa limpa e visual gamer mais arrumado.",
    description:
      "Suporte robusto para dois controles, com base estavel e desenho pensado para organizar sem pesar a mesa.",
    idealFor: "setup gamer, presente util e organizacao de bancada",
    whereToUse: "mesa gamer, rack, nicho de console ou bancada de streaming",
    customization: "cor de destaque, logo e base com leitura sob encomenda",
    finishHighlight: "acabamento limpo com base firme e encaixe visual simples",
    socialProof: "produto facil de vender em anuncio, reels e catalogo de utilidades",
    colors: ["Preto", "Branco", "Azul"],
    materials: ["PLA premium", "PETG sob consulta"],
    finishNotes: "Pode receber cor de destaque, logo e base antiderrapante.",
    tags: ["setup", "controle", "organizador", "utilidade", "gamer"],
    publishedVariants: ["desk", "plus"],
    featuredVariants: ["desk", "plus"],
    variantNames: {
      desk: "Suporte Duplo para Controle",
      plus: "Dock Duplo para Controle Pro"
    },
    variantSubtitles: {
      desk: "Versao equilibrada para organizar dois controles no dia a dia.",
      plus: "Leitura mais premium para setups maiores e bancadas com mais presença."
    },
    variantBadges: {
      desk: "Mais pedido",
      plus: "Setup premium"
    }
  },
  {
    category: "Setup & Organizacao",
    theme: "Headset Dock Neon",
    collection: "Setup Organizado",
    merchandising: "Peça que valoriza o setup em foto, video curto e uso diario.",
    description:
      "Dock para headset com linhas mais fluidas e leitura premium, pensado para setups RGB e mesas com identidade.",
    idealFor: "streamers, setups RGB, presente util para gamer e mesa mais limpa",
    whereToUse: "home office gamer, bancada de stream e quarto com setup iluminado",
    customization: "nome frontal, detalhe de cor e combinacao com LED sob encomenda",
    finishHighlight: "linhas curvas com base enxuta para destacar o headset",
    socialProof: "ajuda a vender a ideia de setup completo, nao so um acessorio solto",
    colors: ["Preto", "Branco", "Roxo"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Combina com fitas LED, nome frontal e variações de cor por time ou jogo.",
    tags: ["headset", "dock", "setup", "rgb", "organizacao"],
    publishedVariants: ["desk", "plus"],
    featuredVariants: ["plus"],
    variantNames: {
      desk: "Dock para Headset Neon",
      plus: "Dock Headset Neon Signature"
    },
    variantSubtitles: {
      desk: "Versao de entrada para organizar o headset e elevar o visual da mesa.",
      plus: "Mais presença visual para setups que aparecem em video, live ou foto."
    },
    variantBadges: {
      desk: "Utilidade geek",
      plus: "Visual de setup"
    }
  },
  {
    category: "Presentes Criativos",
    theme: "Dragao Articulado Premium",
    collection: "Mais Pedidos",
    merchandising: "Best seller classico da loja, com alto apelo de presente e conteudo social.",
    description:
      "Dragao articulado com movimento fluido e leitura premium, excelente para presentear, decorar e virar conversa na estante.",
    idealFor: "presentear, montar cantinho geek ou chamar atencao em videos curtos",
    whereToUse: "estante, mesa, quarto, escritorio criativo ou colecao pessoal",
    customization: "cores tematicas, combinacao silk e edicao especial sob encomenda",
    finishHighlight: "movimento fluido e leitura premium mesmo em foto de close",
    socialProof: "campeao natural para presentear, reels e vitrine principal",
    colors: ["Preto", "Verde", "Roxo", "Dourado"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Aceita combinações multicoloridas e versões temáticas sob encomenda.",
    tags: ["dragao", "articulado", "presente geek", "colecionavel", "fantasia"],
    publishedVariants: ["compact", "plus", "collector"],
    featuredVariants: ["plus", "collector"],
    variantNames: {
      compact: "Dragao Articulado Pocket",
      plus: "Dragao Articulado Aura",
      collector: "Dragao Articulado Signature"
    },
    variantSubtitles: {
      compact: "Versao de entrada para presente criativo e compra por impulso.",
      plus: "Equilibrio ideal entre presenca visual, movimento e faixa de preco.",
      collector: "Peça de vitrine para quem quer algo mais marcante e colecionavel."
    },
    variantBadges: {
      compact: "Presente criativo",
      plus: "Best seller",
      collector: "Edicao premium"
    }
  },
  {
    category: "Geek & Anime",
    theme: "Dice Tower Mistica",
    collection: "Geek & Anime",
    merchandising: "Item de nicho com cara de presente premium para RPG e fantasia.",
    description:
      "Torre para dados com visual mistico, canal interno estavel e forte leitura de presente para quem ama RPG.",
    idealFor: "mesa de RPG, presente geek mais qualificado e colecao de fantasia",
    whereToUse: "mesa de jogo, estante geek, setup criativo ou sala de hobby",
    customization: "brasao, iniciais e cor tematica sob encomenda",
    finishHighlight: "volume escultural com visual forte mesmo fora da mesa de jogo",
    socialProof: "ajuda a posicionar a loja como criativa, nao so utilitaria",
    colors: ["Preto", "Cinza pedra", "Roxo"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber brasão, iniciais ou base temática.",
    tags: ["rpg", "dice tower", "fantasia", "presente geek", "mesa de jogo"],
    publishedVariants: ["compact", "plus"],
    featuredVariants: ["plus"],
    variantNames: {
      compact: "Dice Tower Mistica Compacta",
      plus: "Dice Tower Mistica Signature"
    },
    variantSubtitles: {
      compact: "Versao de entrada para mesa pequena ou presente rapido.",
      plus: "Mais presença e leitura de peça premium para quem ama RPG."
    },
    variantBadges: {
      compact: "Nicho geek",
      plus: "Favorito RPG"
    }
  },
  {
    category: "Casa & Decoracao",
    theme: "Vaso Geometrico Wave",
    collection: "Casa com Personalidade",
    merchandising: "Decor util com cara de boutique, bom para casa, escritorio e presente.",
    description:
      "Vaso com textura ondulada e leitura escultural para compor plantas secas, arranjos e ambientes contemporaneos.",
    idealFor: "presentes de casa, decor de escritorio e composicao de aparador",
    whereToUse: "sala, home office, quarto, lavabo ou recepcao",
    customization: "kit com tamanhos diferentes, acabamento fosco e cor especial sob encomenda",
    finishHighlight: "textura wave que valoriza luz, sombra e fotografia",
    socialProof: "transversal e elegante, ajuda a loja a parecer mais curada e menos nichada",
    colors: ["Branco", "Areia", "Terracota", "Preto"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber versão fosca, marmorizada ou kit com múltiplos tamanhos.",
    tags: ["vaso", "decoracao", "casa", "presente casa", "minimalista"],
    publishedVariants: ["compact", "plus", "collector"],
    featuredVariants: ["plus"],
    variantNames: {
      compact: "Vaso Wave Mini",
      plus: "Vaso Wave Decor",
      collector: "Vaso Wave Statement"
    },
    variantSubtitles: {
      compact: "Peça delicada para mesa lateral, nicho ou kit de presente.",
      plus: "Tamanho mais comercial para home office, sala ou aparador.",
      collector: "Versao de impacto para canto especial e decoracao com personalidade."
    },
    variantBadges: {
      compact: "Decor delicado",
      plus: "Casa favorita",
      collector: "Statement"
    }
  },
  {
    category: "Casa & Decoracao",
    theme: "Luminaria Lua Vazada",
    collection: "Casa com Personalidade",
    merchandising: "Peça cenografica premium com alto valor percebido para presente e decor.",
    description:
      "Luminaria decorativa com atmosfera suave, desenho vazado e leitura acolhedora para quarto, sala ou estudio.",
    idealFor: "presentear, montar quarto aconchegante ou decorar setup noturno",
    whereToUse: "quarto, sala, escritorio, home studio ou mesa lateral",
    customization: "frase curta, cor do LED e acabamento especial sob encomenda",
    finishHighlight: "efeito de luz suave com desenho que fica bonito ligada ou desligada",
    socialProof: "forte para presente, decor intimista e fotos de ambiente",
    colors: ["Branco", "Perolado", "Dourado"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Compatível com LED interno e personalização de frase.",
    tags: ["luminaria", "lua", "presente", "decoracao quarto", "ambiente"],
    publishedVariants: ["desk", "plus"],
    featuredVariants: ["plus"],
    variantNames: {
      desk: "Luminaria Lua de Mesa",
      plus: "Luminaria Lua Atmosfera"
    },
    variantSubtitles: {
      desk: "Peça de mesa para criar clima mais acolhedor com pouco espaco.",
      plus: "Versao com mais presença para presente premium e decor de ambiente."
    },
    variantBadges: {
      desk: "Quarto favorito",
      plus: "Presente premium"
    }
  },
  {
    category: "Casa & Decoracao",
    theme: "Mandala Orbit",
    collection: "Casa com Personalidade",
    merchandising: "Decor de parede com leitura elegante e boa margem para personalizacao.",
    description:
      "Mandala em camadas com visual leve e sofisticado, pensada para parede, hall, quarto ou composicao de home decor.",
    idealFor: "decorar parede, presentear casa nova ou montar kit de decoracao",
    whereToUse: "sala, hall, quarto, home office ou espaco comercial criativo",
    customization: "bicolor, tamanho sob medida e acabamento especial sob encomenda",
    finishHighlight: "camadas em relevo com visual limpo e facil de combinar",
    socialProof: "ajuda a equilibrar o mix com decoracao adulta e sofisticada",
    colors: ["Branco", "Preto", "Dourado"],
    materials: ["PLA premium"],
    finishNotes: "Pode receber composição bicolor e tamanho sob medida.",
    tags: ["mandala", "parede", "casa", "decoracao", "presente casa"],
    publishedVariants: ["compact", "collector"],
    featuredVariants: ["collector"],
    variantNames: {
      compact: "Mandala Orbit Decor",
      collector: "Mandala Orbit Statement"
    },
    variantSubtitles: {
      compact: "Boa para compor parede ou nicho com leitura leve e elegante.",
      collector: "Versao maior para ser ponto de destaque na decoracao."
    },
    variantBadges: {
      compact: "Parede criativa",
      collector: "Decor premium"
    }
  },
  {
    category: "Sob Encomenda",
    theme: "Placa Pix Premium",
    collection: "Sob Encomenda",
    merchandising: "Linha comercial de giro rapido, ideal para loja local e atendimento por Instagram.",
    description:
      "Placa Pix com presenca comercial limpa para balcão, recepcao, evento ou vitrine, pronta para elevar a percepcao do seu negocio.",
    idealFor: "lojistas, manicures, studios, eventos, feiras e atendimento presencial",
    whereToUse: "balcao, recepcao, caixa, vitrine ou mesa de atendimento",
    customization: "QR, logo, arroba, nome do negocio e acabamento sob medida",
    finishHighlight: "visual comercial limpo com leitura clara para pagamento rapido",
    socialProof: "linha forte para B2B local e atendimento rapido via WhatsApp",
    colors: ["Branco", "Preto", "Verde", "Dourado"],
    materials: ["PLA premium", "Acrilico via parceiro sob consulta"],
    finishNotes: "Recebe QR, logo, arroba e acabamento comercial sob medida.",
    tags: ["placa pix", "negocio", "balcao", "personalizado", "empresa"],
    publishedVariants: ["compact", "plus", "collector"],
    featuredVariants: ["compact", "collector"],
    variantNames: {
      compact: "Placa Pix de Balcao",
      plus: "Placa Pix para Vitrine",
      collector: "Totem Pix Signature"
    },
    variantSubtitles: {
      compact: "Formato direto para pequenos negocios que querem vender melhor no atendimento presencial.",
      plus: "Mais leitura de marca para recepcao, caixa ou mesa de atendimento.",
      collector: "Versao mais premium para quem quer impacto visual no ponto de venda."
    },
    variantBadges: {
      compact: "Giro rapido",
      plus: "Comercial",
      collector: "Sob encomenda"
    }
  },
  {
    category: "Sob Encomenda",
    theme: "Nome 3D Signature",
    collection: "Sob Encomenda",
    merchandising: "Peça versatil para festa, quarto, escritorio e presente com alto valor percebido.",
    description:
      "Nome em 3D com visual limpo e leitura elegante para cenarios afetivos, decoracao, eventos e marca pessoal.",
    idealFor: "presentear, decorar quarto, mesa, festa ou montar um canto com nome proprio",
    whereToUse: "nicho, parede, mesa, festa, recepcao ou quarto infantil",
    customization: "texto, cor, base, espessura e estilo sob medida",
    finishHighlight: "frente limpa com cara de peça assinada e feita sob encomenda",
    socialProof: "produto com cara de presente especial e boa margem em atendimento consultivo",
    colors: ["Branco", "Preto", "Rosa", "Azul"],
    materials: ["PLA premium", "PLA silk sob consulta"],
    finishNotes: "Totalmente personalizável em texto, cor e estilo de base.",
    tags: ["nome 3d", "presente", "decoracao", "festa", "personalizado"],
    publishedVariants: ["compact", "desk", "collector"],
    featuredVariants: ["collector"],
    variantNames: {
      compact: "Nome 3D para Mesa",
      desk: "Nome 3D para Nicho",
      collector: "Nome 3D Signature"
    },
    variantSubtitles: {
      compact: "Formato simpatico para presente, lembranca ou mesa compacta.",
      desk: "Equilibrio entre decoracao e presenca visual para nicho ou aparador.",
      collector: "Leitura premium para presente especial, evento ou quarto autoral."
    },
    variantBadges: {
      compact: "Presente afetivo",
      desk: "Mais versatil",
      collector: "Assinatura"
    }
  }
];

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
      const slug = slugify(`${theme.theme} ${variant.seedLabel}`);
      const id = `mdh-${baseSlug}-${variant.id}`;
      const sortOrder = themeIndex * 10 + variantIndex;
      const published = theme.publishedVariants.includes(variant.id);
      const name = theme.variantNames[variant.id] || `${theme.theme} ${variant.seedLabel}`;
      const variantSubtitle = theme.variantSubtitles[variant.id] || theme.description;
      const badge = theme.variantBadges[variant.id] || theme.collection;

      return {
        id,
        sku: `MDH-${String(sortOrder + 1).padStart(4, "0")}`,
        slug,
        name,
        category: theme.category,
        theme: theme.theme,
        collection: theme.collection,
        colors: [...theme.colors],
        grams,
        hours,
        complexity,
        featured: published && (theme.featuredVariants?.includes(variant.id) ?? variant.id === theme.publishedVariants[0]),
        published,
        description: `${theme.description} ${variantSubtitle}`,
        merchandising: theme.merchandising,
        tags: [...theme.tags, theme.category.toLowerCase(), theme.collection.toLowerCase(), variant.seedLabel.toLowerCase()],
        materials: [...theme.materials],
        finishNotes: theme.finishNotes,
        pricePix,
        priceCard,
        marketplaceSuggested,
        productionWindow: buildProductionWindow(hours),
        imageHint: `${theme.theme} ${theme.category}`,
        imageQuery: `${theme.theme} ${theme.category} ${theme.collection} 3d print product`,
        imagePath: buildImagePath(slug),
        imageAlt: `${name} da MDH 3D`,
        imageStatus: "pending",
        sortOrder,
        metadata: {
          baseTheme: theme.theme,
          variant: variant.seedLabel,
          badge,
          subtitle: variantSubtitle,
          idealFor: theme.idealFor,
          whereToUse: theme.whereToUse,
          customization: theme.customization,
          finishHighlight: theme.finishHighlight,
          socialProof: theme.socialProof,
          giftable: theme.category !== "Setup & Organizacao",
          readyForAds: theme.collection !== "Sob Encomenda"
        }
      };
    })
  );
}

const fullCatalog = createCatalog();

export const catalog = fullCatalog.filter((product) => product.published);
export const hiddenCatalog = fullCatalog.filter((product) => !product.published);
export const featuredCatalog = catalog.filter((product) => product.featured).slice(0, 12);
export const categories = Array.from(new Set(catalog.map((product) => product.category)));
export const collections = Array.from(new Set(catalog.map((product) => product.collection)));
