import type { PlatformJob } from "@/src/lib/platform/jobs/types";

const deadLetters: PlatformJob[] = [];

export function moveToDeadLetter(job: PlatformJob) {
  const moved = { ...job, status: "dead_letter" as const, updatedAt: new Date().toISOString() };
  deadLetters.push(moved);
  return moved;
}

export function getDeadLetterJobs() {
  return [...deadLetters];
}
