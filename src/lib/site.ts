export const DEFAULT_PRODUCTION_SITE_URL = "https://mdh-3d-store.vercel.app";

function normalizeSiteUrl(value?: string) {
  if (!value) return null;

  const raw = value.trim();
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(options?: { allowLocalhost?: boolean; fallback?: string }) {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  const productionUrl = normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (productionUrl) return productionUrl;

  const previewUrl = normalizeSiteUrl(process.env.VERCEL_URL);
  if (previewUrl) return previewUrl;

  if (options?.fallback) {
    return options.fallback;
  }

  if (options?.allowLocalhost) {
    return "http://localhost:3000";
  }

  return DEFAULT_PRODUCTION_SITE_URL;
}

export const siteUrl = getSiteUrl();
export const metadataBase = new URL(siteUrl);

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}
