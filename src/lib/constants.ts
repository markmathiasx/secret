export const brand = {
  name: "MDH 3D",
  legalName: "MarkDressaHeylel",
  city: "Rio de Janeiro",
  state: "RJ",
  slogan: "Impressão 3D premium para decoração, utilidades, anime, geek e personalizados",
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
  "Oi! Vim pelo site da MDH 3D e quero um orçamento.";

export const supportEmail = process.env.STAFF_NOTIFY_EMAIL || "mdhatendimento@gmail.com";

export const pix = {
  provider: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  cpfSuffix: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85"
};

export const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || `https://www.instagram.com/${brand.instagramHandle}`,
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#"
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
  { region: "Centro e Zona Portuária", fee: 12, eta: "1 dia útil" },
  { region: "Zona Norte", fee: 16, eta: "1 a 2 dias úteis" },
  { region: "Zona Sul", fee: 18, eta: "1 a 2 dias úteis" },
  { region: "Barra / Jacarepaguá", fee: 22, eta: "1 a 3 dias úteis" },
  { region: "Baixada / Niterói / demais áreas", fee: 28, eta: "2 a 3 dias úteis" }
] as const;

export const homepageCollections = [
  "Anime",
  "Geek",
  "Utilidades",
  "Casa",
  "Escritorio",
  "Personalizados"
  "Mais vendidos",
  "Anime e Geek",
  "Utilidades e Organização",
  "Personalizados",
  "Presentes e Decoração",
  "Peças para setup e escritório"
] as const;
