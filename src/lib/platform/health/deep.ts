import { getReadinessReport } from "@/src/lib/platform/health/readiness";
import { getQueryProfileReport } from "@/src/lib/platform/data/query-profiler";
import { getCacheMetrics } from "@/src/lib/platform/cache/metrics";

export async function getDeepHealthReport() {
  const readiness = await getReadinessReport();
  return {
    ...readiness,
    deep: true,
    queryProfiler: getQueryProfileReport(),
    cacheMetrics: getCacheMetrics(),
    localAgentCriticalPath: false,
  };
}
