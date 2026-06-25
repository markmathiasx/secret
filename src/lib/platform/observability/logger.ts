import { redactSecrets } from "@/src/lib/platform/security/secrets";
import { sanitizeForLog } from "@/src/lib/platform/security/sanitize";

export type PlatformLogLevel = "info" | "warn" | "error";

export function logPlatform(level: PlatformLogLevel, event: string, data: Record<string, unknown> = {}) {
  const payload = redactSecrets(sanitizeForLog({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...data,
  }));
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}
