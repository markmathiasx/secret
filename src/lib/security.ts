type RateWindow = { count: number; expiresAt: number };
const hits = new Map<string, RateWindow>();

export function checkRateLimit(key: string, limit = 15, windowMs = 60_000) {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.expiresAt < now) {
    hits.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }
  current.count += 1;
  hits.set(key, current);
  return { ok: true, remaining: Math.max(0, limit - current.count), retryAfter: 0 };
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
