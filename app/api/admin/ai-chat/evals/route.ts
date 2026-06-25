import { evaluateAiChatSafety } from "@/src/lib/ai-chat/evaluation";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;
  return platformJson({ ok: true, evals: [await evaluateAiChatSafety()] });
}
