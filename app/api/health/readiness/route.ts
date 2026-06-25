import { getReadinessReport } from "@/src/lib/platform/health/readiness";
import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getReadinessReport();
  return platformJson(report, { status: report.ok ? 200 : 503 });
}
