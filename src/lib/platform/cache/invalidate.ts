import { cacheDelete } from "@/src/lib/platform/cache/client";
import { buildCacheKey, buildStaleCacheKey } from "@/src/lib/platform/cache/keys";

export async function invalidatePlatformCache(domain: string, parts: Array<string | number | boolean> = []) {
  const key = buildCacheKey(domain, parts);
  await Promise.all([cacheDelete(key), cacheDelete(buildStaleCacheKey(key))]);
  return { ok: true, key };
}
