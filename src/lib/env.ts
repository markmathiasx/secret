const DEFAULT_SITE_URL = "https://mdh-3d.vercel.app";

function normalizeUrl(value?: string) {
  if (!value) return DEFAULT_SITE_URL;

  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_SITE_URL;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl() {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL
  );
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

export function getSupabaseEnv() {
  return {
    url: getSupabaseUrl(),
    anon: getSupabaseAnonKey(),
    serviceRole: getSupabaseServiceKey()
  };
}
