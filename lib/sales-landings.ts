import type { Product } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { isProductVisualVerified } from "@/lib/product-visuals";

export type SalesLandingConfig = {
  slug: string;
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  title: string;
  description: string;
  heroImage?: string;
  heroImageAlt?: string;
  heroImageLabel?: string;
  proofPoints: string[];
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
    external?: boolean;
  };
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialVerifiedOnly?: boolean;
  initialAvailability?: "Todos" | Product["status"];
  match: (product: Product) => boolean;
  highlightMatch?: (product: Product) => boolean;
};

const lotWhatsappHref = `https://wa.me/${whatsappNumber}?text=Quero%20fechar%20um%20pedido%20em%20lote%20com%20a%20MDH%203D.`;

function sortByCommercialPriority(a: Product, b: Product) {
  return (
    Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a)) ||
    Number(b.featured) - Number(a.featured) ||
    Number(b.readyToShip) - Number(a.readyToShip) ||
    a.pricePix - b.pricePix
  );
}

export const salesLandings = {
  presentes: {
    slug: "/presentes-3d",
    seoTitle: "Presentes 3D personalizados no Rio de Janeiro | MDH 3D",
    seoDescription: "Presentes 3D com foto real, miniaturas afetivas, chaveiros, nomes e peças personalizadas para surpreender com acabamento profissional.",
    kicker: "Presentes 3D",
    title: "Presentes com visual forte, faixa de entrada clara e peças que já ajudam a fechar hoje.",
    description:
      "Essa página foi organizada para quem quer presentear sem perder tempo. Primeiro entram peças com melhor percepção de valor, depois a seleção completa de presentes, lembranças e personalizados.",
    heroImage: "/landing-assets/presentes-hero-v2.webp",
    heroImageAlt: "Hero comercial de presentes 3D com miniatura de família personalizada",
    heroImageLabel: "Hero IA com referência real",
    proofPoints: ["Faixa de entrada enxuta", "Peças com foto real no topo", "Atendimento humano para personalizar"],
    primaryCta: {
      label: "Ver peças para presente",
      href: "/catalogo?category=Presentes%20Criativos&mode=all",
    },
    secondaryCta: {
      label: "Pedir um presente sob medida",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Presentes Criativos",
    initialVerifiedOnly: false,
    match: (product) =>
      product.category === "Presentes Criativos" ||
      /(presente|lembran|personaliz|fam[ií]lia|boneca|chaveiro|nome 3d|trof[eé]u)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
    highlightMatch: (product) =>
      isProductVisualVerified(product) &&
      /(presente|fam[ií]lia|boneca|chaveiro|medalha|personaliz)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
  },
  brindes: {
    slug: "/brindes-personalizados-3d",
    seoTitle: "Brindes personalizados 3D e lotes | MDH 3D",
    seoDescription: "Brindes 3D, chaveiros, medalhas, nomes e peças em lote para eventos, marcas, lembranças e ações promocionais.",
    kicker: "Brindes e lotes",
    title: "Brindes personalizados com produção local, leitura rápida de lote e peças que funcionam bem em evento, marca e lembrança.",
    description:
      "A seleção abaixo foi montada para quem precisa vender ou encomendar em quantidade. Entram primeiro formatos simples de replicar, com boa margem visual e caminho direto para atendimento comercial.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Foto real de medalha e chaveiro personalizado em mesa de apresentação",
    heroImageLabel: "Foto real do ateliê",
    proofPoints: ["Chaveiros, medalhas e nomes 3D", "Fluxo claro para lote", "WhatsApp comercial direto"],
    primaryCta: {
      label: "Abrir seleção de brindes",
      href: "/catalogo?category=Presentes%20Criativos&mode=all&q=chaveiro",
    },
    secondaryCta: {
      label: "Falar sobre pedido em lote",
      href: lotWhatsappHref,
      external: true,
    },
    initialCategory: "Presentes Criativos",
    initialQuery: "chaveiro",
    initialVerifiedOnly: false,
    match: (product) =>
      /(chaveiro|medalha|nome 3d|trof[eé]u|porta-retrato|pingente|calend[aá]rio|lote|institucional|lembran)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
    highlightMatch: (product) =>
      isProductVisualVerified(product) &&
      /(chaveiro|medalha|institucional)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
  },
  setup: {
    slug: "/setup-e-organizacao-3d",
    seoTitle: "Setup e organização 3D para mesa, bancada e home office | MDH 3D",
    seoDescription: "Suportes, organizadores e utilidades 3D para setup, controle, headphone, celular, bancada e rotina prática.",
    kicker: "Setup e organização",
    title: "Utilidades que resolvem uso real de mesa, bancada, banheiro e estação de trabalho sem cara de peça improvisada.",
    description:
      "Essa linha concentra peças com apelo funcional. Primeiro entram utilidades com melhor leitura de uso; depois você pode navegar suportes, organizadores e bases para setup completo.",
    heroImage: "/landing-assets/setup-hero-v2.webp",
    heroImageAlt: "Hero comercial de utilidade 3D em bancada limpa com acabamento funcional",
    heroImageLabel: "Hero IA com referência real",
    proofPoints: ["Suportes e organizadores", "Faixas de preço para compra rápida", "Boa seleção para rotina e presente útil"],
    primaryCta: {
      label: "Ver setup e utilidades",
      href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o&mode=all",
    },
    secondaryCta: {
      label: "Mandar medida do seu setup",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Setup & Organização",
    initialVerifiedOnly: false,
    match: (product) =>
      product.category === "Setup & Organização" ||
      product.category === "Utilidades Reais" ||
      /(suporte|organizador|bancada|headphone|fone|controle|celular|cabos|banheiro|utilidade)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
    highlightMatch: (product) =>
      isProductVisualVerified(product) &&
      /(grinder|porta creme|case|suporte|organizador|bancada)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
  },
  geek: {
    slug: "/colecionaveis-geek-3d",
    seoTitle: "Colecionáveis geek 3D com foto real e peças premium | MDH 3D",
    seoDescription: "Colecionáveis geek 3D, miniaturas e peças inspiradas em cultura pop com curadoria visual, acabamento premium e produção local.",
    kicker: "Geek e colecionáveis",
    title: "Colecionáveis com apelo visual mais forte, melhor leitura de acabamento e peças que funcionam bem para fandom, setup e presente.",
    description:
      "A ideia aqui é reduzir a sensação de catálogo genérico. Entram primeiro as peças com visual validado e depois a seleção mais ampla de colecionáveis, chibis e miniaturas do acervo.",
    heroImage: "/landing-assets/geek-hero.webp",
    heroImageAlt: "Hero comercial de colecionável geek 3D em fundo escuro com clima premium",
    heroImageLabel: "Hero IA com referência real",
    proofPoints: ["Peças reais no topo", "Foco em fandom e presente geek", "Separação clara entre visual validado e sob encomenda"],
    primaryCta: {
      label: "Ver geek com visual validado",
      href: "/catalogo?category=Geek%20%26%20Colecion%C3%A1veis&mode=verified",
    },
    secondaryCta: {
      label: "Pedir personagem sob medida",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Geek & Colecionáveis",
    initialVerifiedOnly: true,
    match: (product) =>
      product.category === "Geek & Colecionáveis" ||
      /(anime|geek|colecion|miniatura|chibi|fandom|cartoon|game)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
    highlightMatch: (product) =>
      isProductVisualVerified(product) &&
      /(demogorgon|hello kitty|homer|stencil|colecion|miniatura|geek)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
  },
  decoracao: {
    slug: "/decoracao-3d-para-casa",
    seoTitle: "Decoração 3D para casa, estante e presente | MDH 3D",
    seoDescription: "Vasos, luminárias, porta-copos e peças de decoração 3D com linguagem mais limpa para casa, mesa e presente.",
    kicker: "Casa e decoração",
    title: "Peças de decoração com cara de produto de loja séria, boas para nicho, aparador, setup e presente de casa nova.",
    description:
      "Essa seleção prioriza objetos que deixam o ambiente mais interessante sem parecer catálogo improvisado. Vasos, luminárias, porta-copos e peças de composição entram com foco em apresentação.",
    heroImage: "/landing-assets/decoracao-hero-v2.webp",
    heroImageAlt: "Hero comercial de decoração 3D com peça decorativa em cenário controlado",
    heroImageLabel: "Hero IA com referência real",
    proofPoints: ["Vasos, luminárias e porta-copos", "Boa entrada para presente leve", "Mistura de decor e utilidade"],
    primaryCta: {
      label: "Ver decoração 3D",
      href: "/catalogo?category=Casa%20%26%20Decora%C3%A7%C3%A3o&mode=all",
    },
    secondaryCta: {
      label: "Pedir peça para um ambiente",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Casa & Decoração",
    initialVerifiedOnly: false,
    match: (product) =>
      product.category === "Casa & Decoração" ||
      /(vaso|lumin[aá]ria|porta-copo|decora[cç][aã]o|escultura|parede|nicho|casa)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
    highlightMatch: (product) =>
      isProductVisualVerified(product) &&
      /(stencil|jedi|rick|decor|lumin[aá]ria|vaso)/i.test(
        [product.name, product.subcategory, product.theme, ...product.tags].join(" ")
      ),
  },
} satisfies Record<string, SalesLandingConfig>;

export function getLandingProducts(products: Product[], config: SalesLandingConfig) {
  return products.filter(config.match).sort(sortByCommercialPriority);
}

export function getLandingHighlights(products: Product[], config: SalesLandingConfig) {
  const highlighted = products.filter(config.highlightMatch || config.match).sort(sortByCommercialPriority);
  return (highlighted.length ? highlighted : getLandingProducts(products, config)).slice(0, 4);
}
