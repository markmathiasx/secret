import { z } from "zod";
import { enqueueJob } from "@/src/lib/platform/jobs/queue";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

const schema = z.object({
  type: z.string(),
  payload: z.record(z.unknown()).default({}),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return platformJson({ ok: false, error: "invalid_payload" }, { status: 400 });
  try {
    return platformJson({ ok: true, job: enqueueJob(parsed.data.type, parsed.data.payload) }, { status: 201 });
  } catch {
    return platformJson({ ok: false, error: "invalid_job_type" }, { status: 400 });
  }
}
