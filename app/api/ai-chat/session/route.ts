import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export function GET() {
  return platformJson({
    ok: true,
    sessionId: crypto.randomUUID(),
    mode: "fallback_instant",
    localOperatorCriticalPath: false,
  });
}
