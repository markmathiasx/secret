import { listJobs } from "@/src/lib/platform/jobs/store";

export const dynamic = "force-dynamic";

export default function AdminPlatformJobsPage() {
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify({ jobs: listJobs() }, null, 2)}</pre>;
}
