import { incrementMetric } from "@/src/lib/platform/observability/metrics";
import { logPlatform } from "@/src/lib/platform/observability/logger";

export function recordPlatformEvent(event: string, data: Record<string, unknown> = {}) {
  incrementMetric(event);
  logPlatform("info", event, data);
}
