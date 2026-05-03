/**
 * Redis client via Upstash REST API — no extra package required.
 * Falls back gracefully to in-memory when not configured (local dev / no Redis).
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env to enable.
 */

type PipelineResult = { result: unknown; error?: string };
type MemoryValue = { value: unknown; expiresAt: number };

async function upstashPipeline(commands: (string | number)[][]): Promise<PipelineResult[] | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(500),
    });

    if (!res.ok) return null;
    return (await res.json()) as PipelineResult[];
  } catch {
    return null;
  }
}

async function upstashCommand<T>(command: (string | number)[]): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(700),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as { result?: T };
    return json.result ?? null;
  } catch {
    return null;
  }
}

// ── In-memory fallback ────────────────────────────────────────────────────────
type Window = { count: number; expiresAt: number };
const memStore = new Map<string, Window>();
const jsonStore = new Map<string, MemoryValue>();

function memRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const current = memStore.get(key);

  if (!current || current.expiresAt < now) {
    memStore.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }

  current.count += 1;
  memStore.set(key, current);
  return { ok: true, remaining: limit - current.count, retryAfter: 0 };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Rate limit a key using Redis (Upstash) when available, in-memory otherwise.
 * Uses atomic SET NX EX + INCR pipeline for correctness across server instances.
 */
export async function rateLimitRequest(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: boolean; remaining: number; retryAfter: number }> {
  const windowSec = Math.ceil(windowMs / 1000);

  // Try Redis first
  const results = await upstashPipeline([
    ["SET", key, 0, "NX", "EX", windowSec],
    ["INCR", key],
  ]);

  if (results) {
    const count = typeof results[1]?.result === "number" ? results[1].result : 1;
    const ok = count <= limit;
    return {
      ok,
      remaining: Math.max(0, limit - count),
      retryAfter: ok ? 0 : windowSec,
    };
  }

  // Fallback to in-memory
  return memRateLimit(key, limit, windowMs);
}

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim(),
  );
}

export async function redisGetJson<T>(key: string): Promise<T | null> {
  const result = await upstashCommand<string>(["GET", key]);
  if (typeof result === "string") {
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }

  const current = jsonStore.get(key);
  if (!current || current.expiresAt < Date.now()) {
    jsonStore.delete(key);
    return null;
  }

  return current.value as T;
}

export async function redisSetJson(key: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  const payload = JSON.stringify(value);
  const result = await upstashCommand<"OK">(["SET", key, payload, "EX", Math.max(1, ttlSeconds)]);

  if (result === "OK") return true;

  jsonStore.set(key, {
    value,
    expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000,
  });
  return false;
}

export async function redisDelete(key: string): Promise<boolean> {
  const result = await upstashCommand<number>(["DEL", key]);
  jsonStore.delete(key);
  return typeof result === "number" ? result > 0 : false;
}
