import { getCacheHealth } from "@/src/lib/platform/cache/health";
import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getCacheHealth();
  return platformJson({ ok: true, report });
}
