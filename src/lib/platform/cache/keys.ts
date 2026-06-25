import { getCacheConfig } from "@/src/lib/platform/cache/config";

const allowedDomains = new Set([
  "catalog:stats",
  "catalog:products",
  "catalog:search",
  "catalog:filters",
  "home:rails",
  "offers:drops",
  "feed:meta",
  "feed:google",
  "feed:products",
  "sitemap:products",
  "support:faq",
  "ai:context",
  "priceops:report",
  "channelops:status",
  "admin:health:sanitized",
  "jobs:queue",
]);

export function buildCacheKey(domain: string, parts: Array<string | number | boolean | null | undefined> = []) {
  if (!allowedDomains.has(domain)) {
    throw new Error(`cache_domain_not_allowed:${domain}`);
  }

  const config = getCacheConfig();
  const suffix = parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .map((part) => String(part).replace(/[^a-z0-9:_-]+/gi, "-").slice(0, 120))
    .join(":");
  return `${config.prefix}:${domain}${suffix ? `:${suffix}` : ""}`;
}

export function buildStaleCacheKey(key: string) {
  return `${key}:stale`;
}
