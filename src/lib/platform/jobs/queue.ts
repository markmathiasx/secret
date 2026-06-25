import { sanitizeJobPayload } from "@/src/lib/platform/jobs/security";
import { upsertJob } from "@/src/lib/platform/jobs/store";
import { isPlatformJobType, type PlatformJobType } from "@/src/lib/platform/jobs/types";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";

export function enqueueJob(type: string, payload: Record<string, unknown> = {}) {
  if (!isPlatformJobType(type)) {
    throw new Error("invalid_job_type");
  }

  const now = new Date().toISOString();
  const job = upsertJob({
    id: crypto.randomUUID(),
    type: type as PlatformJobType,
    status: "queued",
    payload: sanitizeJobPayload(payload),
    attempts: 0,
    maxAttempts: 3,
    createdAt: now,
    updatedAt: now,
  });
  recordAuditEvent({ action: "job.created", target: job.id, metadata: { type: job.type } });
  return job;
}
