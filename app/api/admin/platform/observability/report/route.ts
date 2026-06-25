import { getMetricsReport } from "@/src/lib/platform/observability/metrics";
import { getSloReport } from "@/src/lib/platform/observability/slo";
import { getQueryProfileReport } from "@/src/lib/platform/data/query-profiler";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  return platformJson({
    ok: true,
    generatedAt: new Date().toISOString(),
    metrics: getMetricsReport(),
    slo: getSloReport(),
    queryProfiler: getQueryProfileReport(),
  });
}
