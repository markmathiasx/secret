export const brand = {
  name: "MDH 3D",
  legalName: "MarkDressaHeylel",
  city: "Rio de Janeiro",
  state: "RJ",
  slogan: "Pecas 3D com personalidade para presentear, organizar e decorar",
  instagramHandle: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh_impressao3d"
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
  "Oi! Vim pelo site da MDH 3D e quero atendimento.";

export const supportEmail = process.env.STAFF_NOTIFY_EMAIL || "contato@mdh3d.local";

export const pix = {
  provider: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  cpfSuffix: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85"
};

export const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/mdh_impressao3d/",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"
};

export const adminConfig = {
  email: process.env.ADMIN_EMAIL || "admin@mdh3d.local",
  loginPath: "/admin/login",
  panelPath: "/admin",
  legacyPath: "/painel-mdh-85",
  sessionCookieName: "mdh_admin_session"
};

export const customerAuthConfig = {
  loginPath: "/login",
  registerPath: "/login?mode=register",
  accountPath: "/conta",
  sessionCookieName: "mdh_customer_session"
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
  { region: "Centro e Zona Portuária", fee: 12, eta: "1 dia útil" },
  { region: "Zona Norte", fee: 16, eta: "1 a 2 dias úteis" },
  { region: "Zona Sul", fee: 18, eta: "1 a 2 dias úteis" },
  { region: "Barra / Jacarepaguá", fee: 22, eta: "1 a 3 dias úteis" },
  { region: "Baixada / Niterói / demais áreas", fee: 28, eta: "2 a 3 dias úteis" }
] as const;

export const homepageCollections = [
  "Mais pedidos",
  "Presentes criativos",
  "Geek & Anime",
  "Setup organizado",
  "Casa com personalidade",
  "Sob encomenda",
  "Decor para setup",
  "Pequenos luxos em 3D"
] as const;
