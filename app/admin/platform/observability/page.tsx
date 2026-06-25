import { getMetricsReport } from "@/src/lib/platform/observability/metrics";
import { getSloReport } from "@/src/lib/platform/observability/slo";

export const dynamic = "force-dynamic";

export default function AdminPlatformObservabilityPage() {
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify({ metrics: getMetricsReport(), slo: getSloReport() }, null, 2)}</pre>;
}
