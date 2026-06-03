import type { Metadata } from "next";
import type { Product } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { isProductVisualVerified } from "@/lib/product-visuals";

export type LandingFaq = {
  question: string;
  answer: string;
};

export type SalesLandingConfig = {
  key: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  title: string;
  description: string;
  audience: string;
  budgetLabel: string;
  heroImage?: string;
  heroImageAlt?: string;
  heroImageLabel?: string;
  proofPoints: string[];
  purchaseTriggers: string[];
  process: string[];
  faq: LandingFaq[];
  primaryCta: {
    label: string;
    href: string;
    external?: boolean;
  };
  secondaryCta: {
    label: string;
    href: string;
    external?: boolean;
  };
  initialQuery?: string;
  initialCategory?: string;
  initialCollection?: string;
  initialVisualMode?: "all" | "verified" | "real";
  initialAvailability?: "Todos" | Product["status"];
  match: (product: Product) => boolean;
  highlightMatch?: (product: Product) => boolean;
};

const lotWhatsappHref = buildWhatsappHref(
  "Quero fechar um pedido em lote com a MDH 3D. Pode me orientar sobre quantidade, prazo e faixa inicial?"
);

const projectWhatsappHref = buildWhatsappHref(
  "Quero tirar uma ideia do papel com a MDH 3D. Pode me orientar sobre material, prazo e faixa inicial?"
);

const corporateWhatsappHref = buildWhatsappHref(
  "Quero montar uma proposta de brindes ou presentes corporativos com a MDH 3D."
);

const STATIC_LANDING_KEYS = new Set(["presentes", "brindes", "setup", "geek", "decoracao"]);

function buildWhatsappHref(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function buildFaq(input: {
  focus: string;
  budget: string;
  inputs: string;
  deadline: string;
  batch?: string;
}): LandingFaq[] {
  const items: LandingFaq[] = [
    {
      question: `Como funciona um pedido de ${input.focus}?`,
      answer: input.deadline,
    },
    {
      question: "Qual e a faixa inicial para comecar?",
      answer: input.budget,
    },
    {
      question: "O que acelera a aprovacao do pedido?",
      answer: input.inputs,
    },
  ];

  if (input.batch) {
    items.push({
      question: "Vocês atendem quantidade maior ou repeticao de modelo?",
      answer: input.batch,
    });
  }

  return items;
}

function createLanding(config: Omit<SalesLandingConfig, "heroImageLabel"> & { heroImageLabel?: string }): SalesLandingConfig {
  return {
    ...config,
    heroImageLabel:
      config.heroImageLabel ??
      (config.heroImage && config.heroImage.includes("/products/foto") ? "Mídia validada do atelie" : "Hero IA com referencia real"),
  };
}

function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matchesTerms(product: Product, expression: RegExp) {
  return expression.test(
    normalizeSearchText(
      [
        product.name,
        product.category,
        product.subcategory,
        product.theme,
        product.collection,
        ...product.tags,
      ].join(" ")
    )
  );
}

function sortByCommercialPriority(a: Product, b: Product) {
  return (
    Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a)) ||
    Number(b.featured) - Number(a.featured) ||
    Number(b.readyToShip) - Number(a.readyToShip) ||
    a.pricePix - b.pricePix
  );
}

