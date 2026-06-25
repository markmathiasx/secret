import { getJob, listJobs, upsertJob } from "@/src/lib/platform/jobs/store";
import { completeJob } from "@/src/lib/platform/jobs/result";

export function getNextQueuedJob() {
  return listJobs().find((job) => job.status === "queued") || null;
}

export function cancelJob(id: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  return upsertJob({ ...job, status: "cancelled", updatedAt: new Date().toISOString() });
}

export function retryJob(id: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  return upsertJob({ ...job, status: "queued", updatedAt: new Date().toISOString(), error: undefined });
}

export function runJobDry(jobId: string) {
  const job = getJob(jobId);
  if (!job) throw new Error("job_not_found");
  return completeJob(job.id, { mode: "dry-run", message: "Job runner scaffold executed without mutating production." });
}
