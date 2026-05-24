import { catalog } from "@/lib/catalog";
import { getLandingHighlights, salesLandings } from "@/lib/sales-landings";

export type ContentWorkflowStage = "brief" | "review" | "approved" | "scheduled" | "published";

export type ContentChannel = "reel" | "carousel" | "story" | "blog" | "faq";

export type ContentWorkflowItem = {
  id: string;
  title: string;
  sourceLabel: string;
  stage: ContentWorkflowStage;
  publishWindow: string;
  owner: string;
  objective: string;
  cta: string;
  channels: Array<{
    channel: ContentChannel;
    status: "planned" | "ready" | "scheduled" | "live";
    deliverable: string;
  }>;
  angles: Array<{
    title: string;
    body: string;
  }>;
  checklist: string[];
};

const featuredProducts = [
  catalog.find((item) => item.id === "real-006"),
  catalog.find((item) => item.id === "real-010"),
  catalog.find((item) => item.id === "real-003"),
  catalog.find((item) => item.id === "real-002"),
].filter((product): product is (typeof catalog)[number] => Boolean(product));

const featuredLandings = [
  salesLandings.presentes,
  salesLandings.brindesEmpresariaisRio,
  salesLandings.projetosRio,
  salesLandings.organizadoresRio,
];

function getStageLabel(stage: ContentWorkflowStage) {
  switch (stage) {
    case "brief":
      return "Brief";
    case "review":
      return "Em revisão";
    case "approved":
      return "Aprovado";
    case "scheduled":
      return "Agendado";
    default:
      return "Publicado";
  }
}

export function getContentWorkflowStageLabel(stage: ContentWorkflowStage) {
  return getStageLabel(stage);
}

function buildProductWorkflow() {
  return featuredProducts.map((product, index) => ({
    id: `product-${product.id}`,
    title: `Pipeline de ${product.name}`,
    sourceLabel: `Produto ${product.sku}`,
    stage: (["review", "approved", "scheduled", "published"] as const)[index] || "brief",
    publishWindow: ["terça 11h", "quarta 18h", "quinta 12h", "sexta 10h"][index] || "próxima janela",
    owner: ["Comercial", "Conteúdo", "Conteúdo", "SEO"][index] || "Conteúdo",
    objective:
      product.customizable
        ? "Levar do produto para o briefing sem perder intenção de compra."
        : "Levar do produto para compra direta e prova social reaproveitável.",
    cta: product.customizable ? "Enviar referência" : "Ver no catálogo",
    channels: [
      {
        channel: "reel",
        status: index === 0 ? "ready" : "planned",
        deliverable: `Hook + close-up + CTA para ${product.name}.`,
      },
      {
        channel: "carousel",
        status: index <= 1 ? "ready" : "planned",
        deliverable: `5 slides com dor, prova, faixa inicial e CTA de ${product.name}.`,
      },
      {
        channel: "story",
        status: index === 2 ? "scheduled" : "planned",
        deliverable: `3 frames com enquete e arraste para ${product.name}.`,
      },
      {
        channel: "blog",
        status: index === 1 ? "scheduled" : "planned",
        deliverable: `Post comercial com uso, faixa inicial e objeções de ${product.name}.`,
      },
      {
        channel: "faq",
        status: "ready",
        deliverable: `FAQ reaproveitável do PDP e da landing ligada a ${product.name}.`,
      },
    ],
    angles: [
      {
        title: `Reel: do scroll para a compra de ${product.name}`,
        body: `Abra com a dor principal, mostre a peça em uso, encaixe a faixa de preço a partir de ${product.pricePix.toFixed(2).replace(".", ",")} no Pix e termine com CTA direto para o site.`,
      },
      {
        title: `Carrossel: por que ${product.name} vende melhor com prova visual`,
        body: "Estruture em cinco blocos: contexto de compra, prova da peça, faixa inicial, objeção quebrada e CTA para a rota certa.",
      },
      {
        title: `Blog: como transformar ${product.name} em busca com intenção`,
        body: "Use o produto como âncora para explicar quando comprar pronto, quando personalizar e como a página reduz atrito entre descoberta e fechamento.",
      },
    ],
    checklist: [
      "Validar honestidade visual: nada de tratar placeholder como imagem validada.",
      "Conferir CTA principal, prova social e faixa inicial ou orçamento.",
      "Garantir reaproveitamento: produto -> Reel -> carrossel -> Story -> blog -> FAQ.",
    ],
  }));
}

function buildLandingWorkflow() {
  return featuredLandings.map((landing, index) => {
    const highlights = getLandingHighlights(catalog, landing);

    return {
      id: `landing-${landing.key}`,
      title: `Campanha de ${landing.kicker}`,
      sourceLabel: landing.slug,
      stage: (["approved", "scheduled", "review", "brief"] as const)[index] || "brief",
      publishWindow: ["segunda 09h", "quarta 09h", "quinta 15h", "sexta 15h"][index] || "próxima janela",
      owner: ["SEO", "Comercial", "Conteúdo", "SEO"][index] || "Conteúdo",
      objective: "Transformar landing comercial em distribuição orgânica e social sem duplicar copy fina.",
      cta: landing.primaryCta.label,
      channels: [
        {
          channel: "reel",
          status: index === 0 ? "ready" : "planned",
          deliverable: `Reel de entrada comercial para ${landing.kicker}.`,
        },
        {
          channel: "carousel",
          status: index <= 2 ? "ready" : "planned",
          deliverable: `Carrossel com dores, prova e rotas de compra de ${landing.kicker}.`,
        },
        {
          channel: "story",
          status: "planned",
          deliverable: `Stories com enquete, bastidor e CTA de ${landing.kicker}.`,
        },
        {
          channel: "blog",
          status: index === 1 ? "scheduled" : "planned",
          deliverable: `Post de apoio SEO e intenção local para ${landing.kicker}.`,
        },
        {
          channel: "faq",
          status: "ready",
          deliverable: `FAQ reaproveitável da landing ${landing.kicker}.`,
        },
      ],
      angles: [
        {
          title: `Entrada social: ${landing.kicker} como recorte de compra`,
          body: `Use a landing como roteiro: dor comercial, prova, faixa de entrada e CTA. Destaque ${highlights[0]?.name || "o item mais forte da linha"} como peça âncora.`,
        },
        {
          title: "Post de blog: busca local + intenção de compra",
          body: "Escreva para decisão, não para volume de palavras. Traga preço inicial, FAQ, prova visual e o CTA principal da landing.",
        },
      ],
      checklist: [
        "Garantir que a peça âncora da campanha exista no site e tenha rota de compra clara.",
        "Não repetir o mesmo gancho em Reel, carrossel e blog; mudar o ângulo e manter o CTA.",
        "Publicar apenas depois de revisão comercial, SEO e autenticidade visual.",
      ],
    } satisfies ContentWorkflowItem;
  });
}

export function getContentWorkflowSnapshot() {
  const items = [...buildProductWorkflow(), ...buildLandingWorkflow()];

  return {
    metrics: {
      total: items.length,
      brief: items.filter((item) => item.stage === "brief").length,
      review: items.filter((item) => item.stage === "review").length,
      approved: items.filter((item) => item.stage === "approved").length,
      scheduled: items.filter((item) => item.stage === "scheduled").length,
      published: items.filter((item) => item.stage === "published").length,
    },
    items,
  };
}
