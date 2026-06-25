import { sanitizeText } from "@/src/lib/platform/security/sanitize";

export function buildLeadFromMessage(message: string) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    summary: sanitizeText(message, 300),
    channel: "site-ai-chat",
  };
}
