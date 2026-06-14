import { OFFICIAL_WHATSAPP_NUMBER } from "@/lib/constants";

function clean(value?: string | null) {
  return (value || "").trim();
}

function normalizePhone(value?: string | null) {
  const digits = clean(value).replace(/\D/g, "");
  return digits || OFFICIAL_WHATSAPP_NUMBER;
}

function normalizeBaseUrl(value?: string | null) {
  const raw = clean(value);
  if (!raw) return "";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(parsed.hostname)) return "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function getStorefrontWhatsappNumber() {
  return normalizePhone(
    process.env.VITE_WHATSAPP_NUMBER ||
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      process.env.WHATSAPP_NUMBER
  );
}

export function getNuvemshopBaseUrl() {
  return normalizeBaseUrl(
    process.env.VITE_NUVEMSHOP_BASE_URL ||
      process.env.NEXT_PUBLIC_NUVEMSHOP_BASE_URL ||
      process.env.NUVEMSHOP_BASE_URL
  );
}

export function getStorefrontGtmId() {
  return clean(process.env.VITE_GTM_ID || process.env.NEXT_PUBLIC_GTM_ID);
}

export function getStorefrontMetaPixelId() {
  return clean(
    process.env.VITE_META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_FB_PIXEL_ID
  );
}

export function getStorefrontTiktokPixelId() {
  return clean(process.env.VITE_TIKTOK_PIXEL_ID || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID);
}
