import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { getPrimaryProductImage, getProductImageAlt } from "@/lib/product-images";

export type FirstSaleIntent =
  | "mais-pedidos"
  | "presentes-ate-50"
  | "chaveiros-personalizados"
  | "organizacao-setup"
  | "setup-gamer"
  | "brindes-e-lotes"
  | "peca-sob-medida";

export type CuratedFirstSaleProduct = {
  slot: string;
  intent: FirstSaleIntent;
  product: Product;
  href: string;
  image: string;
  imageAlt: string;
  whyBuy: string;
};

type SlotConfig = {
  slot: string;
  intent: FirstSaleIntent;
  preferredIds: string[];
  fallbackTerms: string[];
  whyBuy: string;
};

export const firstSaleSlots: SlotConfig[] = [
  {
    slot: "Chaveiro personalizado",
    intent: "chaveiros-personalizados",
    preferredIds: ["mdh-016"],
    fallbackTerms: ["chaveiro", "personalizado", "nome", "logo"],
    whyBuy: "Inclui impressão, argola com corrente, montagem, embalagem individual e insumos de postagem.",
  },
  {
    slot: "Kit organizador de cabos",
    intent: "organizacao-setup",
    preferredIds: ["mdh-014"],
    fallbackTerms: ["kit", "organizador", "cabos", "mesa"],
    whyBuy: "Kit com seis peças para organizar carregadores e cabos de uso diário.",
  },
  {
    slot: "Suporte para celular",
    intent: "setup-gamer",
    preferredIds: ["mdh-015"],
    fallbackTerms: ["suporte", "celular", "mesa"],
    whyBuy: "Apoio estável para chamadas, vídeos e carregamento na mesa.",
  },
  {
    slot: "Suporte para headphone",
    intent: "setup-gamer",
    preferredIds: ["mdh-013"],
    fallbackTerms: ["suporte", "headphone", "fone"],
    whyBuy: "Mantém o headphone organizado sem ocupar a área principal da mesa.",
  },
  {
    slot: "Suporte para controle gamer",
    intent: "setup-gamer",
    preferredIds: ["mdh-017"],
    fallbackTerms: ["suporte", "controle", "gamer"],
    whyBuy: "Organiza o controle e melhora a apresentação do setup.",
  },
  {
    slot: "Organizador de mesa",
    intent: "organizacao-setup",
    preferredIds: ["mdh-022"],
    fallbackTerms: ["organizador", "mesa", "canetas"],
    whyBuy: "Reúne canetas e pequenos acessórios em um único lugar.",
  },
  {
    slot: "Porta-copos geek",
    intent: "presentes-ate-50",
    preferredIds: ["mdh-019"],
    fallbackTerms: ["porta-copos", "mesa", "geek", "presente"],
    whyBuy: "Protege a mesa e funciona como presente geek de ticket inicial mais acessível.",
  },
  {
    slot: "Vaso geométrico",
    intent: "presentes-ate-50",
    preferredIds: ["mdh-025"],
    fallbackTerms: ["vaso", "geométrico", "decoração"],
    whyBuy: "Peça decorativa para arranjos secos ou uso com recipiente interno.",
  },
  {
    slot: "Nome 3D personalizado",
    intent: "peca-sob-medida",
    preferredIds: ["mdh-038"],
    fallbackTerms: ["nome 3d", "personalizado", "mesa"],
    whyBuy: "Produto sob encomenda com tamanho, base e cores definidos no pedido.",
  },
  {
    slot: "Luminária LED personalizada",
    intent: "peca-sob-medida",
    preferredIds: ["mdh-028"],
    fallbackTerms: ["luminaria", "led", "personalizado", "presente"],
    whyBuy: "Presente premium com personalização clara e boa percepção de valor.",
  },
  {
    slot: "Foto litofania",
    intent: "peca-sob-medida",
    preferredIds: ["mdh-029"],
    fallbackTerms: ["foto", "litofania", "personalizado", "presente"],
    whyBuy: "Entrega apelo afetivo forte com personalização a partir de foto enviada pelo cliente.",
  },
  {
    slot: "Caixa organizadora",
    intent: "organizacao-setup",
    preferredIds: ["mdh-053"],
    fallbackTerms: ["caixa", "organizadora", "tampa"],
    whyBuy: "Armazena pequenos objetos com medida confirmada antes da produção.",
  },
];

