export const brand = {
  name: "MDH 3D",
  legalName: "MarkDressaHeylel",
  city: "Rio de Janeiro",
  state: "RJ",
  slogan: "Impressao 3D premium para anime, geek, decoracao, utilitarios e personalizados",
  instagramHandle: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh___021"
};

function parseList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const whatsappContacts = [
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521920137249",
  ...parseList(process.env.NEXT_PUBLIC_EXTRA_WHATSAPP_NUMBERS)
].map((number, index) => ({
  id: `wa-${index + 1}`,
  label: index === 0 ? "Atendimento principal" : `Atendimento ${index + 1}`,
  number
}));

export const whatsappNumber = whatsappContacts[0]?.number || "5521920137249";
export const whatsappMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  "Oi! Vim pelo site da MDH 3D e quero pedir um orcamento.";

export const supportEmail = process.env.STAFF_NOTIFY_EMAIL || "mdhatendimento@gmail.com";

export const pix = {
  provider: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  cpfSuffix: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85"
};

export const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || `https://www.instagram.com/${brand.instagramHandle}`,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || ""
};

export const adminConfig = {
  email: process.env.ADMIN_EMAIL || "markmathias01@gmail.com",
  hiddenPath: "/painel-mdh-85",
  sessionCookieName: "mdh_admin",
  sessionToken: process.env.ADMIN_SESSION_TOKEN || "mdh_troque_este_token_no_env"
};

const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const deliveryKm = {
  originLabel: process.env.DELIVERY_ORIGIN_LABEL || "Condominio Meu Lar 2",
  gasPriceBrl: num(process.env.GAS_PRICE_BRL, 6),
  bikeKmPerLiter: num(process.env.BIKE_KM_PER_LITER, 35),
  baseFee: num(process.env.DELIVERY_BASE_FEE, 8),
  feePerKm: num(process.env.DELIVERY_FEE_PER_KM, 0.6),
  capFee: num(process.env.DELIVERY_FEE_CAP, 35),
  expressMultiplier: num(process.env.DELIVERY_EXPRESS_MULTIPLIER, 2)
};

export const deliveryZones = [
  { region: "Centro e Zona Portuaria", fee: 12, eta: "1 dia util" },
  { region: "Zona Norte", fee: 16, eta: "1 a 2 dias uteis" },
  { region: "Zona Sul", fee: 18, eta: "1 a 2 dias uteis" },
  { region: "Barra e Jacarepagua", fee: 22, eta: "1 a 3 dias uteis" },
  { region: "Baixada, Niteroi e demais areas", fee: 28, eta: "2 a 3 dias uteis" }
] as const;

export const homepageCollections = [
  "Anime",
  "Geek",
  "Utilitarios",
  "Personalizados",
  "Decoracao",
  "Escritorio"
] as const;

export const catalogCollections = [
  "Mais vendidos",
  "Pronta entrega",
  "Sob encomenda",
  "Presentes",
  "Setup e escritorio",
  "Decoracao premium"
] as const;

export const materialHighlights = [
  {
    title: "PLA Premium",
    text: "Acabamento limpo, boa fidelidade visual e otimo custo para presentes, decoracao e linha geek."
  },
  {
    title: "PLA Silk",
    text: "Brilho elegante para pecas de destaque, brindes especiais e composicoes mais cenograficas."
  },
  {
    title: "Acabamento tecnico",
    text: "Preparacao, remocao de suportes e revisao visual antes de liberar cada pedido para entrega."
  }
] as const;

export const trustHighlights = [
  "Entrega local no Rio de Janeiro",
  "Atendimento rapido por WhatsApp",
  "Pagamento via Pix, cartao e boleto",
  "Operacao pronta para site, Mercado Livre e Shopee"
] as const;

export const faqHighlights = [
  {
    question: "Vocês produzem pecas personalizadas?",
    answer: "Sim. Trabalhamos com nomes, brindes, logos, itens geek e projetos sob medida com validacao de briefing."
  },
  {
    question: "Atendem somente o Rio de Janeiro?",
    answer: "A operacao principal e local no RJ. Isso melhora prazo, revisao final da peca e suporte durante a entrega."
  },
  {
    question: "Posso comprar sem criar conta?",
    answer: "Sim. O site continua aberto para visitantes e voce pode pedir orcamento sem ficar preso ao login."
  },
  {
    question: "Onde acompanho meus pedidos?",
    answer: "Clientes logados veem um painel pessoal com atalhos, historico e espaco para favoritos e pedidos."
  }
] as const;
