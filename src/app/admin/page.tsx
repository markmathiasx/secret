import Link from "next/link";

const checklist = [
  "Definir ADMIN_PASSWORD e ADMIN_SESSION_TOKEN antes de publicar.",
  "Validar a midia institucional da home e da secao de producao.",
  "Revisar faixas de preco e zonas de entrega.",
  "Confirmar a configuracao do login social quando quiser ativar personalizacao completa."
] as const;

export default function AdminHome() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Financeiro</h2>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Controle de gastos, custos, receitas e lucro com leitura por dia, semana, mes e ano.
        </p>
        <Link
          href="/admin/finance"
          className="mt-6 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950"
        >
          Abrir financeiro
        </Link>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Checklist rapido</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/65">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