export const intentPageConfigs = {
  "chaveiros-personalizados": {
    slug: "/chaveiros-personalizados",
    intent: "chaveiros-personalizados" as FirstSaleIntent,
    title: "Chaveiros personalizados completos em impressão 3D",
    description: "Chaveiros com nome, logo, pet, evento ou brinde. O preço seguro inclui impressão, ferragens, montagem, embalagem individual e insumos de postagem.",
    faq: [
      ["O que acompanha cada chaveiro?", "Peça impressa, argola metálica, corrente, montagem e embalagem individual."],
      ["O frete está incluído?", "Os insumos para preparar o envio estão incluídos. O frete real dos Correios ou transportadora é calculado separadamente."],
      ["Posso personalizar nome ou logo?", "Sim. Envie nome, logo, cor, quantidade e prazo pelo WhatsApp antes de fechar."],
      ["Serve para evento ou empresa?", "Sim. Em lotes, a preparação e a embalagem externa são rateadas pela quantidade."],
    ],
  },
  "presentes-ate-50": {
    slug: "/presentes-ate-50",
    intent: "presentes-ate-50" as FirstSaleIntent,
    title: "Presentes 3D até R$ 50",
    description: "Presentes úteis e personalizáveis com preço Pix de até R$ 50 na seleção atual.",
    faq: [
      ["O preço é real?", "Sim. Os cards usam o preço atual do catálogo."],
      ["Dá para mandar pelo WhatsApp?", "Sim. Cada card já abre mensagem com produto, preço e link."],
      ["Posso pedir cor diferente?", "Quando o item for personalizável, confirme cor e prazo no atendimento."],
    ],
  },
  organizadores: {
    slug: "/organizadores",
    intent: "organizacao-setup" as FirstSaleIntent,
    title: "Organizadores 3D para casa, cabos e mesa",
    description: "Organizadores de cabos, mesa e pequenos objetos com preço claro e produção local.",
    faq: [
      ["Qual organizador comprar primeiro?", "Comece pelo kit de cabos, pelo organizador de mesa ou pela caixa com tampa."],
      ["Tem pronta entrega?", "O status aparece em cada produto. Confirme urgência antes de fechar."],
      ["Pode adaptar medida?", "Peças simples podem ser ajustadas mediante orçamento."],
    ],
  },
  "setup-gamer": {
    slug: "/setup-gamer",
    intent: "setup-gamer" as FirstSaleIntent,
    title: "Acessórios 3D para setup gamer e home office",
    description: "Suportes para controle, celular e headphone para deixar a mesa organizada.",
    faq: [
      ["Serve para presente gamer?", "Sim. Suportes para controle, celular e headphone são opções práticas."],
      ["Como vejo o valor no cartão?", "O valor atualizado aparece no card do produto e no checkout."],
      ["Posso pedir tema específico?", "Pode. Use o WhatsApp com referência, cor e prazo desejado."],
    ],
  },
  "brindes-e-lotes": {
    slug: "/brindes-e-lotes",
    intent: "brindes-e-lotes" as FirstSaleIntent,
    title: "Brindes e lotes em impressão 3D",
    description: "Chaveiros, lembranças, tags e pequenos presentes para evento, empresa e kit promocional.",
    faq: [
      ["Como cotar lote?", "Informe quantidade, prazo, personalização e uso do brinde."],
      ["O preço do card vale para lote?", "O card mostra a referência inicial. Lotes recebem orçamento por quantidade, personalização e prazo."],
      ["Dá para colocar marca?", "Sim, quando o arquivo ou referência estiverem adequados para impressão."],
    ],
  },
  "peca-sob-medida": {
    slug: "/peca-sob-medida",
    intent: "peca-sob-medida" as FirstSaleIntent,
    title: "Peça sob medida em impressão 3D",
    description: "Nomes 3D, porta-retratos e projetos personalizados com orçamento orientado por uso e medida.",
    faq: [
      ["O que preciso enviar?", "Uso da peça, medidas, cor, quantidade, prazo e foto/STL/OBJ/3MF se tiver."],
      ["Tem preço fechado sem avaliar?", "Não. Produtos do catálogo têm preço; projeto novo precisa briefing."],
      ["Vocês pedem dados de cartão no chat?", "Não. Pagamento deve ocorrer por checkout ou canal oficial orientado pela equipe."],
    ],
  },
} as const;

