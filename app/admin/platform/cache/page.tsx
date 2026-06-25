import { getCacheHealth } from "@/src/lib/platform/cache/health";
import { getCacheMetrics } from "@/src/lib/platform/cache/metrics";

export const dynamic = "force-dynamic";

export default async function AdminPlatformCachePage() {
  const health = await getCacheHealth();
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify({ health, metrics: getCacheMetrics() }, null, 2)}</pre>;
}
