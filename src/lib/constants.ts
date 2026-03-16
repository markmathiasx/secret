function parseList(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const brand = {
  name: "MDH 3D",
  legalName: "MarkDressaHeylel",
  city: "Rio de Janeiro",
  state: "RJ",
  slogan: "Impressao 3D sob encomenda com acabamento premium, entrega local e atendimento consultivo",
  instagramHandle: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh___021"
};

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
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Oi! Vim pelo site da MDH 3D e quero um orçamento.";

export const supportEmail =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.STAFF_NOTIFY_EMAIL || "mdhatendimento@gmail.com";

export const pix = {
  provider: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  cpfSuffix: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85"
};

export const socialLinks = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || `https://www.instagram.com/${brand.instagramHandle}`,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "#"
};

export const deliveryKm = {
  originLabel: process.env.DELIVERY_ORIGIN_LABEL || "Condominio Meu Lar 2",
  gasPriceBrl: toNumber(process.env.GAS_PRICE_BRL, 6),
  bikeKmPerLiter: toNumber(process.env.BIKE_KM_PER_LITER, 35),
  baseFee: toNumber(process.env.DELIVERY_BASE_FEE, 8),
  feePerKm: toNumber(process.env.DELIVERY_FEE_PER_KM, 0.6),
  capFee: toNumber(process.env.DELIVERY_FEE_CAP, 35),
  expressMultiplier: toNumber(process.env.DELIVERY_EXPRESS_MULTIPLIER, 2)
};

export const deliveryZones = [
  { region: "Centro e Zona Portuaria", fee: 12, eta: "1 dia util" },
  { region: "Zona Norte", fee: 16, eta: "1 a 2 dias uteis" },
  { region: "Zona Sul", fee: 18, eta: "1 a 2 dias uteis" },
  { region: "Barra / Jacarepagua", fee: 22, eta: "1 a 3 dias uteis" },
  { region: "Baixada / Niteroi / demais areas", fee: 28, eta: "2 a 3 dias uteis" }
] as const;

export const homepageCollections = [
  "Anime",
  "Geek",
  "Utilitários",
  "Personalizados",
  "Decoração",
  "Escritório"
] as const;
