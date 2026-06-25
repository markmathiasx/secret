export type CacheProvider = "upstash" | "tcp" | "memory";

export type CacheConfig = {
  enabled: boolean;
  provider: CacheProvider;
  prefix: string;
  defaultTtlSeconds: number;
  staleTtlSeconds: number;
  lockTtlSeconds: number;
  upstashRestUrl: string | null;
  upstashRestToken: string | null;
  redisUrl: string | null;
};

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function numberEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getCacheConfig(): CacheConfig {
  const provider = (process.env.CACHE_PROVIDER || "upstash").toLowerCase();
  return {
    enabled: bool(process.env.CACHE_ENABLED, true),
    provider: provider === "tcp" ? "tcp" : provider === "memory" ? "memory" : "upstash",
    prefix: process.env.CACHE_PREFIX || "mdh3d:v1",
    defaultTtlSeconds: numberEnv("CACHE_DEFAULT_TTL_SECONDS", 300),
    staleTtlSeconds: numberEnv("CACHE_STALE_TTL_SECONDS", 86400),
    lockTtlSeconds: numberEnv("CACHE_LOCK_TTL_SECONDS", 30),
    upstashRestUrl: process.env.UPSTASH_REDIS_REST_URL?.trim() || null,
    upstashRestToken: process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || null,
    redisUrl: process.env.REDIS_URL?.trim() || null,
  };
}

export function isExternalRedisConfigured(config = getCacheConfig()) {
  return Boolean((config.upstashRestUrl && config.upstashRestToken) || config.redisUrl);
}
