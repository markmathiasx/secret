import { getLivenessReport } from "@/src/lib/platform/health/liveness";
import { platformJson } from "@/src/lib/platform/http/response";

export const dynamic = "force-dynamic";

export function GET() {
  return platformJson(getLivenessReport());
}
