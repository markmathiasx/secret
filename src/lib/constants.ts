export const brand = {
  name: "MDH 3D",
  legalName: "MDH 3D Store",
  city: "Rio de Janeiro",
  state: "RJ",
  slogan: "Impressão 3D premium para presentes criativos, setup, decoração e peças sob encomenda",
  instagramHandle: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh_impressao3d",
};

function parseList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const whatsappContacts = [
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521920137249",
  ...parseList(process.env.NEXT_PUBLIC_EXTRA_WHATSAPP_NUMBERS),
].map((number, index) => ({
  id: `wa-${index + 1}`,
  label: index === 0 ? "Atendimento principal" : `Atendimento ${index + 1}`,
  number,
}));

export const whatsappNumber = whatsappContacts[0]?.number || "5521920137249";
export const whatsappMessage =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Oi! Vim pelo site da MDH 3D e quero um orçamento.";
export const supportEmail = process.env.STAFF_NOTIFY_EMAIL || "mdhatendimento@gmail.com";

export const pix = {
  provider: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  cpfSuffix: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85",
};

export const socialLinks = {
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL || `https://www.instagram.com/${brand.instagramHandle}`,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
};

const fallbackSessionToken =
  process.env.ADMIN_SESSION_TOKEN ||
  process.env.ADMIN_SESSION_SECRET ||
  "mdh_troque_este_token_no_env";

export const adminConfig = {
  email: process.env.ADMIN_EMAIL || "markmathias01@gmail.com",
  hiddenPath: process.env.ADMIN_HIDDEN_PATH || "/painel-mdh-85",
  sessionCookieName: "mdh_admin",
  sessionSecret:
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_TOKEN || "troque-o-session-secret",
  sessionToken: fallbackSessionToken,
  passwordHash: process.env.ADMIN_PASSWORD_HASH || "",
};

const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const deliveryKm = {
  originLabel: process.env.DELIVERY_ORIGIN_LABEL || "Rio de Janeiro - RJ",
  gasPriceBrl: num(process.env.GAS_PRICE_BRL, 6),
  bikeKmPerLiter: num(process.env.BIKE_KM_PER_LITER, 35),
  baseFee: num(process.env.DELIVERY_BASE_FEE, 8),
  feePerKm: num(process.env.DELIVERY_FEE_PER_KM, 0.6),
  capFee: num(process.env.DELIVERY_FEE_CAP, 35),
  expressMultiplier: num(process.env.DELIVERY_EXPRESS_MULTIPLIER, 2),
};

export const deliveryZones = [
  { region: "Centro e Zona Portuária", fee: 12, eta: "1 dia útil" },
  { region: "Zona Norte", fee: 16, eta: "1 a 2 dias úteis" },
  { region: "Zona Sul", fee: 18, eta: "1 a 2 dias úteis" },
  { region: "Barra / Jacarepaguá", fee: 22, eta: "1 a 3 dias úteis" },
  { region: "Baixada / Niterói / demais áreas", fee: 28, eta: "2 a 3 dias úteis" },
] as const;

export const homepageCollections = [
  "Mais vendidos",
  "Anime & Geek",
  "Setup & Organização",
  "Casa & Decoração",
  "Presentes Criativos",
  "Sob Encomenda",
] as const;

export const homepageCategories: any[] = [
  {
    id: "anime-geek",
    label: "Anime & Geek",
    title: "Colecionáveis com acabamento premium",
    description: "Miniaturas, bustos, peças kawaii e itens de fandom com janela rápida de produção no RJ.",
    href: "/catalogo?category=Anime%20%26%20Geek",
    cta: "Explorar anime e geek",
  },
  {
    id: "setup-organizacao",
    label: "Setup & Organização",
    title: "Suportes, docks e organizadores que resolvem o dia a dia",
    description: "Soluções práticas para celular, fone, controle, cabos e estação de trabalho.",
    href: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o",
    cta: "Ver setup e organização",
  },
  {
    id: "casa-decoracao",
    label: "Casa & Decoração",
    title: "Peças leves para presentear e decorar",
    description: "Vasos, luminárias, porta-copos e utilidades com cara de produto de loja séria.",
    href: "/catalogo?category=Casa%20%26%20Decora%C3%A7%C3%A3o",
    cta: "Conhecer decoração",
  },
];

export const trustHighlights: any[] = [
  {
    title: "Produção local no Rio de Janeiro",
    description: "Peças feitas sob controle direto da loja, sem depender de importação lenta.",
    badge: "RJ",
  },
  {
    title: "Pix com preço mais forte",
    description: "A comunicação de valor no site já privilegia Pix para melhorar conversão.",
    badge: "PIX",
  },
  {
    title: "Atendimento humano no WhatsApp",
    description: "Você fala com a MDH 3D para orçamento, personalização e acompanhamento.",
    badge: "HUMANO",
  },
];

export const materialsShowcase: any[] = [
  {
    title: "PLA Premium",
    description: "Ótimo para presentes, colecionáveis, setup e decoração interna.",
    badge: "PLA",
  },
  {
    title: "PLA Silk",
    description: "Visual mais brilhante para peças com impacto visual e apelo de presente.",
    badge: "SILK",
  },
  {
    title: "PETG",
    description: "Mais robusto para utilidades e peças que pedem resistência maior.",
    badge: "PETG",
  },
  {
    title: "Resina",
    description: "Detalhe fino para bustos, miniaturas e acabamentos mais refinados.",
    badge: "RESINA",
  },
];

export const faqItems: any[] = [
  {
    question: "Vocês fazem peças sob encomenda?",
    answer: "Sim. Você pode pedir orçamento pelo WhatsApp ou pela página de imagem para impressão 3D.",
  },
  {
    question: "Quais materiais vocês usam?",
    answer: "A loja trabalha principalmente com PLA Premium, PLA Silk, PETG e resina, conforme o tipo de peça.",
  },
  {
    question: "Qual o prazo médio?",
    answer: "Pronta entrega costuma sair em 24h a 48h. Sob encomenda normalmente fica entre 3 e 7 dias.",
  },
  {
    question: "Vocês entregam no Rio de Janeiro?",
    answer: "Sim. A operação é baseada no Rio de Janeiro e também atende outras regiões conforme o frete.",
  },
  {
    question: "Posso mandar imagem ou referência?",
    answer: "Sim. A nova página de imagem para impressão 3D foi criada justamente para esse fluxo.",
  },
];

export const footerLinks: any[] = [
  { label: "Política de privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de uso", href: "/termos" },
  { label: "Trocas e devoluções", href: "/trocas-e-devolucoes" },
  { label: "Frete e prazo", href: "/entregas" },
];
