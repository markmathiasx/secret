import { getCacheHealth } from "@/src/lib/platform/cache/health";
import { getDatabaseHealth } from "@/src/lib/platform/db/health";
import { getQueryProfileReport } from "@/src/lib/platform/data/query-profiler";

export async function getAdminPlatformDal() {
  const [database, cache] = await Promise.all([getDatabaseHealth(), getCacheHealth()]);
  return {
    generatedAt: new Date().toISOString(),
    database,
    cache,
    queryProfiler: getQueryProfileReport(),
  };
}
