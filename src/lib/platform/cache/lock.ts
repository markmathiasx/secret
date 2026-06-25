import { cacheDelete, cacheSetNx } from "@/src/lib/platform/cache/client";
import { getCacheConfig } from "@/src/lib/platform/cache/config";

export async function withCacheLock<T>(key: string, work: () => Promise<T> | T) {
  const token = crypto.randomUUID();
  const acquired = await cacheSetNx(`${key}:lock`, token, getCacheConfig().lockTtlSeconds);
  if (!acquired) {
    throw new Error("cache_lock_busy");
  }

  try {
    return await work();
  } finally {
    await cacheDelete(`${key}:lock`);
  }
}
