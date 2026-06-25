import { createPlatformBackup } from "@/src/lib/platform/backup/create-backup";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const result = createPlatformBackup();
  recordAuditEvent({ action: "backup.create", target: result.dir, metadata: result.manifest });
  return platformJson({ ok: true, backup: result });
}
