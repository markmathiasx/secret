import Link from "next/link";
import { buttonFamilies } from "@/components/ui/buttons";

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
      <div className="premium-panel mb-8 overflow-hidden rounded-[36px] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black text-white">{title}</h1>
            {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">{description}</p> : null}
          </div>

          <div className="premium-card rounded-[28px] bg-black/20 px-5 py-4 text-sm text-white/70">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Sessão</div>
            <div className="mt-2 font-semibold text-white">{email}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin" className={buttonFamilies.secondary}>
            Dashboard
          </Link>
          <Link href="/admin/pedidos" className={buttonFamilies.secondary}>
            Pedidos
          </Link>
          <Link href="/admin/novo-pedido" className={buttonFamilies.secondary}>
            Novo pedido manual
          </Link>
          <a href="/api/health" target="_blank" rel="noreferrer" className={buttonFamilies.primaryPix}>
            Health
          </a>
          <form action="/api/admin/logout" method="post">
            <button className={buttonFamilies.danger}>
              Sair
            </button>
          </form>
        </div>
      </div>

      {children}
    </section>
  );
}