export const salesLandings = {
  presentes: createLanding({
    key: "presentes",
    slug: "/presentes-3d",
    seoTitle: "Presentes 3D personalizados no Rio de Janeiro",
    seoDescription:
      "Presentes 3D com miniaturas afetivas, nomes, chaveiros, itens geek e projetos personalizados com prova visual, CTA claro e faixa inicial objetiva.",
    kicker: "Presentes 3D",
    title: "Presentes com visual forte, faixa de entrada clara e pecas que ja ajudam a fechar hoje.",
    description:
      "Essa pagina foi organizada para quem quer presentear sem perder tempo. Primeiro entram pecas com melhor percepcao de valor, depois a selecao completa de presentes, lembrancas e personalizados.",
    audience: "Para aniversario, data especial, surpresa personalizada ou presente geek com cara de produto serio.",
    budgetLabel: "Faixa inicial a partir de R$ 37 no Pix para itens compactos e sob consulta para presentes mais afetivos.",
    heroImage: "/landing-assets/presentes-hero-v2.webp",
    heroImageAlt: "Miniatura personalizada e presentes 3D em cena comercial",
    proofPoints: ["Faixa de entrada enxuta", "Pecas com mídia validada no topo", "Atendimento humano para personalizar"],
    purchaseTriggers: [
      "Quando a compra precisa parecer presente de verdade e nao improviso.",
      "Quando faz sentido escolher algo com prova visual antes de entrar no checkout.",
      "Quando nome, cor, tema ou briefing mudam a decisao de compra.",
    ],
    process: [
      "Escolha uma linha de presente pronta ou envie a referencia do que voce quer adaptar.",
      "A equipe confirma material, tamanho, acabamento e prazo antes da producao.",
      "Voce fecha por Pix, checkout ou WhatsApp conforme o nivel de personalizacao.",
    ],
    faq: buildFaq({
      focus: "presente 3D personalizado",
      budget:
        "Itens menores e lembrancas entram a partir de cerca de R$ 37 no Pix. Miniaturas afetivas, kits e presentes mais elaborados sobem conforme tamanho, pintura e briefing.",
      inputs:
        "Foto, referencia visual, nome da pessoa, data do presente e tamanho desejado encurtam a conversa e ajudam a fechar a proposta sem retrabalho.",
      deadline:
        "Voce pode comprar uma peca pronta do catalogo ou pedir algo sob medida. A rota mais rapida e escolher um item com prova visual; a rota mais autoral e mandar a referencia para briefing.",
    }),
    primaryCta: {
      label: "Ver pecas para presente",
      href: "/catalogo/categoria/presentes-criativos",
    },
    secondaryCta: {
      label: "Pedir um presente sob medida",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Presentes Criativos",
    initialVisualMode: "all",
    match: (product) =>
      product.category === "Presentes Criativos" ||
      matchesTerms(product, /(presente|lembran|personaliz|familia|boneca|chaveiro|medalha|nome 3d)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(presente|familia|boneca|chaveiro|medalha|personaliz)/i),
  }),
  brindes: createLanding({
    key: "brindes",
    slug: "/brindes-personalizados-3d",
    seoTitle: "Brindes personalizados 3D e lotes no Rio de Janeiro",
    seoDescription:
      "Brindes 3D, chaveiros, medalhas, nomes e pecas em lote para eventos, marcas, lembrancas e acoes promocionais com atendimento comercial claro.",
    kicker: "Brindes e lotes",
    title: "Brindes personalizados com producao local, leitura rapida de lote e pecas que funcionam bem em evento, marca e lembranca.",
    description:
      "A selecao abaixo foi montada para quem precisa vender ou encomendar em quantidade. Entram primeiro formatos simples de replicar, com boa margem visual e caminho direto para atendimento comercial.",
    audience: "Para empresa, escola, evento, igreja, acao promocional e lembranca repetivel com identidade visual.",
    budgetLabel: "Faixa inicial enxuta para chaveiros e medalhas; lotes maiores dependem de quantidade, acabamento e prazo.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Chaveiro e medalha personalizados em mídia validada",
    proofPoints: ["Chaveiros, medalhas e nomes 3D", "Fluxo claro para lote", "WhatsApp comercial direto"],
    purchaseTriggers: [
      "Quando voce precisa alinhar quantidade e prazo antes do desenho final.",
      "Quando faz sentido padronizar cor, tema ou logotipo em mais de uma unidade.",
      "Quando o pedido precisa nascer para evento, marca ou lembranca institucional.",
    ],
    process: [
      "A MDH 3D valida quantidade, verba, data do evento e referencia visual.",
      "A proposta fecha formato, faixa inicial e melhor rota entre prototipo e lote.",
      "Depois da aprovacao, o atendimento comercial segue no mesmo fio ate a entrega.",
    ],
    faq: buildFaq({
      focus: "brinde 3D em lote",
      budget:
        "Chaveiros, medalhas e pecas simples costumam ser a melhor porta de entrada. O valor final depende principalmente de quantidade, dimensao, acabamento e se existe arte pronta.",
      inputs:
        "Quantidade, data do evento, logo, nome da acao e medida aproximada ajudam a MDH 3D a responder com uma faixa util logo no primeiro retorno.",
      deadline:
        "O fluxo ideal comeca por quantidade e objetivo do lote. Depois disso a equipe fecha a melhor combinacao de formato, espessura, material e prazo de producao.",
      batch:
        "Sim. A operacao ja esta pensada para lotes pequenos e medios com caminho direto para alinhamento comercial, sem empurrar o cliente para uma pagina generica.",
    }),
    primaryCta: {
      label: "Abrir selecao de brindes",
      href: "/chaveiros-personalizados-rio-de-janeiro",
    },
    secondaryCta: {
      label: "Falar sobre pedido em lote",
      href: lotWhatsappHref,
      external: true,
    },
    initialCategory: "Presentes Criativos",
    initialQuery: "chaveiro",
    initialVisualMode: "all",
    match: (product) =>
      matchesTerms(product, /(chaveiro|medalha|nome 3d|trofeu|porta-retrato|pingente|lote|institucional|lembran)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(chaveiro|medalha|institucional)/i),
  }),
  setup: createLanding({
    key: "setup",
    slug: "/setup-e-organizacao-3d",
    seoTitle: "Setup e organizacao 3D para mesa, bancada e home office",
    seoDescription:
      "Suportes, organizadores e utilidades 3D para setup, controle, headphone, celular, bancada e rotina pratica com filtro comercial e faixa inicial clara.",
    kicker: "Setup e organizacao",
    title: "Utilidades que resolvem uso real de mesa, bancada, banheiro e estacao de trabalho sem cara de peca improvisada.",
    description:
      "Essa linha concentra pecas com apelo funcional. Primeiro entram utilidades com melhor leitura de uso; depois voce pode navegar suportes, organizadores e bases para setup completo.",
    audience: "Para home office, setup gamer, bancada, banheiro, rotina de organizacao e presente util.",
    budgetLabel: "Entrada a partir de cerca de R$ 19 no Pix para organizadores pequenos e acima disso para suportes mais robustos.",
    heroImage: "/landing-assets/setup-hero-v2.webp",
    heroImageAlt: "Utilidades 3D em bancada limpa",
    proofPoints: ["Suportes e organizadores", "Faixas de preco para compra rapida", "Boa selecao para rotina e presente util"],
    purchaseTriggers: [
      "Quando a compra e mais racional e o cliente quer ver uso real antes de decidir.",
      "Quando o item precisa resolver organizacao sem exagero visual.",
      "Quando faz sentido abrir pelo funcional e nao pelo colecionavel.",
    ],
    process: [
      "Escolha entre utilidade pronta, ajuste de medida ou projeto sob briefing.",
      "A equipe confirma o melhor material, a area de uso e a estabilidade da peca.",
      "Voce fecha o pedido com preco claro e caminho direto para suporte no pos-venda.",
    ],
    faq: buildFaq({
      focus: "suporte ou organizador 3D",
      budget:
        "Itens compactos entram em ticket baixo e servem bem como compra rapida. Suportes maiores ou pecas sob medida sobem conforme tempo de impressao e material.",
      inputs:
        "Medida do objeto, largura da mesa, foto do espaco e uso principal ajudam a evitar erro de escala e deixam a proposta mais precisa.",
      deadline:
        "Se ja existir uma peca parecida no catalogo, a compra anda mais rapido. Se voce precisa encaixar em um espaco especifico, o melhor caminho e mandar medida e referencia.",
    }),
    primaryCta: {
      label: "Ver setup e utilidades",
      href: "/catalogo/categoria/setup-organizacao",
    },
    secondaryCta: {
      label: "Mandar medida do seu setup",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Setup & Organização",
    initialVisualMode: "all",
    match: (product) =>
      product.category === "Setup & Organização" ||
      product.category === "Utilidades Reais" ||
      matchesTerms(product, /(suporte|organizador|bancada|headphone|fone|controle|celular|cabos|banheiro|utilidade)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(grinder|porta creme|case|suporte|organizador|bancada)/i),
  }),
  geek: createLanding({
    key: "geek",
    slug: "/colecionaveis-geek-3d",
    seoTitle: "Colecionaveis geek 3D com mídia validada e pecas premium",
    seoDescription:
      "Colecionaveis geek 3D, miniaturas e pecas inspiradas em cultura pop com curadoria visual, acabamento premium e producao local.",
    kicker: "Geek e colecionaveis",
    title: "Colecionaveis com apelo visual mais forte, melhor leitura de acabamento e pecas que funcionam bem para fandom, setup e presente.",
    description:
      "A ideia aqui e reduzir a sensacao de catalogo generico. Entram primeiro as pecas com visual validado e depois a selecao mais ampla de colecionaveis, chibis e miniaturas do acervo.",
    audience: "Para fandom, presente geek, decoracao de nicho e colecao com melhor valor percebido.",
    budgetLabel: "Entrada a partir de cerca de R$ 30 no Pix para miniaturas menores e acima disso para pecas pintadas ou mais cenograficas.",
    heroImage: "/landing-assets/geek-hero.webp",
    heroImageAlt: "Colecionavel geek 3D em cenario premium",
    proofPoints: ["Pecas reais no topo", "Foco em fandom e presente geek", "Separacao clara entre visual validado e sob encomenda"],
    purchaseTriggers: [
      "Quando o cliente quer impacto visual logo no primeiro scroll.",
      "Quando a prova visual pesa mais do que especificacao tecnica.",
      "Quando presente geek e decoracao de setup competem pelo mesmo ticket.",
    ],
    process: [
      "Comece pelas pecas com visual validado e compare o estilo que mais combina com o fandom.",
      "Se a ideia estiver proxima, mas nao igual, a equipe ajusta por briefing e escala.",
      "Voce fecha por checkout ou parte para um pedido sob medida sem perder a referencia.",
    ],
    faq: buildFaq({
      focus: "colecionavel geek 3D",
      budget:
        "Miniaturas compactas entram em ticket mais leve. Pecas com pintura, base cenografica ou acabamento premium sobem conforme complexidade e tempo de producao.",
      inputs:
        "Nome do personagem, referencia visual, estilo desejado e tamanho aproximado ajudam a transformar fandom em uma proposta comercial fechavel.",
      deadline:
        "Voce pode comprar um item pronto do recorte geek ou usar a landing como base para pedir um personagem, mashup ou adaptacao em briefing.",
    }),
    primaryCta: {
      label: "Ver geek com visual validado",
      href: "/catalogo/categoria/geek-colecionaveis",
    },
    secondaryCta: {
      label: "Pedir personagem sob medida",
      href: "/miniaturas-personalizadas-rio-de-janeiro",
    },
    initialCategory: "Geek & Colecionáveis",
    initialVisualMode: "verified",
    match: (product) =>
      product.category === "Geek & Colecionáveis" ||
      matchesTerms(product, /(anime|geek|colecion|miniatura|chibi|fandom|cartoon|game)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(demogorgon|hello kitty|homer|stencil|colecion|miniatura|geek)/i),
  }),
  decoracao: createLanding({
    key: "decoracao",
    slug: "/decoracao-3d-para-casa",
    seoTitle: "Decoracao 3D para casa, estante e presente",
    seoDescription:
      "Vasos, luminarias, porta-copos e pecas de decoracao 3D com linguagem mais limpa para casa, mesa, estante e presente.",
    kicker: "Casa e decoracao",
    title: "Pecas de decoracao com cara de produto de loja seria, boas para nicho, aparador, setup e presente de casa nova.",
    description:
      "Essa selecao prioriza objetos que deixam o ambiente mais interessante sem parecer catalogo improvisado. Vasos, luminarias, porta-copos e pecas de composicao entram com foco em apresentacao.",
    audience: "Para casa nova, decoracao de nicho, estante, aparador, setup e presente de ambiente.",
    budgetLabel: "Faixa inicial pensada para objetos decorativos leves e sob consulta para pecas maiores ou mais autorais.",
    heroImage: "/landing-assets/decoracao-hero-v2.webp",
    heroImageAlt: "Peca decorativa 3D em ambiente residencial",
    proofPoints: ["Vasos, luminarias e porta-copos", "Boa entrada para presente leve", "Mistura de decor e utilidade"],
    purchaseTriggers: [
      "Quando o cliente quer decoracao com mais personalidade do que um objeto genrico.",
      "Quando setup, casa e presente disputam o mesmo espaco visual.",
      "Quando a foto da peca pronta ajuda a tirar a duvida de material e acabamento.",
    ],
    process: [
      "Escolha entre pecas decorativas do catalogo ou um recorte mais proximo do ambiente desejado.",
      "A equipe ajuda a validar tamanho, cor e contexto de uso para nao errar a escala.",
      "Se precisar adaptar para nicho, mesa ou parede, o briefing segue pelo mesmo fluxo.",
    ],
    faq: buildFaq({
      focus: "decoracao 3D para casa",
      budget:
        "Objetos compactos e leves costumam ser a melhor entrada. Pecas maiores ou mais cenograficas variam com dimensao, densidade e acabamento.",
      inputs:
        "Foto do ambiente, medida do nicho, paleta de cores e referencia de estilo ajudam a filtrar mais rapido e evitar retrabalho.",
      deadline:
        "Se voce ja gostou de um formato, o mais rapido e usar o item do catalogo como base. Se precisa adaptar para um ambiente especifico, vale abrir o briefing sob medida.",
    }),
    primaryCta: {
      label: "Ver decoracao 3D",
      href: "/catalogo/categoria/casa-decoracao",
    },
    secondaryCta: {
      label: "Pedir peca para um ambiente",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Casa & Decoração",
    initialVisualMode: "all",
    match: (product) =>
      product.category === "Casa & Decoração" ||
      matchesTerms(product, /(vaso|luminaria|porta-copo|decoracao|escultura|parede|nicho|casa)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(stencil|jedi|decor|luminaria|vaso)/i),
  }),
  impressaoRio: createLanding({
    key: "impressaoRio",
    slug: "/impressao-3d-rio-de-janeiro",
    seoTitle: "Impressao 3D no Rio de Janeiro para presentes, utilidades e projetos sob medida",
    seoDescription:
      "MDH 3D no Rio de Janeiro com impressao 3D para presentes, utilidades, decoracao, brindes e projetos personalizados com prova visual e atendimento comercial direto.",
    kicker: "Impressao 3D no Rio",
    title: "A entrada local da MDH 3D para quem quer resolver compra, presente, utilidade ou projeto sob medida sem cair em pagina vaga.",
    description:
      "Essa landing junta os recortes que mais viram venda pela web: compra pronta, personalizados, utilidades e lotes. A ideia e transformar busca local em conversa comercial objetiva.",
    audience: "Para quem procura impressao 3D no Rio de Janeiro com caminho claro para comprar ou pedir orcamento.",
    budgetLabel: "A loja abre com tickets de entrada enxutos para itens pequenos e escala ate projetos sob medida e lotes.",
    heroImage: "/products/foto-007-familia-custom.webp",
    heroImageAlt: "Projeto 3D personalizado produzido pela MDH 3D",
    proofPoints: ["Operacao local no RJ", "Compra pronta e projeto sob medida", "WhatsApp comercial no mesmo fluxo"],
    purchaseTriggers: [
      "Quando a busca comeca pela cidade e nao por um produto exato.",
      "Quando o cliente ainda esta entre comprar uma peca pronta ou pedir algo sob medida.",
      "Quando a localizacao pesa junto com prazo, suporte e prova visual.",
    ],
    process: [
      "A pessoa entra pela necessidade: presente, utilidade, lote ou projeto sob medida.",
      "A MDH 3D filtra o caminho mais curto entre catalogo, briefing ou lote comercial.",
      "A conversa segue com CTA claro, prova visual e faixa inicial antes do fechamento.",
    ],
    faq: buildFaq({
      focus: "impressao 3D no Rio de Janeiro",
      budget:
        "A faixa inicial comeca em tickets leves para pecas pequenas do catalogo. Projetos personalizados, lotes e pecas mais cenograficas variam conforme dimensao, briefing e acabamento.",
      inputs:
        "Foto, ideia, arquivo STL, medida, bairro e prazo desejado ajudam a MDH 3D a indicar o caminho mais rapido entre compra direta e orcamento.",
      deadline:
        "Voce pode entrar pelo catalogo se ja quiser comparar itens prontos ou pela rota de briefing quando a necessidade ainda esta aberta. O importante e nao comecar por uma pagina generica.",
      batch:
        "Sim. A mesma operacao atende pedido unitario, projeto sob medida e lote com conversa comercial direta pelo site ou WhatsApp.",
    }),
    primaryCta: {
      label: "Explorar entradas comerciais",
      href: "/catalogo",
    },
    secondaryCta: {
      label: "Falar com a MDH 3D",
      href: projectWhatsappHref,
      external: true,
    },
    initialVisualMode: "verified",
    match: (product) =>
      product.customizable ||
      product.readyToShip ||
      matchesTerms(product, /(presente|utilidade|geek|decoracao|chaveiro|medalha|familia|organizador)/i),
    highlightMatch: (product) => isProductVisualVerified(product),
  }),
  presentesRio: createLanding({
    key: "presentesRio",
    slug: "/presentes-personalizados-rio-de-janeiro",
    seoTitle: "Presentes personalizados 3D no Rio de Janeiro",
    seoDescription:
      "Presentes personalizados 3D no Rio de Janeiro com miniaturas, nomes, chaveiros, medalhas e projetos afetivos com briefing comercial claro.",
    kicker: "Presentes personalizados RJ",
    title: "Presentes personalizados no Rio para quem quer sair da lembranca comum e fechar algo com contexto, nome, tema ou historia.",
    description:
      "Aqui o foco e o presente personalizado de verdade: miniaturas afetivas, itens com nome, chaveiros, medalhas e pecas que pedem mais conversa do que um simples clique em vitrine.",
    audience: "Para presente afetivo, criativo ou tematico com atendimento local no Rio de Janeiro.",
    budgetLabel: "Comeca com tickets compactos para nomes e chaveiros e sobe quando o presente pede pintura, miniatura ou briefing mais detalhado.",
    heroImage: "/products/foto-008-boneca-crianca.webp",
    heroImageAlt: "Presente personalizado 3D em mídia validada",
    proofPoints: ["Presente com nome, tema ou historia", "Atendimento local no RJ", "Briefing simples antes do fechamento"],
    purchaseTriggers: [
      "Quando o valor percebido vem mais da personalizacao do que do tamanho da peca.",
      "Quando a historia do presente pesa tanto quanto o objeto final.",
      "Quando a compra precisa de uma conversa curta para fechar direito.",
    ],
    process: [
      "Voce entra com ideia, foto ou tema do presente.",
      "A MDH 3D responde com caminho mais curto entre peca pronta, adaptacao ou projeto novo.",
      "Depois da aprovacao, a producao segue com combinacao clara de prazo e acabamento.",
    ],
    faq: buildFaq({
      focus: "presente personalizado no Rio",
      budget:
        "Nomes, medalhas e chaveiros costumam abrir a faixa mais leve. Miniaturas afetivas e presentes cenograficos variam com escala, pintura e quantidade de detalhes.",
      inputs:
        "Nome da pessoa, data, referencia visual, tamanho esperado e prazo maximo ajudam a resposta vir util logo no primeiro contato.",
      deadline:
        "A melhor rota e mandar a ideia central do presente. Se existir algo parecido no catalogo, a equipe ja parte para adaptacao; se nao existir, organiza o briefing do zero.",
    }),
    primaryCta: {
      label: "Abrir presentes personalizados",
      href: "/presentes-3d",
    },
    secondaryCta: {
      label: "Enviar ideia do presente",
      href: "/imagem-para-impressao-3d",
    },
    initialCategory: "Presentes Criativos",
    initialVisualMode: "verified",
    match: (product) =>
      product.customizable && matchesTerms(product, /(presente|familia|boneca|medalha|chaveiro|nome 3d)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && product.customizable,
  }),
  brindesEmpresariaisRio: createLanding({
    key: "brindesEmpresariaisRio",
    slug: "/brindes-empresariais-rio-de-janeiro",
    seoTitle: "Brindes empresariais 3D no Rio de Janeiro",
    seoDescription:
      "Brindes empresariais 3D no Rio de Janeiro para eventos, equipes, clientes, ativações e campanhas com lote, prova visual e atendimento comercial objetivo.",
    kicker: "Brindes empresariais RJ",
    title: "Brindes empresariais com rota comercial clara para time, cliente, evento e acao de marca.",
    description:
      "Essa pagina existe para transformar busca corporativa em proposta rapida. Em vez de catalogo genrico, ela parte de quantidade, objetivo da acao e formato mais replicavel para empresa.",
    audience: "Para RH, marketing, vendas, eventos corporativos e acao promocional com prazo definido.",
    budgetLabel: "A faixa varia por volume, acabamento e personalizacao de marca; itens repetiveis costumam ser a melhor porta de entrada.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Brinde empresarial em mídia validada",
    proofPoints: ["Lote corporativo", "Marca e identidade visual", "Atendimento comercial direto"],
    purchaseTriggers: [
      "Quando o pedido envolve marca, logo, equipe ou evento corporativo.",
      "Quando quantidade e prazo importam mais do que explorar uma vitrine completa.",
      "Quando o cliente precisa de proposta objetiva e nao de pagina inspiracional.",
    ],
    process: [
      "A conversa comeca por objetivo, quantidade, prazo e formato do brinde.",
      "A MDH 3D orienta o melhor caminho entre chaveiro, medalha, nome 3D ou peca institucional.",
      "Depois da validacao, o atendimento comercial assume o lote no mesmo fluxo.",
    ],
    faq: buildFaq({
      focus: "brinde empresarial 3D",
      budget:
        "A melhor porta de entrada costuma ser brinde repetivel de pequena escala. O valor final sobe conforme numero de unidades, complexidade do logo e tipo de acabamento.",
      inputs:
        "Logo em boa resolucao, data do evento, quantidade estimada, publico da acao e bairro de entrega ajudam a proposta nascer mais perto do ideal.",
      deadline:
        "A decisao fica mais rapida quando voce parte de objetivo e quantidade. Isso permite filtrar logo de cara se faz mais sentido chaveiro, medalha, nome 3D ou outro formato.",
      batch:
        "Sim. Essa pagina foi feita justamente para conversar sobre lote e padronizacao com menos ruído e mais clareza comercial.",
    }),
    primaryCta: {
      label: "Falar sobre brinde corporativo",
      href: corporateWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver linha de brindes",
      href: "/brindes-personalizados-3d",
    },
    initialQuery: "medalha",
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(medalha|chaveiro|institucional|lote|nome 3d|lembran)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(medalha|chaveiro)/i),
  }),
  miniaturasRio: createLanding({
    key: "miniaturasRio",
    slug: "/miniaturas-personalizadas-rio-de-janeiro",
    seoTitle: "Miniaturas personalizadas 3D no Rio de Janeiro",
    seoDescription:
      "Miniaturas personalizadas 3D no Rio de Janeiro para presente afetivo, personagem, mashup, colecao e decoracao geek com briefing sob medida.",
    kicker: "Miniaturas personalizadas RJ",
    title: "Miniaturas personalizadas para quando a venda depende mais de identidade e apelo visual do que de comparacao fria de SKU.",
    description:
      "Aqui entram personagem, mashup, familia, boneca e peça afetiva. O objetivo e mostrar que a MDH 3D consegue transformar referencia em miniatura comercialmente viavel, nao apenas em proposta vaga.",
    audience: "Para miniatura afetiva, personagem autoral, mashup ou presente com forte identidade visual.",
    budgetLabel: "A entrada varia com tamanho e nivel de detalhe; projetos afetivos e cenograficos pedem faixa acima de itens simples.",
    heroImage: "/products/foto-005-hello-kitty-jedi.webp",
    heroImageAlt: "Miniatura personalizada em mídia validada",
    proofPoints: ["Miniatura afetiva e fandom", "Briefing com referencia visual", "Escala e acabamento validados antes da producao"],
    purchaseTriggers: [
      "Quando o cliente quer ver um personagem, mashup ou pessoa virar objeto de presente.",
      "Quando a prova visual vale mais do que a lista de especificacoes.",
      "Quando a peca precisa parecer especial logo no primeiro contato.",
    ],
    process: [
      "Voce manda personagem, pessoa, foto ou ideia base.",
      "A MDH 3D orienta escala, material, nivel de detalhe e faixa inicial.",
      "Se a referencia estiver madura, o projeto segue para fechamento e producao.",
    ],
    faq: buildFaq({
      focus: "miniatura personalizada 3D",
      budget:
        "Miniaturas pequenas e mais simples partem de uma faixa mais controlada. Peca pintada, com base ou briefing afetivo sobe conforme horas de modelagem, impressao e acabamento.",
      inputs:
        "Foto frontal, referencias de estilo, altura desejada e o que nao pode faltar na peca ajudam a proposta ficar mais assertiva.",
      deadline:
        "A rota ideal e mandar a referencia visual primeiro. Com isso a equipe ja indica se vale adaptar algo existente ou partir para uma miniatura mais autoral.",
    }),
    primaryCta: {
      label: "Enviar referencia da miniatura",
      href: "/imagem-para-impressao-3d",
    },
    secondaryCta: {
      label: "Ver colecionaveis base",
      href: "/colecionaveis-geek-3d",
    },
    initialVisualMode: "verified",
    match: (product) =>
      product.customizable && matchesTerms(product, /(miniatura|familia|boneca|mashup|hello kitty|demogorgon|homer)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(familia|boneca|hello kitty|homer|demogorgon)/i),
  }),
  trofeusRio: createLanding({
    key: "trofeusRio",
    slug: "/trofeus-e-medalhas-3d-rio-de-janeiro",
    seoTitle: "Trofeus e medalhas 3D no Rio de Janeiro",
    seoDescription:
      "Trofeus, medalhas e pecas comemorativas 3D no Rio de Janeiro para evento, equipe, premiação e presente institucional com lote e personalizacao.",
    kicker: "Trofeus e medalhas RJ",
    title: "Trofeus e medalhas 3D para quando a entrega precisa premiar, representar ou marcar um evento com identidade visual propria.",
    description:
      "A rota aqui nao e vitrine comum. Ela foi pensada para premio, homenagem, medalha institucional, chaveiro comemorativo e peca de reconhecimento com repeticao organizada.",
    audience: "Para premiacao, evento, homenagem, escola, igreja, empresa e acao institucional.",
    budgetLabel: "Faixa inicial definida pelo tamanho da peca e pela repeticao; medalhas simples costumam abrir melhor o ticket.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Medalha comemorativa personalizada",
    proofPoints: ["Premiacao e reconhecimento", "Formato replicavel", "Ajuste de texto e simbolo"],
    purchaseTriggers: [
      "Quando o projeto precisa carregar nome, data, logo ou simbolo.",
      "Quando existe quantidade repetida com pequenas variacoes de texto.",
      "Quando o pedido tem data fixa e precisa de conversa rapida.",
    ],
    process: [
      "O atendimento comeca por tipo de peca, dimensao, simbolo e quantidade.",
      "A MDH 3D ajusta o melhor caminho entre medalha, chaveiro e trofeu 3D.",
      "Depois da aprovacao, o fluxo segue para producao e entrega sem mudar de canal.",
    ],
    faq: buildFaq({
      focus: "trofeu ou medalha 3D",
      budget:
        "Medalhas compactas e formatos repetiveis costumam abrir a menor faixa. Trofeus e pecas com base, relevo ou acabamento extra elevam o ticket.",
      inputs:
        "Texto, nome do evento, quantidade, medida, logotipo e data de entrega fazem a proposta sair com menos ida e volta.",
      deadline:
        "Essa pagina funciona melhor quando voce ja sabe se precisa premiacao, homenagem ou lembranca. Com isso a MDH 3D fecha o formato mais viavel logo no primeiro retorno.",
      batch:
        "Sim. Trofeus, medalhas e versoes com nomes variaveis podem seguir como lote organizado dentro da mesma proposta comercial.",
    }),
    primaryCta: {
      label: "Pedir trofeu ou medalha",
      href: lotWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver itens comemorativos",
      href: "/brindes-personalizados-3d",
    },
    initialQuery: "medalha",
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(medalha|trofeu|institucional|premio|chaveiro)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(medalha|chaveiro)/i),
  }),
  chaveirosRio: createLanding({
    key: "chaveirosRio",
    slug: "/chaveiros-personalizados-rio-de-janeiro",
    seoTitle: "Chaveiros personalizados 3D no Rio de Janeiro",
    seoDescription:
      "Chaveiros personalizados 3D no Rio de Janeiro para eventos, lembrancas, empresa, escola e presente util com lote, nome e identidade visual.",
    kicker: "Chaveiros personalizados RJ",
    title: "Chaveiros personalizados para quando o cliente quer uma peca util, replicavel e facil de distribuir sem perder identidade visual.",
    description:
      "Essa pagina condensa o tipo de pedido que mais combina lembranca, lote e ticket de entrada enxuto. O foco e transformar chaveiro em produto comercial bem resolvido, nao em brinde genérico.",
    audience: "Para evento, lembranca, escola, empresa, equipe, presente util e acao promocional.",
    budgetLabel: "Faixa de entrada amigavel para lote pequeno e media escala, variando conforme quantidade, espessura e acabamento.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Chaveiro personalizado produzido pela MDH 3D",
    proofPoints: ["Ticket de entrada leve", "Nome, logo ou simbolo", "Rota clara para lote"],
    purchaseTriggers: [
      "Quando o cliente precisa de uma lembranca util e facil de aprovar.",
      "Quando o valor da acao esta em repetir bem, nao em inventar demais.",
      "Quando o lote precisa nascer com rapidez e menos atrito comercial.",
    ],
    process: [
      "A conversa parte de quantidade, formato e publico do chaveiro.",
      "A equipe fecha se o melhor caminho e nome, logo, medalha com argola ou outro formato compacto.",
      "Depois disso a proposta segue com faixa inicial e prazo de lote.",
    ],
    faq: buildFaq({
      focus: "chaveiro personalizado 3D",
      budget:
        "Chaveiro costuma ser uma das melhores portas de entrada para lote, porque combina ticket controlado com alta capacidade de repeticao.",
      inputs:
        "Quantidade, frase, logo, cor, formato aproximado e data de entrega ajudam a MDH 3D a responder com uma proposta mais enxuta.",
      deadline:
        "Se a necessidade principal for lembranca, acao promocional ou item de distribuicao, esta pagina ja leva para a rota mais curta entre ideia e lote.",
      batch:
        "Sim. O modelo de atendimento foi pensado justamente para chaveiro em lote pequeno ou medio com ajuste de identidade visual.",
    }),
    primaryCta: {
      label: "Falar sobre chaveiros",
      href: lotWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver brindes e lotes",
      href: "/brindes-personalizados-3d",
    },
    initialQuery: "chaveiro",
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(chaveiro|medalha|pingente)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(chaveiro|medalha)/i),
  }),
  nomesPlacasRio: createLanding({
    key: "nomesPlacasRio",
    slug: "/nomes-e-placas-3d-rio-de-janeiro",
    seoTitle: "Nomes e placas 3D no Rio de Janeiro",
    seoDescription:
      "Nomes 3D, placas, letras e pecas de identificacao no Rio de Janeiro para quarto, evento, decoracao, lembranca e acao institucional.",
    kicker: "Nomes e placas 3D RJ",
    title: "Nomes e placas 3D para quando a compra gira em torno de escrita, identidade e exibicao em vez de um produto de prateleira.",
    description:
      "Essa pagina atende pedidos que precisam transformar texto em objeto: nome de crianca, placa decorativa, identificacao de ambiente, homenagem e peca institucional com leitura direta.",
    audience: "Para quarto infantil, decoracao, evento, lembranca, vitrine e identificacao visual.",
    budgetLabel: "A faixa inicial depende de quantidade de caracteres, espessura, base e se a peca precisa ficar em pe, colada ou pendurada.",
    heroImage: "/landing-assets/presentes-hero-v2.webp",
    heroImageAlt: "Nome decorativo 3D em composicao comercial",
    proofPoints: ["Texto como protagonista", "Boa entrada para presente e decoracao", "Rota simples para briefing"],
    purchaseTriggers: [
      "Quando o pedido nasce de um nome, frase ou identificacao visual.",
      "Quando o texto precisa virar presente ou elemento de ambiente.",
      "Quando a decisao de compra depende mais da leitura final do que da ficha tecnica.",
    ],
    process: [
      "Voce manda nome, frase, medida e contexto de uso.",
      "A MDH 3D valida espessura, estabilidade, base e acabamento.",
      "O pedido segue para aprovacao com faixa inicial e melhor rota de producao.",
    ],
    faq: buildFaq({
      focus: "nome ou placa 3D",
      budget:
        "O preco sobe principalmente com numero de caracteres, tamanho final, base estrutural e acabamento. Itens compactos costumam abrir a faixa com mais facilidade.",
      inputs:
        "Nome, frase, medida aproximada, cor e foto do local de uso ajudam a evitar erro de escala e deixam a proposta mais util.",
      deadline:
        "A melhor forma de agilizar e mandar texto, medida e foto do ambiente. Assim a equipe ja responde pensando em exibicao, nao apenas em impressao.",
    }),
    primaryCta: {
      label: "Pedir nome ou placa",
      href: "/imagem-para-impressao-3d",
    },
    secondaryCta: {
      label: "Falar pelo WhatsApp",
      href: projectWhatsappHref,
      external: true,
    },
    initialQuery: "nome",
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(nome 3d|medalha|chaveiro|institucional|decoracao)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(medalha|chaveiro)/i),
  }),
  lembrancasRio: createLanding({
    key: "lembrancasRio",
    slug: "/lembrancas-personalizadas-para-eventos-rio-de-janeiro",
    seoTitle: "Lembrancas personalizadas 3D para eventos no Rio de Janeiro",
    seoDescription:
      "Lembrancas personalizadas 3D para aniversario, evento, escola, igreja, empresa e comemoracao no Rio de Janeiro com lote e faixa inicial clara.",
    kicker: "Lembrancas para eventos RJ",
    title: "Lembrancas personalizadas para quando o pedido precisa fazer sentido em volume, contexto de evento e distribuicao.",
    description:
      "A pagina foi pensada para aniversario, lembranca de turma, igreja, escola, festa e acao com volume pequeno ou medio. O foco e fechar algo repetivel sem cair em conteudo raso.",
    audience: "Para aniversario, evento escolar, igreja, turma, equipe e comemoracao em grupo.",
    budgetLabel: "A entrada mais eficiente costuma vir de pecas pequenas, repetiveis e com personalizacao simples.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Lembranca personalizada 3D",
    proofPoints: ["Pensado para distribuicao", "Lote pequeno ou medio", "Personalizacao sem excesso de complexidade"],
    purchaseTriggers: [
      "Quando o pedido precisa atender varias pessoas sem explodir o ticket.",
      "Quando a data do evento ja esta definida e precisa orientar o formato.",
      "Quando lembranca e identidade visual precisam andar juntas.",
    ],
    process: [
      "A conversa comeca por tipo de evento, quantidade e faixa de investimento.",
      "A MDH 3D indica o formato mais repetivel para nome, simbolo ou tema.",
      "Com a aprovacao, o lote segue no mesmo fluxo comercial ate a entrega.",
    ],
    faq: buildFaq({
      focus: "lembranca personalizada para evento",
      budget:
        "Pecas pequenas e repetiveis costumam ser a rota mais saudavel para lembranca. O valor final depende de quantidade, data do evento e complexidade do tema.",
      inputs:
        "Tipo de evento, quantidade, tema, texto curto e prazo maximo ajudam a filtrar bem rapido o que faz sentido produzir.",
      deadline:
        "A melhor forma de agilizar e abrir o pedido pela necessidade do evento, nao por um formato fixo. Assim a equipe ja sugere algo viavel para a data e para o volume.",
      batch:
        "Sim. Essa pagina foi criada para transformar pedido repetivel em proposta comercial organizada.",
    }),
    primaryCta: {
      label: "Pedir lembrancas para evento",
      href: lotWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver chaveiros e medalhas",
      href: "/chaveiros-personalizados-rio-de-janeiro",
    },
    initialQuery: "chaveiro",
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(lembran|chaveiro|medalha|institucional|presente)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(chaveiro|medalha)/i),
  }),
  eventosRio: createLanding({
    key: "eventosRio",
    slug: "/pecas-para-eventos-3d-rio-de-janeiro",
    seoTitle: "Pecas 3D para eventos no Rio de Janeiro",
    seoDescription:
      "Pecas 3D para eventos no Rio de Janeiro com brindes, medalhas, lembrancas, itens cenograficos e objetos de apoio para acao promocional ou comemoracao.",
    kicker: "Pecas para eventos RJ",
    title: "Pecas para evento quando a demanda mistura lembranca, identidade visual e necessidade de entrega organizada.",
    description:
      "Aqui entram pedidos que nao sao so brinde nem so presente. O recorte atende evento com nome, simbolo, cenografia leve, lembranca e itens de apoio com rota comercial mais clara.",
    audience: "Para feira, acao promocional, aniversario, encontro tematico, escola e evento corporativo.",
    budgetLabel: "A faixa depende de quantidade, uso final e se a peca sera distribuida, exposta ou usada como apoio de acao.",
    heroImage: "/landing-assets/geek-hero.webp",
    heroImageAlt: "Pecas 3D organizadas para evento",
    proofPoints: ["Evento, lembranca e cenografia", "Lote com briefing", "Ajuste de tema e identidade visual"],
    purchaseTriggers: [
      "Quando um evento mistura distribuicao, decoracao e identidade visual.",
      "Quando o cliente ainda nao sabe se precisa lembranca, premio ou item cenografico.",
      "Quando a urgencia do evento pede roteiro comercial mais curto.",
    ],
    process: [
      "A equipe entende objetivo do evento, publico e o papel da peca dentro da experiencia.",
      "A MDH 3D define o formato com melhor equilibrio entre impacto visual, prazo e repeticao.",
      "A proposta segue para aprovacao com CTA direto para lote ou briefing.",
    ],
    faq: buildFaq({
      focus: "peca 3D para evento",
      budget:
        "A faixa muda conforme o papel da peca no evento. Itens de distribuicao tendem a entrar em ticket mais enxuto; itens de apoio e cenografia sobem conforme dimensao.",
      inputs:
        "Data, local, publico, quantidade e objetivo da peca ajudam a transformar uma ideia de evento em um pedido comercialmente viavel.",
      deadline:
        "A melhor rota e começar pelo objetivo do evento. Assim a conversa ja direciona para lembranca, premiação, apoio cenografico ou item de distribuicao.",
      batch:
        "Sim. Sempre que a acao pedir repeticao, a landing ja empurra para a conversa de lote em vez de jogar o cliente num catalogo solto.",
    }),
    primaryCta: {
      label: "Falar sobre evento",
      href: lotWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Abrir lembrancas e lotes",
      href: "/lembrancas-personalizadas-para-eventos-rio-de-janeiro",
    },
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(chaveiro|medalha|presente|institucional|nome 3d|decoracao)/i),
    highlightMatch: (product) => isProductVisualVerified(product),
  }),
  projetosRio: createLanding({
    key: "projetosRio",
    slug: "/projetos-sob-medida-3d-rio-de-janeiro",
    seoTitle: "Projetos sob medida em impressao 3D no Rio de Janeiro",
    seoDescription:
      "Projetos sob medida em impressao 3D no Rio de Janeiro com briefing, STL, imagem de referencia, validacao comercial e producao local.",
    kicker: "Projetos sob medida RJ",
    title: "Projetos sob medida para quando a necessidade ainda nao cabe em SKU, mas ja precisa virar conversa de compra.",
    description:
      "Essa pagina existe para projeto que nasce de referencia, necessidade de encaixe, ideia de presente, peca funcional ou adaptacao de algo existente. O foco e transformar briefing em proposta, nao em curiosidade solta.",
    audience: "Para projeto que depende de briefing, referencia, medida ou problema especifico.",
    budgetLabel: "A faixa inicial varia conforme complexidade, escala, tempo de modelagem e necessidade de ajuste funcional ou estetico.",
    heroImage: "/products/foto-007-familia-custom.webp",
    heroImageAlt: "Projeto 3D sob medida em mídia validada",
    proofPoints: ["Aceita imagem, STL e briefing", "Validacao humana antes da producao", "Fluxo comercial para projeto novo"],
    purchaseTriggers: [
      "Quando nao existe peca pronta que resolva exatamente o pedido.",
      "Quando a ideia ja precisa sair do campo de inspiracao e virar proposta real.",
      "Quando material, encaixe, escala ou tema pedem conversa tecnica curta.",
    ],
    process: [
      "Voce manda arquivo, imagem, medida ou explica o problema a resolver.",
      "A MDH 3D valida a viabilidade comercial e a melhor rota de producao.",
      "Com a aprovacao, o pedido segue como orcamento ou fechamento direto.",
    ],
    faq: buildFaq({
      focus: "projeto sob medida em impressao 3D",
      budget:
        "Projetos sob medida variam conforme modelagem, material, escala e acabamento. Quanto mais clara a referencia, mais rapido a faixa inicial aparece.",
      inputs:
        "STL, imagem, medida, uso final, bairro e prazo desejado ajudam a equipe a responder com menos suposicoes e mais precisao.",
      deadline:
        "Se ja existir um arquivo ou uma referencia forte, a conversa anda muito mais rapido. Quando a ideia ainda esta aberta, a landing ajuda a organizar o briefing certo.",
      batch:
        "Sim. Projeto sob medida tambem pode virar lote depois da validacao do primeiro modelo, se o uso pedir repeticao.",
    }),
    primaryCta: {
      label: "Enviar briefing ou arquivo",
      href: "/imagem-para-impressao-3d",
    },
    secondaryCta: {
      label: "Falar sobre viabilidade",
      href: projectWhatsappHref,
      external: true,
    },
    initialVisualMode: "all",
    match: (product) => product.customizable,
    highlightMatch: (product) => isProductVisualVerified(product) && product.customizable,
  }),
  prototiposRio: createLanding({
    key: "prototiposRio",
    slug: "/prototipos-e-pecas-funcionais-rio-de-janeiro",
    seoTitle: "Prototipos e pecas funcionais 3D no Rio de Janeiro",
    seoDescription:
      "Prototipos e pecas funcionais 3D no Rio de Janeiro para encaixe, organizacao, suporte, uso real e adaptacao de medidas com briefing objetivo.",
    kicker: "Prototipos e pecas funcionais",
    title: "Prototipos e pecas funcionais para quando a compra nao e so visual: ela precisa resolver uso, encaixe, rotina ou ajuste de medida.",
    description:
      "Essa pagina conversa com quem busca utilidade real, adaptacao funcional e prototipo rapido. O foco e mostrar que a impressao 3D aqui serve para resolver problema concreto, nao apenas decoracao.",
    audience: "Para ajuste funcional, teste de uso, suporte, organizacao e peca adaptada ao contexto real.",
    budgetLabel: "Faixa inicial depende de dimensao, tolerancia de encaixe e numero de iteracoes desejadas no projeto.",
    heroImage: "/products/foto-003-porta-creme-dental.webp",
    heroImageAlt: "Peca funcional impressa em 3D",
    proofPoints: ["Uso real e adaptacao", "Briefing com medida", "Boa entrada para problema concreto"],
    purchaseTriggers: [
      "Quando o pedido nasce de um problema funcional, nao de um desejo generico.",
      "Quando medida e encaixe precisam ser levados a serio desde o primeiro contato.",
      "Quando a validacao do uso final vale tanto quanto o visual.",
    ],
    process: [
      "A conversa comeca pelo objeto, espaco ou problema que a peca precisa resolver.",
      "A MDH 3D valida medida, tolerancia, material e rota de prototipo ou fechamento direto.",
      "Se fizer sentido, o pedido evolui para ajuste final ou repeticao da solucao.",
    ],
    faq: buildFaq({
      focus: "prototipo ou peca funcional 3D",
      budget:
        "Peca funcional costuma variar com dimensao, espessura, quantidade de testes e criticidade de encaixe. Quanto mais objetivo o problema, mais rapido a faixa inicial aparece.",
      inputs:
        "Medida, foto do local, objeto que precisa encaixar e explicacao curta do uso final ajudam a evitar suposicoes e retrabalho.",
      deadline:
        "A melhor rota e entrar pelo problema a resolver. Com isso a equipe ja filtra se vale adaptar algo existente, prototipar ou fechar uma peca funcional sob medida.",
    }),
    primaryCta: {
      label: "Pedir peca funcional",
      href: "/imagem-para-impressao-3d",
    },
    secondaryCta: {
      label: "Ver utilidades reais",
      href: "/catalogo/categoria/utilidades-reais",
    },
    initialCategory: "Utilidades Reais",
    initialVisualMode: "verified",
    match: (product) =>
      product.category === "Utilidades Reais" || matchesTerms(product, /(grinder|porta creme|case|suporte|organizador|bancada)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(grinder|porta creme|case|organizador)/i),
  }),
  decoracaoGeekRio: createLanding({
    key: "decoracaoGeekRio",
    slug: "/decoracao-geek-para-setup-rio-de-janeiro",
    seoTitle: "Decoracao geek para setup no Rio de Janeiro",
    seoDescription:
      "Decoracao geek para setup no Rio de Janeiro com miniaturas, displays, stencil, pecas cenograficas e objetos 3D para mesa e estante.",
    kicker: "Decoracao geek para setup",
    title: "Decoracao geek para setup quando a venda precisa misturar fandom, exibicao e ambiente sem parecer bagunca visual.",
    description:
      "Essa pagina aproxima colecionavel de ambientacao. Ela serve para quem quer montar estante, mesa, nicho ou setup com pecas que tragam identidade visual sem virar vitrine aleatoria.",
    audience: "Para setup gamer, estante geek, nicho, mesa criativa e presente de ambientacao.",
    budgetLabel: "A faixa varia com tamanho da peca e acabamento, mas o recorte privilegia objetos de ambiente com forte valor percebido.",
    heroImage: "/products/foto-004-demogorgon.webp",
    heroImageAlt: "Decoracao geek em mídia validada",
    proofPoints: ["Fandom + ambiente", "Boa para nicho e estante", "Curadoria visual mais forte"],
    purchaseTriggers: [
      "Quando o cliente quer montar ambiente, nao apenas comprar uma miniatura solta.",
      "Quando o visual final do setup importa tanto quanto o produto individual.",
      "Quando um recorte por estilo vende melhor do que um recorte por categoria fria.",
    ],
    process: [
      "Comece pelas pecas com melhor leitura de ambiente e valor percebido.",
      "A MDH 3D ajuda a encaixar tamanho, tema e contexto de uso no setup.",
      "Se precisar adaptar para uma estante ou mesa especifica, o briefing segue dali.",
    ],
    faq: buildFaq({
      focus: "decoracao geek para setup",
      budget:
        "O ticket muda conforme tamanho da peca, nivel de acabamento e se ela funciona como item principal do setup ou como complemento visual.",
      inputs:
        "Foto da mesa ou estante, tema preferido, tamanho disponivel e referencia de cor ajudam muito a montar uma proposta mais convincente.",
      deadline:
        "A pagina foi feita para vender pela ideia de ambiente. Se voce ja sabe o tema do setup, o caminho para fechar a curadoria fica bem mais curto.",
    }),
    primaryCta: {
      label: "Abrir decoracao geek",
      href: "/colecionaveis-geek-3d",
    },
    secondaryCta: {
      label: "Pedir composicao de setup",
      href: "/imagem-para-impressao-3d",
    },
    initialVisualMode: "verified",
    match: (product) =>
      matchesTerms(product, /(demogorgon|hello kitty|homer|stencil|geek|colecion|anime|decoracao|setup)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(demogorgon|hello kitty|homer|stencil)/i),
  }),
  organizadoresRio: createLanding({
    key: "organizadoresRio",
    slug: "/organizadores-e-suportes-3d-rio-de-janeiro",
    seoTitle: "Organizadores e suportes 3D no Rio de Janeiro",
    seoDescription:
      "Organizadores e suportes 3D no Rio de Janeiro para mesa, home office, bancada, banheiro e rotina com uso real e possibilidade de ajuste por medida.",
    kicker: "Organizadores e suportes RJ",
    title: "Organizadores e suportes 3D para quem quer resolver mesa, bancada e rotina com objeto util e leitura comercial clara.",
    description:
      "Essa pagina aprofunda o recorte funcional da loja. Ela atende suporte de uso diario, organizacao visual e pequenas adaptacoes que deixam o produto mais aderente ao espaco real.",
    audience: "Para mesa, bancada, banheiro, home office, setup e rotina de uso recorrente.",
    budgetLabel: "Faixa inicial leve para itens compactos e progressao natural para suportes maiores e adaptados por medida.",
    heroImage: "/products/foto-003-porta-creme-dental.webp",
    heroImageAlt: "Organizador funcional em mídia validada",
    proofPoints: ["Uso diario", "Boa recompra", "Ajuste de medida quando precisar"],
    purchaseTriggers: [
      "Quando a compra e util e o cliente quer entender o uso rapido.",
      "Quando o item precisa encaixar no espaco sem exagero visual.",
      "Quando a pagina precisa vender funcao antes de vender estilo.",
    ],
    process: [
      "Voce entra pelo problema de organizacao, pelo objeto ou pelo espaco.",
      "A equipe confirma se um item do catalogo resolve ou se vale ajustar por medida.",
      "O fechamento segue com faixa clara e CTA direto para compra ou briefing.",
    ],
    faq: buildFaq({
      focus: "organizador ou suporte 3D",
      budget:
        "Itens compactos e de uso simples costumam ficar na base da faixa. Suportes maiores, com reforco estrutural ou ajuste de medida sobem conforme material e tempo de impressao.",
      inputs:
        "Foto do espaco, medida do objeto, largura da bancada e uso principal ajudam a proposta vir muito mais certa.",
      deadline:
        "A pagina funciona melhor quando a conversa comeca pelo uso final. Isso ajuda a separar compra pronta de adaptacao sob medida com muito menos atrito.",
    }),
    primaryCta: {
      label: "Ver suportes e organizadores",
      href: "/setup-e-organizacao-3d",
    },
    secondaryCta: {
      label: "Mandar medidas do espaco",
      href: "/imagem-para-impressao-3d",
    },
    initialVisualMode: "verified",
    match: (product) =>
      matchesTerms(product, /(suporte|organizador|bancada|headphone|controle|celular|cabos|banheiro|porta creme)/i),
    highlightMatch: (product) =>
      isProductVisualVerified(product) && matchesTerms(product, /(porta creme|organizador|suporte|case)/i),
  }),
  presentesCorporativosRio: createLanding({
    key: "presentesCorporativosRio",
    slug: "/presentes-corporativos-3d-rio-de-janeiro",
    seoTitle: "Presentes corporativos 3D no Rio de Janeiro",
    seoDescription:
      "Presentes corporativos 3D no Rio de Janeiro para cliente, time, acao interna e relacionamento com proposta visual, lote e atendimento comercial.",
    kicker: "Presentes corporativos RJ",
    title: "Presentes corporativos para quando a empresa quer algo menos generico, mais memoravel e ainda assim viavel em lote ou pequena escala.",
    description:
      "Esse recorte serve para empresa que nao quer cair no brinde comum, mas tambem nao precisa de um projeto cenografico exagerado. O foco e relacionamento, time e recordacao com identidade.",
    audience: "Para cliente, equipe, onboarding, acao interna, agradecimento e relacionamento.",
    budgetLabel: "A faixa depende do numero de pessoas, do nivel de personalizacao e do papel do presente dentro da acao.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Presente corporativo 3D",
    proofPoints: ["Mais memoravel que o brinde comum", "Funciona em lote enxuto", "Atendimento comercial sem ruído"],
    purchaseTriggers: [
      "Quando o presente precisa representar mais a marca do que o volume do lote.",
      "Quando a empresa quer algo pequeno, mas com boa lembranca de marca.",
      "Quando time e cliente pedem propostas parecidas, mas nao iguais.",
    ],
    process: [
      "A conversa comeca pelo publico do presente e pela intencao da acao.",
      "A MDH 3D encaixa o melhor formato entre presente util, simbolico ou comemorativo.",
      "Com isso, a proposta segue com faixa inicial e CTA direto para alinhamento comercial.",
    ],
    faq: buildFaq({
      focus: "presente corporativo 3D",
      budget:
        "A faixa varia conforme quantidade, nivel de personalizacao e se o presente sera unitario, pequeno lote ou acao interna maior.",
      inputs:
        "Quantidade, publico, logo, data e mensagem principal da acao ajudam a transformar o briefing em proposta mais objetiva.",
      deadline:
        "A melhor rota e entrar pela intencao do presente. Assim a equipe ja organiza se faz mais sentido um item util, simbolico, comemorativo ou em lote.",
      batch:
        "Sim. Presente corporativo pode ser tratado como lote pequeno ou medio sempre que a acao pedir repeticao controlada.",
    }),
    primaryCta: {
      label: "Falar sobre presentes corporativos",
      href: corporateWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver brindes empresariais",
      href: "/brindes-empresariais-rio-de-janeiro",
    },
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(medalha|chaveiro|institucional|presente|nome 3d)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(medalha|chaveiro)/i),
  }),
  topoBoloRio: createLanding({
    key: "topoBoloRio",
    slug: "/topo-de-bolo-e-festas-3d-rio-de-janeiro",
    seoTitle: "Topo de bolo e pecas 3D para festas no Rio de Janeiro",
    seoDescription:
      "Topo de bolo e pecas 3D para festas no Rio de Janeiro com nome, tema, simbolo e elementos personalizados para comemoracoes e aniversarios.",
    kicker: "Festas e topo de bolo 3D",
    title: "Topo de bolo e pecas para festa quando o pedido nasce de nome, tema, aniversario e vontade de marcar a comemoracao com algo proprio.",
    description:
      "Mesmo sem depender de uma linha enorme de SKU, essa pagina resolve uma busca comercial real: nome 3D, elemento decorativo e item personalizado para bolo, mesa ou lembranca de festa.",
    audience: "Para aniversario, festa infantil, comemoracao de casal, cha revelacao e mesa personalizada.",
    budgetLabel: "A faixa inicial depende de medida, texto, tema e se a peca vai para bolo, mesa ou lembranca complementar.",
    heroImage: "/landing-assets/presentes-hero-v2.webp",
    heroImageAlt: "Peca 3D personalizada para festa",
    proofPoints: ["Nome, tema e simbolo", "Boa entrada para festa e comemoracao", "Briefing simples com foto e data"],
    purchaseTriggers: [
      "Quando a compra depende de data e tema de festa.",
      "Quando o pedido precisa nascer de nome, frase ou personagem.",
      "Quando o cliente quer algo pequeno, autoral e com bom valor percebido.",
    ],
    process: [
      "A conversa comeca por data, tema, nome e uso final da peca.",
      "A MDH 3D organiza medida, estabilidade e leitura visual para bolo, mesa ou lembranca.",
      "Depois disso, o pedido segue com faixa inicial e rota de producao definida.",
    ],
    faq: buildFaq({
      focus: "topo de bolo ou peca 3D para festa",
      budget:
        "O ticket muda com tamanho, quantidade de caracteres, tema e se a peca precisa ficar em pe, espetada ou integrada a outro item da festa.",
      inputs:
        "Nome, tema, data, foto de referencia e medida aproximada ajudam a resposta ficar mais rapida e segura.",
      deadline:
        "A melhor rota e abrir o pedido pela data da festa e pelo uso da peca. Isso ajuda a equipe a definir logo o formato mais viavel para a comemoracao.",
    }),
    primaryCta: {
      label: "Enviar briefing da festa",
      href: "/imagem-para-impressao-3d",
    },
    secondaryCta: {
      label: "Falar pelo WhatsApp",
      href: projectWhatsappHref,
      external: true,
    },
    initialVisualMode: "all",
    match: (product) =>
      product.customizable && matchesTerms(product, /(presente|familia|boneca|nome 3d|medalha|hello kitty)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && product.customizable,
  }),
  lotesRio: createLanding({
    key: "lotesRio",
    slug: "/lotes-personalizados-3d-rio-de-janeiro",
    seoTitle: "Lotes personalizados 3D no Rio de Janeiro",
    seoDescription:
      "Lotes personalizados 3D no Rio de Janeiro para evento, empresa, escola, lembranca e acao promocional com atendimento comercial objetivo.",
    kicker: "Lotes personalizados RJ",
    title: "Lotes personalizados para quando quantidade, prazo e repeticao precisam entrar na conversa desde o primeiro clique.",
    description:
      "Essa pagina e a rota comercial mais direta para volume. Ela evita que o cliente de lote navegue como se fosse uma compra unitaria e acelera a conversa certa sobre quantidade, formato e prazo.",
    audience: "Para volume, repeticao de modelo, acao promocional, lembranca e producao organizada.",
    budgetLabel: "A faixa depende de quantidade, repeticao do modelo, nivel de personalizacao e prazo de entrega.",
    heroImage: "/products/foto-011-chaveiro-maconaria.webp",
    heroImageAlt: "Lote de pecas 3D personalizadas",
    proofPoints: ["Pensado para volume", "Atendimento comercial direto", "Formato repetivel antes do detalhe fino"],
    purchaseTriggers: [
      "Quando a quantidade e mais importante do que a comparacao por SKU.",
      "Quando a compra precisa nascer com prazo e volume bem claros.",
      "Quando o cliente quer sair da pagina certa ja falando de lote.",
    ],
    process: [
      "A pessoa entra pela quantidade, prazo e objetivo do lote.",
      "A MDH 3D filtra o formato mais viavel para repeticao e faixa inicial.",
      "Com isso, a proposta segue sem ruído para atendimento comercial e aprovacao.",
    ],
    faq: buildFaq({
      focus: "lote personalizado em impressao 3D",
      budget:
        "A faixa final depende da soma entre quantidade, acabamento e grau de personalizacao. Quanto mais repetivel o modelo, melhor tende a ficar a relacao custo por unidade.",
      inputs:
        "Quantidade, data, finalidade do lote, logo ou tema, e uma medida aproximada ajudam a equipe a responder com mais precisao.",
      deadline:
        "A melhor rota e iniciar pela logica de volume. Isso evita perder tempo em catalogo unitario e leva direto para a conversa de lote.",
      batch:
        "Sim. Essa pagina existe exatamente para isso: transformar busca por lote em uma conversa comercial enxuta e honesta.",
    }),
    primaryCta: {
      label: "Abrir conversa de lote",
      href: lotWhatsappHref,
      external: true,
    },
    secondaryCta: {
      label: "Ver brindes e eventos",
      href: "/pecas-para-eventos-3d-rio-de-janeiro",
    },
    initialVisualMode: "all",
    match: (product) => matchesTerms(product, /(chaveiro|medalha|institucional|lote|nome 3d|lembran)/i),
    highlightMatch: (product) => isProductVisualVerified(product) && matchesTerms(product, /(chaveiro|medalha)/i),
  }),
} satisfies Record<string, SalesLandingConfig>;

