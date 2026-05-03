import { unstable_cache } from 'next/cache';
import { getRedisUrl } from './env';

// Memory cache (60s TTL)
const memoryCache = new Map<string, { data: any; expires: number }>();

function getMemoryCache(key: string): any | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setMemoryCache(key: string, data: any, ttlMs = 60000): void {
  memoryCache.set(key, { data, expires: Date.now() + ttlMs });
  
  // Cleanup expired entries periodically
  if (memoryCache.size > 1000) {
    for (const [k, v] of memoryCache.entries()) {
      if (Date.now() > v.expires) {
        memoryCache.delete(k);
      }
    }
  }
}

// Redis cache (5min-1h TTL) - disabled for now
let redisClient: any = null;

function getRedisClient(): any {
  return null; // Disabled Redis for now
}

async function getRedisCache(key: string): Promise<any | null> {
  return null; // Disabled Redis for now
}

async function setRedisCache(key: string, data: any, ttlSeconds = 300): Promise<void> {
  // Disabled Redis for now
}

// Multi-layer cache wrapper
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    memoryTtl?: number;
    redisTtl?: number;
    revalidate?: number;
    tags?: string[];
  } = {}
): Promise<T> {
  const { memoryTtl = 60000, redisTtl = 300, revalidate = 3600, tags = [] } = options;

  // 1. Check memory cache first (fastest)
  const memoryData = getMemoryCache(key);
  if (memoryData !== null) {
    return memoryData;
  }

  // 2. Check Redis cache (second fastest)
  const redisData = await getRedisCache(key);
  if (redisData !== null) {
    setMemoryCache(key, redisData, memoryTtl);
    return redisData;
  }

  // 3. Fetch fresh data
  const freshData = await fetcher();

  // 4. Store in all cache layers
  setMemoryCache(key, freshData, memoryTtl);
  await setRedisCache(key, freshData, redisTtl);

  // 5. Use Next.js unstable_cache for CDN edge caching
  if (tags.length > 0) {
    unstable_cache(
      async () => freshData,
      [key],
      { revalidate, tags }
    );
  }

  return freshData;
}

// Cache invalidation helpers
export async function invalidateCache(keys: string[]): Promise<void> {
  // Clear memory cache
  keys.forEach(key => memoryCache.delete(key));

  // Clear Redis cache
  const client = getRedisClient();
  if (client) {
    try {
      await client.del(...keys);
    } catch {
      // Silently fail
    }
  }
}

// Tag-based cache invalidation for Next.js
export function revalidateCacheTags(tags: string[]): void {
  if (typeof window === 'undefined') {
    // Server-side: trigger revalidation
    tags.forEach(tag => {
      // This will be handled by Next.js revalidateTag
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] Revalidating tag: ${tag}`);
      }
    });
  }
}

// Cache key generators
export const cacheKeys = {
  product: (slug: string) => `product:${slug}`,
  productPrice: (slug: string, options: string) => `product:price:${slug}:${options}`,
  category: (slug: string) => `category:${slug}`,
  shipping: (postalCode: string) => `shipping:${postalCode}`,
  catalog: (page: number, filters: string) => `catalog:${page}:${filters}`,
  blogPost: (slug: string) => `blog:${slug}`,
  settings: () => 'settings:global',
};

// Cache TTL constants
export const cacheTtl = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  daily: 86400, // 24 hours
};
