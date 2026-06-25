import { getCacheHealth } from "@/src/lib/platform/cache/health";
import { getCacheMetrics } from "@/src/lib/platform/cache/metrics";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  return platformJson({ ok: true, health: await getCacheHealth(), metrics: getCacheMetrics() });
}
