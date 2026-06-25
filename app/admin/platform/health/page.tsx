import { getDeepHealthReport } from "@/src/lib/platform/health/deep";

export const dynamic = "force-dynamic";

export default async function AdminPlatformHealthPage() {
  const report = await getDeepHealthReport();
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify(report, null, 2)}</pre>;
}
