import { getJob, upsertJob } from "@/src/lib/platform/jobs/store";
import { sanitizeForLog } from "@/src/lib/platform/security/sanitize";

export function completeJob(id: string, result: Record<string, unknown>) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  return upsertJob({
    ...job,
    status: "completed",
    result: sanitizeForLog(result) as Record<string, unknown>,
    updatedAt: new Date().toISOString(),
  });
}

export function failJob(id: string, error: string) {
  const job = getJob(id);
  if (!job) throw new Error("job_not_found");
  return upsertJob({
    ...job,
    status: "failed",
    error: error.slice(0, 240),
    attempts: job.attempts + 1,
    updatedAt: new Date().toISOString(),
  });
}
