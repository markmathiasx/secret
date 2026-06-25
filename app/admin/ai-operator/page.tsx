import { getAdminAiOperatorReport } from "@/src/lib/admin-ai/operator";

export const dynamic = "force-dynamic";

export default async function AdminAiOperatorPage() {
  const report = await getAdminAiOperatorReport();
  return (
    <main className="rounded-[16px] border border-white/10 bg-slate-950/80 p-6 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Admin AI Operator</p>
      <h2 className="mt-2 text-2xl font-black">Operador industrial protegido</h2>
      <p className="mt-2 text-sm text-white/60">Auditoria, jobs e propostas sem deploy direto, sem push na main e sem secrets no payload.</p>
      <pre className="mt-6 overflow-auto rounded-lg bg-black/40 p-4 text-xs text-cyan-50">{JSON.stringify(report, null, 2)}</pre>
    </main>
  );
}
