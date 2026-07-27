import { findRunningJobByLock, getJob, listJobs, upsertJob } from "@/src/lib/platform/jobs/store";
import { completeJob, failJob } from "@/src/lib/platform/jobs/result";

export function getNextQueuedJob() {
  const now = Date.now();
  return (
    listJobs().find(
      (job) => job.status === "queued" && (!job.nextAttemptAt || new Date(job.nextAttemptAt).getTime() <= now)
    ) || null
  );
}

export function cancelJob(id: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  const now = new Date().toISOString();
  return upsertJob({
    ...job,
    status: "cancelled",
    updatedAt: now,
    nextAttemptAt: null,
    history: [...(job.history || []), { status: "cancelled", at: now }],
  });
}

export function retryJob(id: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  const now = new Date().toISOString();
  return upsertJob({
    ...job,
    status: "queued",
    updatedAt: now,
    nextAttemptAt: null,
    error: undefined,
    history: [...(job.history || []), { status: "queued", at: now }],
  });
}

function markJobRunning(id: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  const lockOwner = findRunningJobByLock(job.lockKey, job.id);
  if (lockOwner) {
    throw new Error(`job_lock_conflict:${lockOwner.id}`);
  }

  const now = new Date().toISOString();
  return upsertJob({
    ...job,
    status: "running",
    updatedAt: now,
    nextAttemptAt: null,
    history: [...(job.history || []), { status: "running", at: now }],
  });
}

export function runJobDry(jobId: string) {
  markJobRunning(jobId);
  try {
    return completeJob(jobId, {
      mode: "dry-run",
      message: "Job runner scaffold executed without mutating production.",
    });
  } catch (error) {
    return failJob(jobId, error instanceof Error ? error.message : "job_runner_failed");
  }
}
