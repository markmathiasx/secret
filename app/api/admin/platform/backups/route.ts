import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const root = path.join(process.cwd(), "data", "platform-backups");
  const backups = existsSync(root)
    ? readdirSync(root)
        .map((name) => ({ name, path: path.join(root, name), createdAt: statSync(path.join(root, name)).mtime.toISOString() }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  return platformJson({ ok: true, backups });
}
