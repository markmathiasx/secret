import { okExit, writeReport } from "./shared.mjs";

const upstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const tcp = Boolean(process.env.REDIS_URL);
const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  enabled: process.env.CACHE_ENABLED !== "false",
  provider: upstash ? "upstash" : tcp ? "tcp" : "memory-fallback",
  redisConfigured: upstash || tcp,
  fallback: !(upstash || tcp),
  staleFallbackTtlSeconds: Number(process.env.CACHE_STALE_TTL_SECONDS || 86400),
};
okExit(true, writeReport("cache-health.json", report));
