import { cacheGetRaw, cacheSetRaw } from "@/src/lib/platform/cache/client";
import { getCacheConfig } from "@/src/lib/platform/cache/config";
import { getStaleJson, setStaleJson } from "@/src/lib/platform/cache/stale";
import { recordCacheMetric } from "@/src/lib/platform/cache/metrics";

export type CacheAsideResult<T> = {
  value: T;
  cacheStatus: "hit" | "miss" | "stale" | "bypass";
};

export async function getOrSetJson<T>(
  key: string,
  loader: () => Promise<T> | T,
  options: { ttlSeconds?: number; cacheSensitive?: boolean } = {}
): Promise<CacheAsideResult<T>> {
  const config = getCacheConfig();
  if (!config.enabled || options.cacheSensitive) {
    return { value: await loader(), cacheStatus: "bypass" };
  }

  const cached = await cacheGetRaw(key);
  if (cached) {
    try {
      recordCacheMetric("hits");
      return { value: JSON.parse(cached) as T, cacheStatus: "hit" };
    } catch {
      recordCacheMetric("errors");
    }
  }

  recordCacheMetric("misses");
  try {
    const value = await loader();
    const payload = JSON.stringify(value);
    await Promise.all([
      cacheSetRaw(key, payload, options.ttlSeconds ?? config.defaultTtlSeconds),
      setStaleJson(key, value),
    ]);
    return { value, cacheStatus: "miss" };
  } catch (error) {
    const stale = await getStaleJson<T>(key);
    if (stale !== null) return { value: stale, cacheStatus: "stale" };
    throw error;
  }
}
