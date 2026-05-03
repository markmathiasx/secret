import "server-only";
import { redisSetJson } from "@/lib/redis";

export type StlProcessingJob = {
  id: string;
  fileName: string;
  fileSize: number;
  contentType: string | null;
  quoteId?: string;
  storageUrl?: string | null;
  createdAt: string;
  status: "queued";
};

export async function enqueueStlProcessingJob(job: StlProcessingJob) {
  await redisSetJson(`stl-job:${job.id}`, job, 24 * 60 * 60);
  await redisSetJson(`stl-job-latest:${job.quoteId || job.id}`, job, 24 * 60 * 60);
  return job;
}
