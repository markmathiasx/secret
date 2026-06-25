import { getDeepHealthReport } from "@/src/lib/platform/health/deep";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;

  const report = await getDeepHealthReport();
  return platformJson(report, { status: report.ok ? 200 : 503 });
}
