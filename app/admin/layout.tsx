import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] p-6 shadow-[0_28px_80px_rgba(2,8,23,0.32)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
          <h1 className="mt-2 text-2xl font-black text-white">Painel administrativo</h1>
          <p className="mt-2 text-sm text-white/60">Catálogo, imagens reais, fila de produção e operação comercial em tempo real.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-2 text-sm font-semibold text-cyan-100">Operação</Link>
          <Link href="/admin/finance" className="rounded-full border border-white/10 bg-black/20 px-5 py-2 text-sm font-semibold text-white">Financeiro</Link>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-black/20 px-5 py-2 text-sm font-semibold text-white">Ver loja</Link>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-2 text-sm font-semibold text-rose-100">Sair</button>
          </form>
        </div>
      </div>

      {children}
    </div>
  );
}
