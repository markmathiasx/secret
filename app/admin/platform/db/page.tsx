import { getDatabaseHealth } from "@/src/lib/platform/db/health";

export const dynamic = "force-dynamic";

export default async function AdminPlatformDbPage() {
  const health = await getDatabaseHealth();
  return <pre className="overflow-auto rounded-lg bg-slate-950 p-5 text-xs text-cyan-50">{JSON.stringify(health, null, 2)}</pre>;
}
