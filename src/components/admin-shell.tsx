import Link from "next/link";

type AdminShellProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  email: string;
  children: React.ReactNode;
};

export function AdminShell({ title, eyebrow = "Operação MDH 3D", description, email, children }: AdminShellProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.28)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
            {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{description}</p> : null}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/70">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Sessão</div>
            <div className="mt-2 font-semibold text-white">{email}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
            Dashboard
          </Link>
          <Link href="/admin/pedidos" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
            Pedidos
          </Link>
          <Link href="/admin/novo-pedido" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
            Novo pedido manual
          </Link>
          <a href="/api/health" target="_blank" rel="noreferrer" className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50">
            Health
          </a>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300/50">
              Sair
            </button>
          </form>
        </div>
      </div>

      {children}
    </section>
  );
}
