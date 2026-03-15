<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
const fallbackSiteUrl = "https://example.com";

function normalizeUrl(value?: string) {
  if (!value) return fallbackSiteUrl;
  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    return fallbackSiteUrl;
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  }
}

export function getSiteUrl() {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
=======
>>>>>>> theirs
const PROD = process.env.NODE_ENV === "production";

function trimSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) {
    return PROD ? "https://example.com" : "http://localhost:3000";
  }

  try {
    const url = new URL(value);
    return trimSlash(url.toString());
  } catch {
    return PROD ? "https://example.com" : "http://localhost:3000";
  }
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim() || "";

  return { url, anon, serviceRole };
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
}
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
}

export function getSupabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
