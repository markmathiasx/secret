import { getOrSetJson } from "@/src/lib/platform/cache/cache-aside";
import { profileQuery } from "@/src/lib/platform/data/query-profiler";

export async function readThroughDal<T>(
  name: string,
  key: string,
  loader: () => Promise<T> | T,
  options: { ttlSeconds?: number; cacheSensitive?: boolean; source?: string } = {}
) {
  return profileQuery(name, async () => {
    const result = await getOrSetJson(key, loader, options);
    return {
      value: result.value,
      source: options.source || "official-source",
      cacheStatus: result.cacheStatus,
    };
  });
}
