import { getJob, upsertJob } from "@/src/lib/platform/jobs/store";
import { moveToDeadLetter } from "@/src/lib/platform/jobs/dead-letter";
import { getJobRetryDelayMs, shouldRetryJob } from "@/src/lib/platform/jobs/retry-policy";
import { sanitizeForLog } from "@/src/lib/platform/security/sanitize";

export function completeJob(id: string, result: Record<string, unknown>) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  const now = new Date().toISOString();
  return upsertJob({
    ...job,
    status: "completed",
    result: sanitizeForLog(result) as Record<string, unknown>,
    updatedAt: now,
    nextAttemptAt: null,
    history: [...(job.history || []), { status: "completed", at: now }],
  });
}

export function failJob(id: string, error: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  const now = new Date().toISOString();
  const attempts = job.attempts + 1;
  const retryAllowed = shouldRetryJob(attempts, job.maxAttempts);
  const failedJob = upsertJob({
    ...job,
    status: retryAllowed ? "failed" : "dead_letter",
    error: error.slice(0, 240),
    attempts,
    updatedAt: now,
    nextAttemptAt: retryAllowed ? new Date(Date.now() + getJobRetryDelayMs(attempts)).toISOString() : null,
    history: [...(job.history || []), { status: retryAllowed ? "failed" : "dead_letter", at: now, error: error.slice(0, 240) }],
  });
  if (!retryAllowed) {
    return moveToDeadLetter(failedJob);
  }
  return failedJob;
}
