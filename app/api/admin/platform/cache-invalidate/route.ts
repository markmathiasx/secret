import { z } from "zod";
import { invalidatePlatformCache } from "@/src/lib/platform/cache/invalidate";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";

const schema = z.object({
  domain: z.string().min(3),
  parts: z.array(z.union([z.string(), z.number(), z.boolean()])).default([]),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return platformJson({ ok: false, error: "invalid_payload" }, { status: 400 });

  const result = await invalidatePlatformCache(parsed.data.domain, parsed.data.parts);
  recordAuditEvent({ action: "cache.invalidate", target: parsed.data.domain, metadata: result });
  return platformJson(result);
}
