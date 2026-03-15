import Link from "next/link";

export default function AdminHome() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Financeiro</h2>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Controle de gastos, custos, receitas e lucro com gráficos por dia, semana, mês e ano.
        </p>
        <Link href="/admin/finance" className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950">
          Abrir financeiro
        </Link>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Checklist rápido</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/65">
          <li>Definir ADMIN_PASSWORD</li>
          <li>Validar mídia institucional da vitrine</li>
          <li>Ativar login social (Supabase) quando quiser</li>
          <li>Revisar preços e zonas de entrega</li>
        </ul>
      </div>
    </section>
  );
}
