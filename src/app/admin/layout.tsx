import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
          <h1 className="mt-2 text-2xl font-black text-white">Admin</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full border border-white/10 bg-black/20 px-5 py-2 text-sm font-semibold text-white">Visão geral</Link>
          <Link href="/admin/finance" className="rounded-full border border-white/10 bg-black/20 px-5 py-2 text-sm font-semibold text-white">Financeiro</Link>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-2 text-sm font-semibold text-rose-100">Sair</button>
          </form>
        </div>
      </div>

      {children}
    </div>
  );
}
