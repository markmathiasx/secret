/**
 * Sliding window in-memory rate limiter.
 * Compatible with Edge Runtime and Node.js (uses only Map and Date.now()).
 * Module-level storage is per-Vercel-instance — not shared across replicas.
 * Suitable for brute-force mitigation on auth and payment routes.
 */

export interface RateLimitConfig {
  windowMs: number; // Sliding window duration in milliseconds
  maxRequests: number; // Max requests allowed per window per key
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp (ms) when the oldest request in window expires
  retryAfterMs?: number; // Milliseconds to wait before retrying (only when success === false)
}

// key → sorted array of request timestamps within the current window
const store = new Map<string, number[]>();

const MAX_STORE_KEYS = 10_000;
const PRUNE_BATCH_SIZE = 500;

function pruneExpiredKeys(windowMs: number): void {
  if (store.size <= MAX_STORE_KEYS) return;
  const cutoff = Date.now() - windowMs;
  let pruned = 0;
  for (const [key, timestamps] of store) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] < cutoff) {
      store.delete(key);
      if (++pruned >= PRUNE_BATCH_SIZE) break;
    }
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Keep only timestamps within the sliding window
  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= config.maxRequests) {
    const resetAt = timestamps[0] + config.windowMs;
    return { success: false, remaining: 0, resetAt, retryAfterMs: resetAt - now };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  pruneExpiredKeys(config.windowMs);

  return {
    success: true,
    remaining: config.maxRequests - timestamps.length,
    resetAt: timestamps[0] + config.windowMs,
  };
}

/** 10 attempts per 15 minutes — auth/admin login routes */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
};

/** 5 requests per minute — PIX and checkout payment routes */
export const PAYMENT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 5,
};

/** 240 requests per minute — general public API routes */
export const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 240,
};

/** 300 reads per minute — session polling should not share the login brute-force bucket */
export const SESSION_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 300,
};

/** 100 requests per minute — global request safety net per IP */
export const GLOBAL_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 100,
};
