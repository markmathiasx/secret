import { cacheGetRaw, cacheSetRaw } from "@/src/lib/platform/cache/client";
import { getCacheConfig } from "@/src/lib/platform/cache/config";
import { buildStaleCacheKey } from "@/src/lib/platform/cache/keys";
import { recordCacheMetric } from "@/src/lib/platform/cache/metrics";

export async function getStaleJson<T>(key: string) {
  const raw = await cacheGetRaw(buildStaleCacheKey(key));
  if (!raw) return null;

  try {
    recordCacheMetric("staleHits");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStaleJson(key: string, value: unknown) {
  const config = getCacheConfig();
  await cacheSetRaw(buildStaleCacheKey(key), JSON.stringify(value), config.staleTtlSeconds);
}
