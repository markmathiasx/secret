import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { PlatformJob } from "@/src/lib/platform/jobs/types";

const memoryJobs = new Map<string, PlatformJob>();
const jsonStorePath = path.join(process.cwd(), "reports", "industrial", "jobs-store.json");

function canUseJsonStore() {
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}

function loadJsonJobs() {
  if (!canUseJsonStore() || !existsSync(jsonStorePath)) return [];
  try {
    return JSON.parse(readFileSync(jsonStorePath, "utf8")) as PlatformJob[];
  } catch {
    return [];
  }
}

function persistJsonJobs(jobs: PlatformJob[]) {
  if (!canUseJsonStore()) return;
  mkdirSync(path.dirname(jsonStorePath), { recursive: true });
  writeFileSync(jsonStorePath, `${JSON.stringify(jobs, null, 2)}\n`, "utf8");
}

export function upsertJob(job: PlatformJob) {
  memoryJobs.set(job.id, job);
  const jobs = loadJsonJobs().filter((item) => item.id !== job.id);
  jobs.push(job);
  persistJsonJobs(jobs);
  return job;
}

export function listJobs() {
  const fromJson = loadJsonJobs();
  const merged = new Map<string, PlatformJob>();
  fromJson.forEach((job) => merged.set(job.id, job));
  memoryJobs.forEach((job) => merged.set(job.id, job));
  return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getJob(id: string) {
  return listJobs().find((job) => job.id === id) || null;
}

export function findJobByIdempotencyKey(idempotencyKey: string) {
  return listJobs().find((job) => job.idempotencyKey === idempotencyKey) || null;
}

export function findRunningJobByLock(lockKey: string, excludeId?: string) {
  return (
    listJobs().find((job) => job.lockKey === lockKey && job.status === "running" && (!excludeId || job.id !== excludeId)) ||
    null
  );
}
