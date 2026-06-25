import { getJob } from "@/src/lib/platform/jobs/store";
import { cancelJob, retryJob } from "@/src/lib/platform/jobs/runner";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: Context) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const { id } = await context.params;
  const job = getJob(id);
  return job ? platformJson({ ok: true, job }) : platformJson({ ok: false, error: "job_not_found" }, { status: 404 });
}

export async function POST(request: Request, context: Context) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  if (body.action === "cancel") return platformJson({ ok: true, job: cancelJob(id) });
  if (body.action === "retry") return platformJson({ ok: true, job: retryJob(id) });
  return platformJson({ ok: false, error: "unknown_action" }, { status: 400 });
}
