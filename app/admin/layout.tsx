import Link from "next/link";

const adminLinkGroups = [
  {
    title: "Operação",
    links: [
      ["/admin", "Cockpit"],
      ["/admin/orders", "Pedidos"],
      ["/admin/inventory", "Estoque"],
      ["/admin/finance", "Financeiro"],
      ["/admin/analytics", "Analytics"],
    ],
  },
  {
    title: "Catálogo e Atendimento",
    links: [
      ["/admin/products", "Produtos"],
      ["/admin/inbox", "Inbox"],
      ["/admin/support", "Suporte"],
      ["/admin/quotes", "Orçamentos"],
      ["/admin/storage", "Arquivos"],
    ],
  },
  {
    title: "IA e Governança",
    links: [
      ["/admin/ai-operator", "Copiloto"],
      ["/admin/platform", "Plataforma"],
      ["/admin/audit", "Auditoria"],
      ["/admin/users", "Usuários"],
      ["/admin/settings", "Config."],
    ],
  },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] p-6 shadow-[0_28px_80px_rgba(2,8,23,0.32)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
          <h1 className="mt-2 text-2xl font-black text-white">Painel administrativo</h1>
          <p className="mt-2 text-sm text-white/60">Domínios comerciais, produção, IA e governança sem abrir mão de auditoria e confirmação reforçada.</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {adminLinkGroups.map((group) => (
            <div key={group.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{group.title}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.links.map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      href === "/admin" ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 text-white"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Sessão</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Ver loja
              </Link>
              <form action="/api/admin/logout" method="post">
                <button className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100">
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
