import type { Metadata } from "next";
import type { Product } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";

export type CategoryPageConfig = {
  slug: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  budgetLabel: string;
  proofPoints: string[];
  faq: Array<{ question: string; answer: string }>;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  highlightMatch?: (product: Product) => boolean;
};

function createCategoryConfig(config: CategoryPageConfig): CategoryPageConfig {
  return config;
}

export const categoryPageConfigs = [
  createCategoryConfig({
    slug: "presentes-criativos",
    category: "Presentes Personalizados",
    seoTitle: "Presentes criativos 3D com SEO comercial forte",
    seoDescription:
      "Categoria de presentes personalizados 3D com CTA claro, mídia do produto, FAQ, faixa inicial e navegação pensada para intenção de compra.",
    eyebrow: "Categoria comercial",
    title: "Presentes criativos organizados para vender mais rapido pela web.",
    description:
      "Esta categoria foi estruturada para quem quer comprar um presente com boa percepcao de valor sem girar a loja inteira. Entram primeiro os itens com melhor leitura de decisao, depois os personalizados e os recortes de maior ticket.",
    budgetLabel: "Faixa inicial a partir de itens compactos no Pix e progressao natural para presentes afetivos e personalizados.",
    proofPoints: ["Presente com valor percebido", "Boa entrada para datas especiais", "Espaco para personalizacao"],
    faq: [
      {
        question: "Esta categoria funciona melhor para que tipo de compra?",
        answer:
          "Ela foi pensada para presente, surpresa, lembranca personalizada e compra por ocasiao. O foco e reduzir atrito entre ideia, mídia do produto e CTA.",
      },
      {
        question: "Tem item pronto e item sob medida no mesmo lugar?",
        answer:
          "Sim. A categoria mistura produtos que ajudam a fechar rapido com rotas claras para personalizacao quando nome, tema ou briefing mudam a decisao.",
      },
      {
        question: "Qual e a melhor forma de acelerar a compra?",
        answer:
          "Comece pelos itens com mídia validada ou pela faixa de entrada. Se a ideia for mais afetiva, use o CTA de projeto sob medida sem abandonar a categoria.",
      },
    ],
    primaryCta: {
      label: "Ver presentes do catalogo",
      href: "/presentes-3d",
    },
    secondaryCta: {
      label: "Pedir presente sob medida",
      href: "/imagem-para-impressao-3d",
    },
  }),
  createCategoryConfig({
    slug: "geek-colecionaveis",
    category: "Geek & Colecionáveis",
    seoTitle: "Colecionáveis geek 3D com categoria preparada para SEO",
    seoDescription:
          "Categoria geek da MDH 3D com miniaturas, displays e peças de fandom com CTA, mídia do produto, FAQ e faixa inicial comercial.",
    eyebrow: "Categoria comercial",
    title: "Geek e colecionaveis em uma categoria que vende pela ideia de fandom, nao por bagunca de vitrine.",
    description:
      "A categoria geek foi organizada para priorizar impacto visual, valor percebido e recortes de compra que fazem sentido para presente, decoracao de setup e colecao. A ideia e ajudar o cliente a decidir sem ficar preso em filtro demais.",
    budgetLabel: "Faixa inicial para miniaturas menores no Pix e progressao para pecas premium, pintadas ou sob briefing.",
    proofPoints: ["Fandom e presente geek", "Visual validado pesa mais", "Boa ponte para miniatura personalizada"],
    faq: [
      {
        question: "O que diferencia esta categoria da vitrine geral?",
        answer:
          "Ela concentra itens com maior apelo de fandom, melhor mídia do produto e contexto de compra mais emocional, sem misturar demais com utilidades ou decoracao de casa.",
      },
      {
        question: "Posso usar esta categoria como base para um personagem sob medida?",
        answer:
          "Sim. A categoria tambem serve como entrada para pedido de personagem, mashup ou adaptacao, mantendo a referencia visual como ponto de partida comercial.",
      },
      {
        question: "Qual CTA faz mais sentido aqui?",
        answer:
          "Se voce ja achou uma peca proxima do ideal, siga para o produto. Se o objetivo for algo mais autoral, use o CTA de miniatura personalizada sem recomeçar a busca do zero.",
      },
    ],
    primaryCta: {
      label: "Abrir colecionaveis geek",
      href: "/colecionaveis-geek-3d",
    },
    secondaryCta: {
      label: "Pedir miniatura personalizada",
      href: "/miniaturas-personalizadas-rio-de-janeiro",
    },
  }),
  createCategoryConfig({
    slug: "setup-organizacao",
    category: "Setup Gamer e Home Office",
    seoTitle: "Setup e organização 3D com categoria otimizada para conversão",
    seoDescription:
      "Categoria de setup e organização 3D com suportes, organizadores e utilidades para mesa, bancada e rotina, com FAQ, mídia e faixa inicial.",
    eyebrow: "Categoria comercial",
    title: "Setup e organizacao como categoria de compra racional, clara e objetiva.",
    description:
      "Esta categoria existe para vender funcao antes de estilo. Ela prioriza suportes, organizadores e itens de uso recorrente que funcionam bem para home office, setup gamer, bancada e presente util.",
    budgetLabel: "Entrada leve para organizadores compactos e escalonamento natural para suportes maiores ou adaptados por medida.",
    proofPoints: ["Compra racional", "Uso real e recompra", "Espaco para ajuste funcional"],
    faq: [
      {
        question: "Que tipo de problema esta categoria resolve melhor?",
        answer:
          "Organizacao de mesa, suporte para objeto especifico, bancada, banheiro e pequenos encaixes de rotina. Ela foi pensada para quem compra por utilidade.",
      },
      {
        question: "Se eu nao achar exatamente a medida, o que acontece?",
        answer:
          "A categoria leva para produtos proximos do ideal e tambem abre uma rota direta para briefing por medida, sem tirar o cliente do contexto funcional da compra.",
      },
      {
        question: "Como esta categoria ajuda no SEO comercial?",
        answer:
          "Ela transforma filtros soltos em uma pagina com contexto, CTA, prova e FAQ, o que ajuda mais em busca organica e em compartilhamento de links comerciais.",
      },
    ],
    primaryCta: {
      label: "Ver setup e organizacao",
      href: "/setup-e-organizacao-3d",
    },
    secondaryCta: {
      label: "Mandar medida do espaco",
      href: "/imagem-para-impressao-3d",
    },
  }),
  createCategoryConfig({
    slug: "utilidades-reais",
    category: "Casa e Organização",
    seoTitle: "Casa e organização em impressão 3D com mídia validada",
    seoDescription:
      "Categoria de casa e organização da MDH 3D com mídia validada, uso claro, faixa inicial, FAQ e CTA para compra ou adaptação funcional.",
    eyebrow: "Categoria comercial",
    title: "Casa e organização para quem quer resolver uso concreto com mídia bem sinalizada.",
    description:
      "Essa categoria concentra projetos reais, itens funcionais e pecas com leitura de uso mais forte. Ela serve para converter melhor quem precisa confiar no objeto antes de comprar ou adaptar.",
    budgetLabel: "Faixa inicial varia com material, reforco estrutural e necessidade de ajuste funcional.",
    proofPoints: ["Imagem validada e uso concreto", "Boa ponte para peca funcional", "Menos promessa vaga, mais contexto real"],
    faq: [
      {
        question: "Por que esta categoria e importante para a MDH 3D?",
        answer:
          "Ela comprova que a operacao nao vive apenas de inspiração solta. Os produtos aqui ajudam a construir confianca para pedidos de uso real e adaptacao funcional.",
      },
      {
        question: "Posso usar um item desta categoria como base para adaptar medida?",
        answer:
          "Sim. Essa e uma das funcoes principais da categoria: mostrar objetos reais que podem orientar ajuste de tamanho, encaixe ou acabamento.",
      },
      {
        question: "O que preciso enviar para pedir uma adaptacao?",
        answer:
          "Medida, foto do contexto de uso e descricao simples do problema que a peca precisa resolver costumam ser suficientes para abrir a conversa certa.",
      },
    ],
    primaryCta: {
      label: "Ver utilidades reais",
      href: "/prototipos-e-pecas-funcionais-rio-de-janeiro",
    },
    secondaryCta: {
      label: "Pedir peca funcional",
      href: "/imagem-para-impressao-3d",
    },
  }),
  createCategoryConfig({
    slug: "casa-decoracao",
    category: "Decoração",
    seoTitle: "Casa e decoração 3D com categoria comercial SEO-first",
    seoDescription:
      "Categoria de decoração 3D com peças para ambiente, presente e nicho, pensada para SEO, mídia do produto, FAQ, CTA e faixa inicial.",
    eyebrow: "Categoria comercial",
    title: "Casa e decoracao tratadas como categoria de ambiente, nao como lista generica de objeto solto.",
    description:
      "A categoria de casa e decoracao foi desenhada para responder a intencao de quem quer ambientar, presentear ou montar um nicho com objetos 3D de leitura mais limpa e comercial.",
    budgetLabel: "Faixa inicial definida pelo tamanho da peça e pelo papel dela no ambiente: apoio, destaque ou presente.",
    proofPoints: ["Ambiente e presente", "Recorte de uso e atmosfera", "Boa ponte para decoracao sob medida"],
    faq: [
      {
        question: "Esta categoria serve so para casa?",
        answer:
          "Nao. Ela tambem atende nicho, setup, aparador, estante e presente de ambiente, sempre que a compra acontece mais pela composicao visual do que pela funcao utilitaria.",
      },
      {
        question: "Como a categoria ajuda a vender melhor?",
        answer:
          "Ela evita que o cliente entre por filtros frios e passa a vender por contexto de uso, mídia, CTA e faixa inicial, o que aproxima mais a jornada de compra real.",
      },
      {
        question: "Se eu quiser algo para um ambiente especifico, como fazer?",
        answer:
          "Use a categoria como base para filtrar linguagem visual e depois abra o CTA de briefing. Isso preserva o contexto comercial em vez de jogar a conversa para fora da loja.",
      },
    ],
    primaryCta: {
      label: "Ver decoracao 3D",
      href: "/decoracao-3d-para-casa",
    },
    secondaryCta: {
      label: "Pedir peca para ambiente",
      href: "/imagem-para-impressao-3d",
    },
  }),
] as const satisfies readonly CategoryPageConfig[];

export function getCategoryPageBySlug(slug: string) {
  return categoryPageConfigs.find((config) => config.slug === slug);
}

export function getCategoryPageStaticParams() {
  return categoryPageConfigs.map((config) => ({
    slug: config.slug,
  }));
}

export function getCategoryPageMetadata(config: CategoryPageConfig): Metadata {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/catalogo/categoria/${config.slug}`;

  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      url: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: config.seoTitle,
      description: config.seoDescription,
    },
  };
}
