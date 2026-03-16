const DEFAULT_PUBLIC_SITE_URL = "https://mdh-3d-store.vercel.app";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return trimTrailingSlash(new URL(withProtocol).toString());
  } catch {
    return null;
  }
}

function numberValue(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const publicEnv = {
  NEXT_PUBLIC_SITE_URL:
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.VERCEL_URL) ||
    DEFAULT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5521920137249",
  NEXT_PUBLIC_EXTRA_WHATSAPP_NUMBERS: process.env.NEXT_PUBLIC_EXTRA_WHATSAPP_NUMBERS || "",
  NEXT_PUBLIC_WHATSAPP_MESSAGE:
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Oi! Vim pelo site da MDH 3D e quero um orçamento.",
  NEXT_PUBLIC_PIX_PROVIDER: process.env.NEXT_PUBLIC_PIX_PROVIDER || "PicPay",
  NEXT_PUBLIC_CPF_SUFFIX: process.env.NEXT_PUBLIC_CPF_SUFFIX || "85",
  NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE: process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh___021",
  NEXT_PUBLIC_INSTAGRAM_URL:
    normalizeUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL) ||
    `https://www.instagram.com/${process.env.NEXT_PUBLIC_BRAND_INSTAGRAM_HANDLE || "mdh___021"}`,
  NEXT_PUBLIC_FACEBOOK_URL: normalizeUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL) || "#",
  NEXT_PUBLIC_TIKTOK_URL: normalizeUrl(process.env.NEXT_PUBLIC_TIKTOK_URL) || "#",
  NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.STAFF_NOTIFY_EMAIL || "mdhatendimento@gmail.com",
  NEXT_PUBLIC_SUPABASE_URL: normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "",
  NEXT_PUBLIC_DELIVERY_ORIGIN_LABEL: process.env.DELIVERY_ORIGIN_LABEL || "Condominio Meu Lar 2",
  NEXT_PUBLIC_GAS_PRICE_BRL: numberValue(process.env.GAS_PRICE_BRL, 6),
  NEXT_PUBLIC_BIKE_KM_PER_LITER: numberValue(process.env.BIKE_KM_PER_LITER, 35),
  NEXT_PUBLIC_DELIVERY_BASE_FEE: numberValue(process.env.DELIVERY_BASE_FEE, 8),
  NEXT_PUBLIC_DELIVERY_FEE_PER_KM: numberValue(process.env.DELIVERY_FEE_PER_KM, 0.6),
  NEXT_PUBLIC_DELIVERY_FEE_CAP: numberValue(process.env.DELIVERY_FEE_CAP, 35),
  NEXT_PUBLIC_DELIVERY_EXPRESS_MULTIPLIER: numberValue(process.env.DELIVERY_EXPRESS_MULTIPLIER, 2)
};

export function getMetadataBase() {
  return new URL(publicEnv.NEXT_PUBLIC_SITE_URL);
}

export function getSupabaseUrl() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_URL || null;
}

export function getSupabaseBrowserKey() {
  return publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
}

export function getSupabaseServerKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim() || null;
}

export function getSupabaseCatalogBucketUrl() {
  return normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL) || null;
}

export function hasGoogleMapsApiKey() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim());
}