export type SalesLandingKey = keyof typeof salesLandings;

export function getSalesLandingBySlug(slugParam: string) {
  const normalized = slugParam.startsWith("/") ? slugParam : `/${slugParam}`;
  return Object.values(salesLandings).find((landing) => landing.slug === normalized);
}

export function getSalesLandingEntryBySlug(slugParam: string) {
  const normalized = slugParam.startsWith("/") ? slugParam : `/${slugParam}`;
  return (Object.entries(salesLandings) as Array<[SalesLandingKey, SalesLandingConfig]>).find(
    ([, landing]) => landing.slug === normalized
  );
}

export function getSalesLandingMetadata(config: SalesLandingConfig): Metadata {
  return {
    title: config.seoTitle,
    description: config.seoDescription,
    alternates: {
      canonical: config.slug,
    },
    openGraph: {
      title: config.seoTitle,
      description: config.seoDescription,
      images: config.heroImage ? [config.heroImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: config.seoTitle,
      description: config.seoDescription,
      images: config.heroImage ? [config.heroImage] : [],
    },
  };
}

export function getSalesLandingStaticParams() {
  return Object.values(salesLandings).map((landing) => ({
    slug: landing.slug.replace(/^\//, ""),
  }));
}

export function getDynamicSalesLandingStaticParams() {
  return Object.values(salesLandings)
    .filter((landing) => !STATIC_LANDING_KEYS.has(landing.key))
    .map((landing) => ({
      slug: landing.slug.replace(/^\//, ""),
    }));
}

export function getLandingProducts(products: Product[], config: SalesLandingConfig) {
  return products.filter(config.match).sort(sortByCommercialPriority);
}

export function getLandingHighlights(products: Product[], config: SalesLandingConfig) {
  const highlighted = products.filter(config.highlightMatch || config.match).sort(sortByCommercialPriority);
  return (highlighted.length ? highlighted : getLandingProducts(products, config)).slice(0, 4);
}
