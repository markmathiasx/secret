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
    preferredIds: ["mdh-016", "real-010"],
    fallbackTerms: ["chaveiro", "personalizado", "nome"],
    whyBuy: "Inclui peça impressa, argola metálica, corrente, montagem e embalagem individual.",
  },
  {
    slot: "Chaveiro pet",
    intent: "chaveiros-personalizados",
    preferredIds: ["mw-a1-452", "mw-a1-455", "mw-a1-458"],
    fallbackTerms: ["pet", "tag", "identificação"],
    whyBuy: "Identificação leve com ferragem metálica, montagem e embalagem individual.",
  },
  {
    slot: "Suporte celular",
    intent: "setup-gamer",
    preferredIds: ["mdh-015", "mw-a1-141", "mw-a1-144"],
    fallbackTerms: ["suporte", "celular", "smartphone"],
    whyBuy: "Resolve mesa, videochamada e carregamento sem ocupar espaço.",
  },
  {
    slot: "Organizador de cabos",
    intent: "organizacao-setup",
    preferredIds: ["mdh-050", "mdh-014", "mw-a1-019"],
    fallbackTerms: ["organizador", "cabo", "usb"],
    whyBuy: "Compra simples para arrumar carregadores e setup.",
  },
  {
    slot: "Porta creme dental",
    intent: "organizacao-setup",
    preferredIds: ["real-002", "mw-a1-074", "mw-a1-077"],
    fallbackTerms: ["porta", "creme", "banheiro"],
    whyBuy: "Utilidade clara para bancada, pia e rotina da casa.",
  },
  {
    slot: "Cantinho do café",
    intent: "presentes-ate-50",
    preferredIds: ["csv-col-002", "mw-a1-057", "mw-a1-060"],
    fallbackTerms: ["café", "caneca", "cozinha", "suporte"],
    whyBuy: "Fallback real do catálogo para quem procura porta cápsulas ou café.",
  },
  {
    slot: "Suporte controle",
    intent: "setup-gamer",
    preferredIds: ["mdh-017", "mw-a1-171", "mw-a1-174"],
    fallbackTerms: ["suporte", "controle", "gamepad"],
    whyBuy: "Organiza console, controle e mesa gamer.",
  },
  {
    slot: "Porta-copos geek",
    intent: "setup-gamer",
    preferredIds: ["mdh-019"],
    fallbackTerms: ["porta-copos", "porta copos", "geek"],
    whyBuy: "Presente barato para mesa, setup e decoração geek.",
  },
  {
    slot: "Miniatura personalizada",
    intent: "peca-sob-medida",
    preferredIds: ["real-006", "real-007", "mdh-038"],
    fallbackTerms: ["miniatura", "personalizada", "família"],
    whyBuy: "Opção afetiva para presente sob encomenda.",
  },
  {
    slot: "Brinde para evento",
    intent: "brindes-e-lotes",
    preferredIds: ["mw-a1-417", "mw-a1-404", "mw-a1-415"],
    fallbackTerms: ["brinde", "evento", "lote"],
    whyBuy: "Serve para kits, eventos e lembranças em quantidade.",
  },
  {
    slot: "Peça sob medida",
    intent: "peca-sob-medida",
    preferredIds: ["mw-a1-265", "mw-a1-266", "mw-a1-267"],
    fallbackTerms: ["técnico", "sob medida", "fixação"],
    whyBuy: "Ponto de partida para explicar medida, uso e material.",
  },
  {
    slot: "Organizador de mesa/setup",
    intent: "organizacao-setup",
    preferredIds: ["mdh-022", "mw-a1-182", "mw-a1-184"],
    fallbackTerms: ["organizador", "mesa", "canetas"],
    whyBuy: "Compra prática para escritório, estudo e setup.",
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
    description: "Presentes úteis, geek e personalizáveis com preço Pix até R$ 50 e cartão sempre Pix + R$ 1.",
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
    description: "Organizadores de cabos, banheiro, gaveta, mesa e rotina com preço claro e produção local.",
    faq: [
      ["Qual organizador comprar primeiro?", "Comece por cabos, celular, banheiro ou mesa, conforme o problema que quer resolver."],
      ["Tem pronta entrega?", "O status aparece em cada produto. Confirme urgência antes de fechar."],
      ["Pode adaptar medida?", "Peças simples podem ser ajustadas mediante orçamento."],
    ],
  },
  "setup-gamer": {
    slug: "/setup-gamer",
    intent: "setup-gamer" as FirstSaleIntent,
    title: "Acessórios 3D para setup gamer e home office",
    description: "Suportes para controle, celular, fone, cabos e itens geek para deixar a mesa organizada.",
    faq: [
      ["Serve para presente gamer?", "Sim. Porta-copos, suporte de controle e chaveiros são boas entradas."],
      ["Cartão muda quanto?", "A regra vigente é cartão = Pix + R$ 1 por item."],
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
      ["O preço do card vale para lote?", "O card mostra referência unitária. Lote precisa confirmar quantidade e prazo."],
      ["Dá para colocar marca?", "Sim, quando o arquivo ou referência estiverem adequados para impressão."],
    ],
  },
  "peca-sob-medida": {
    slug: "/peca-sob-medida",
    intent: "peca-sob-medida" as FirstSaleIntent,
    title: "Peça sob medida em impressão 3D",
    description: "Peças técnicas, miniaturas, nomes 3D e projetos personalizados com orçamento orientado por uso e medida.",
    faq: [
      ["O que preciso enviar?", "Uso da peça, medidas, cor, quantidade, prazo e foto/STL/OBJ/3MF se tiver."],
      ["Tem preço fechado sem avaliar?", "Não. Produtos do catálogo têm preço; projeto novo precisa briefing."],
      ["Vocês pedem dados de cartão no chat?", "Não. Pagamento deve ocorrer por checkout ou canal oficial orientado pela equipe."],
    ],
  },
} as const;

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
