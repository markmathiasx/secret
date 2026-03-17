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

/**
 * Vercel plan helpers.
 *
 * NOTE: Vercel does not expose plan info directly to deployments, so
 * we rely on an explicit environment variable set in the project settings.
 *
 * Set `NEXT_PUBLIC_VERCEL_PLAN=hobby` or `NEXT_PUBLIC_VERCEL_PLAN=pro` (or similar)
 * in Vercel to let the app know which plan is used.
 */
export function getVercelPlan(): string {
  return (process.env.NEXT_PUBLIC_VERCEL_PLAN || process.env.VERCEL_PLAN || "hobby").toLowerCase();
}

export function isVercelHobbyPlan(): boolean {
  return getVercelPlan() === "hobby";
}

export function isVercelProPlan(): boolean {
  const plan = getVercelPlan();
  return plan === "pro" || plan === "team" || plan === "enterprise";
}
