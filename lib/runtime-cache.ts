import "server-only";
import { redisDelete, redisGetJson, redisSetJson } from "@/lib/redis";

export async function getCachedJson<T>(key: string) {
  return redisGetJson<T>(`cache:${key}`);
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number) {
  return redisSetJson(`cache:${key}`, value, ttlSeconds);
}

export async function invalidateCacheKey(key: string) {
  return redisDelete(`cache:${key}`);
}

export async function invalidateCatalogCache() {
  await Promise.all([
    invalidateCacheKey("catalog:products"),
    invalidateCacheKey("catalog:categories"),
  ]);
}
