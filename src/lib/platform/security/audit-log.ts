import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { sanitizeForLog } from "@/src/lib/platform/security/sanitize";

export type AuditEvent = {
  action: string;
  actor?: string;
  target?: string;
  metadata?: Record<string, unknown>;
};

export function recordAuditEvent(event: AuditEvent) {
  const payload = {
    ...event,
    metadata: sanitizeForLog(event.metadata || {}),
    timestamp: new Date().toISOString(),
  };

  console.info(JSON.stringify({ level: "info", event: "admin.action", ...payload }));

  if (process.env.VERCEL) return;

  const file = path.join(process.cwd(), "reports", "industrial", "audit-log.jsonl");
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(payload)}\n`, "utf8");
}
