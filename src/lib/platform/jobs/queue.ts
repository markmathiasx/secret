import { sanitizeJobPayload } from "@/src/lib/platform/jobs/security";
import { findJobByIdempotencyKey, upsertJob } from "@/src/lib/platform/jobs/store";
import { isPlatformJobType, type PlatformJobType } from "@/src/lib/platform/jobs/types";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";
import { createHash } from "node:crypto";

type EnqueueJobOptions = {
  idempotencyKey?: string;
  lockKey?: string;
  maxAttempts?: number;
};

function createIdempotencyKey(type: string, payload: Record<string, unknown>) {
  return createHash("sha256").update(`${type}:${JSON.stringify(payload)}`).digest("hex");
}

export function enqueueJob(type: string, payload: Record<string, unknown> = {}, options: EnqueueJobOptions = {}) {
  if (!isPlatformJobType(type)) {
    throw new Error("invalid_job_type");
  }

  const sanitizedPayload = sanitizeJobPayload(payload);
  const idempotencyKey = options.idempotencyKey || createIdempotencyKey(type, sanitizedPayload);
  const existing = findJobByIdempotencyKey(idempotencyKey);
  if (existing && existing.status !== "cancelled" && existing.status !== "dead_letter") {
    recordAuditEvent({
      action: "job.deduplicated",
      target: existing.id,
      metadata: { type: existing.type, idempotencyKey },
    });
    return existing;
  }

  const now = new Date().toISOString();
  const job = upsertJob({
    id: crypto.randomUUID(),
    type: type as PlatformJobType,
    status: "queued",
    idempotencyKey,
    lockKey: options.lockKey || type,
    payload: sanitizedPayload,
    attempts: 0,
    maxAttempts: Math.max(1, options.maxAttempts || 3),
    createdAt: now,
    updatedAt: now,
    nextAttemptAt: null,
    history: [{ status: "queued", at: now }],
  });
  recordAuditEvent({
    action: "job.created",
    target: job.id,
    metadata: { type: job.type, idempotencyKey, lockKey: job.lockKey },
  });
  return job;
}
