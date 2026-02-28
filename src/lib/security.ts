const hits = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, limit = 15, windowMs = 60_000) {
  const now = Date.now();
  const current = hits.get(key);

  if (!current || current.expiresAt < now) {
    hits.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((current.expiresAt - now) / 1000) };
  }

  current.count += 1;
  hits.set(key, current);
  return { ok: true, remaining: limit - current.count };
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
