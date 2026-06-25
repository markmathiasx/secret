import { getCacheConfig } from "@/src/lib/platform/cache/config";
import { recordCacheMetric } from "@/src/lib/platform/cache/metrics";
import { redisRestCommand } from "@/src/lib/platform/cache/redis-rest";
import { redisTcpCommand } from "@/src/lib/platform/cache/redis-tcp";

type MemoryEntry = {
  value: string;
  expiresAt: number;
};

const memoryStore = new Map<string, MemoryEntry>();

async function command<T>(parts: (string | number)[]): Promise<T | null> {
  const config = getCacheConfig();
  if (!config.enabled) return null;

  try {
    if (config.upstashRestUrl && config.upstashRestToken) {
      return await redisRestCommand<T>(config.upstashRestUrl, config.upstashRestToken, parts);
    }

    if (config.redisUrl) {
      return (await redisTcpCommand(config.redisUrl, parts)) as T | null;
    }
  } catch {
    recordCacheMetric("errors");
  }

  return null;
}

export async function cacheGetRaw(key: string) {
  const external = await command<string>(["GET", key]);
  if (typeof external === "string") return external;

  const current = memoryStore.get(key);
  if (!current || current.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return current.value;
}

export async function cacheSetRaw(key: string, value: string, ttlSeconds: number) {
  const result = await command<"OK">(["SET", key, value, "EX", Math.max(1, ttlSeconds)]);
  memoryStore.set(key, { value, expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000 });
  recordCacheMetric("sets");
  return result === "OK";
}

export async function cacheDelete(key: string) {
  await command<number>(["DEL", key]);
  memoryStore.delete(key);
  recordCacheMetric("deletes");
  return true;
}

export async function cacheSetNx(key: string, value: string, ttlSeconds: number) {
  const result = await command<string>(["SET", key, value, "NX", "EX", Math.max(1, ttlSeconds)]);
  if (result === "OK") {
    recordCacheMetric("locks");
    return true;
  }

  const current = memoryStore.get(key);
  if (current && current.expiresAt > Date.now()) return false;
  memoryStore.set(key, { value, expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000 });
  recordCacheMetric("locks");
  return true;
}

export async function cachePing() {
  const result = await command<string>(["PING"]);
  return result === "PONG" || result === null;
}
