const DEFAULT_AUTH_URL = "https://www.mdh3d.com.br";

export function normalizeAuthUrl(value?: string | null, fallback = DEFAULT_AUTH_URL) {
  const raw = value?.trim() || fallback;
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw)
    ? raw
    : /^(localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(raw)
      ? `http://${raw}`
      : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Protocolo inválido");
    return url.origin;
  } catch {
    return new URL(fallback).origin;
  }
}

export function normalizeAuthUrlEnvironment(fallback = DEFAULT_AUTH_URL) {
  const normalized = normalizeAuthUrl(process.env.AUTH_URL || process.env.NEXTAUTH_URL, fallback);
  process.env.AUTH_URL = normalized;
  process.env.NEXTAUTH_URL = normalized;
  return normalized;
}

