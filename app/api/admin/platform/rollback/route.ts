import { rollbackDryRun } from "@/src/lib/platform/rollback/rollback";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const result = rollbackDryRun();
  recordAuditEvent({ action: "rollback.dry_run", metadata: result });
  return platformJson(result, { status: result.ok ? 200 : 503 });
}
