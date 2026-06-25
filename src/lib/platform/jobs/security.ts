import { sanitizeForLog } from "@/src/lib/platform/security/sanitize";

const forbiddenPayloadKeys = /secret|token|password|authorization|cookie|private/i;

export function sanitizeJobPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(sanitizeForLog(payload) as Record<string, unknown>).filter(([key]) => !forbiddenPayloadKeys.test(key))
  );
}
