import { routeAiChatMessage } from "@/src/lib/ai-chat/router";
import { buildLeadFromMessage } from "@/src/lib/ai-chat/lead-capture";
import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData().catch(() => new FormData())).entries());
  const message = body.message || body.content || "";
  const response = await routeAiChatMessage(message);
  return platformJson({ ...response, lead: buildLeadFromMessage(String(message)) });
}
