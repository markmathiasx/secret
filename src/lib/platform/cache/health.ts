import { performance } from "node:perf_hooks";
import type { PlatformHealthCheck } from "@/src/lib/platform/health/types";
import { cachePing, cacheSetRaw, cacheGetRaw, cacheDelete } from "@/src/lib/platform/cache/client";
import { getCacheConfig, isExternalRedisConfigured } from "@/src/lib/platform/cache/config";
import { getCacheMetrics } from "@/src/lib/platform/cache/metrics";

export async function getCacheHealth(): Promise<PlatformHealthCheck> {
  const startedAt = performance.now();
  const config = getCacheConfig();
  const externalConfigured = isExternalRedisConfigured(config);

  if (!config.enabled) {
    return {
      name: "cache",
      status: "optional_missing",
      required: false,
      durationMs: Math.round(performance.now() - startedAt),
      message: "Cache disabled by CACHE_ENABLED=false.",
      metadata: { provider: "disabled", metrics: getCacheMetrics() },
    };
  }

  try {
    await cachePing();
    const probeKey = `${config.prefix}:admin:health:sanitized:probe`;
    await cacheSetRaw(probeKey, JSON.stringify({ ok: true }), 5);
    const probe = await cacheGetRaw(probeKey);
    await cacheDelete(probeKey);

    return {
      name: "cache",
      status: externalConfigured ? "ok" : "optional_missing",
      required: false,
      durationMs: Math.round(performance.now() - startedAt),
      message: externalConfigured ? "Redis cache available." : "Redis not configured; in-memory fallback active.",
      metadata: {
        provider: externalConfigured ? config.provider : "memory-fallback",
        probeOk: Boolean(probe),
        metrics: getCacheMetrics(),
      },
    };
  } catch {
    return {
      name: "cache",
      status: "degraded",
      required: false,
      durationMs: Math.round(performance.now() - startedAt),
      message: "Redis unavailable; fallback is active.",
      metadata: { provider: config.provider, metrics: getCacheMetrics() },
    };
  }
}
