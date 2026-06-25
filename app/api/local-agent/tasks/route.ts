import { getNextQueuedJob } from "@/src/lib/platform/jobs/runner";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireLocalAgentAuth } from "@/src/lib/platform/security/local-agent-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireLocalAgentAuth(request);
  if (denied) return denied;
  return platformJson({ ok: true, task: getNextQueuedJob(), productionCallsLocalhost: false });
}
