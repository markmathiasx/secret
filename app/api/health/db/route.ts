import { getDatabaseHealth } from "@/src/lib/platform/db/health";
import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getDatabaseHealth();
  return platformJson({ ok: !report.required || report.status === "ok", report });
}
