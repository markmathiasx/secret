import { z } from "zod";
import { completeJob, failJob } from "@/src/lib/platform/jobs/result";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireLocalAgentAuth } from "@/src/lib/platform/security/local-agent-auth";

const schema = z.object({
  ok: z.boolean(),
  result: z.record(z.unknown()).default({}),
  error: z.string().optional(),
});

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const denied = requireLocalAgentAuth(request);
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return platformJson({ ok: false, error: "invalid_payload" }, { status: 400 });
  const { id } = await context.params;
  const job = parsed.data.ok ? completeJob(id, parsed.data.result) : failJob(id, parsed.data.error || "local_agent_failed");
  return platformJson({ ok: true, job });
}
