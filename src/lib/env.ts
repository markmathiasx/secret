const PROD = process.env.NODE_ENV === 'production';
const DEFAULT_PROD_URL = 'https://mdh-3d-store.vercel.app';
const DEFAULT_DEV_URL = 'http://localhost:3000';

function normalizeUrl(value?: string | null) {
  const raw = (value || '').trim();
  if (!raw) return PROD ? DEFAULT_PROD_URL : DEFAULT_DEV_URL;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, '');
  } catch {
    return PROD ? DEFAULT_PROD_URL : DEFAULT_DEV_URL;
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
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
}

export function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();
}

export function getSupabaseEnv() {
  return {
    url: getSupabaseUrl(),
    anon: getSupabaseAnonKey(),
    serviceRole: getSupabaseServiceKey()
  };
}