const intentExpansionTerms: Record<FirstSaleIntent, string[]> = {
  "mais-pedidos": [],
  "presentes-ate-50": ["presente", "chaveiro", "porta-copos", "kit", "suporte", "mesa"],
  "chaveiros-personalizados": ["chaveiro", "personalizado", "nome", "logo", "brinde", "presente", "luminaria", "litofania", "decoração"],
  "organizacao-setup": ["organizador", "mesa", "cabos", "suporte", "caixa", "setup"],
  "setup-gamer": ["suporte", "controle", "gamer", "headphone", "celular", "mesa", "setup"],
  "brindes-e-lotes": ["brinde", "lote", "evento", "logo", "personalizado", "chaveiro", "porta-copos", "nome", "mesa"],
  "peca-sob-medida": ["personalizado", "nome", "luminaria", "litofania", "foto", "sob encomenda", "medida"],
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function productText(product: Product) {
  return normalizeText([
    product.name,
    product.category,
    product.subcategory,
    product.collection,
    product.description,
    ...(product.tags || []),
    ...(product.useCaseTags || []),
  ].filter(Boolean).join(" "));
}

function findProduct(slot: SlotConfig) {
  for (const id of slot.preferredIds) {
    const product = catalog.find((item) => item.id === id && item.pricePix > 0);
    if (product) return product;
  }

  const terms = slot.fallbackTerms.map(normalizeText);
  return catalog
    .filter((product) => product.pricePix > 0)
    .map((product) => ({
      product,
      score: terms.reduce((sum, term) => sum + (productText(product).includes(term) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.pricePix - b.product.pricePix)[0]?.product;
}

export function getFirstSaleProducts(): CuratedFirstSaleProduct[] {
  return firstSaleSlots
    .map((slot) => {
      const product = findProduct(slot);
      if (!product) return null;
      return {
        slot: slot.slot,
        intent: slot.intent,
        product,
        href: getProductUrl(product),
        image: getPrimaryProductImage(product),
        imageAlt: getProductImageAlt(product),
        whyBuy: slot.whyBuy,
      };
    })
    .filter(Boolean) as CuratedFirstSaleProduct[];
}

export function getIntentProducts(intent: FirstSaleIntent, limit = 12) {
  const curated = getFirstSaleProducts()
    .filter((item) => item.intent === intent || intent === "mais-pedidos")
    .map((item) => item.product);
  const used = new Set(curated.map((product) => product.id));
  const terms = firstSaleSlots
    .filter((slot) => slot.intent === intent || intent === "mais-pedidos")
    .flatMap((slot) => slot.fallbackTerms)
    .concat(intentExpansionTerms[intent] || [])
    .map(normalizeText);

  const fallback = catalog
    .filter((product) => product.pricePix > 0 && !used.has(product.id))
    .map((product) => ({
      product,
      score: intent === "presentes-ate-50" && product.pricePix <= 50
        ? 10
        : terms.reduce((sum, term) => sum + (productText(product).includes(term) ? 1 : 0), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.product.pricePix - b.product.pricePix)
    .map((item) => item.product);

  return [...curated, ...fallback].slice(0, limit);
}

export function getProductCardData(product: Product) {
  return {
    href: getProductUrl(product),
    image: getPrimaryProductImage(product),
    imageAlt: getProductImageAlt(product),
  };
}
