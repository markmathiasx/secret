import Link from "next/link";

const tiers = [
  {
    name: "Silver",
    rule: "Compras recorrentes mensais",
    benefits: ["Tabela diferenciada", "Prioridade de estoque", "Atendimento dedicado"],
  },
  {
    name: "Gold",
    rule: "Volume alto e previsao trimestral",
    benefits: ["Desconto adicional", "Kits personalizados", "SLA comercial estendido"],
  },
  {
    name: "Platinum",
    rule: "Operacao de assistencia/farm",
    benefits: ["Conta-chave", "Acordo de reposicao", "Exportacao CSV e apoio de planejamento"],
  },
];

export default function B2BPage() {
  return (
    <section className="mx-auto max-w-[1300px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Area B2B</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Repair shops, oficinas e microproducao</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Cadastro com aprovacao, politica comercial por nivel e fluxo para compra recorrente.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{tier.name}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{tier.rule}</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {tier.benefits.map((benefit) => (
                <li key={benefit}>• {benefit}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[30px] border border-[#e8dac7] bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900">Fluxo operacional B2B</h2>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li>1. Cadastro com CNPJ e contato tecnico.</li>
          <li>2. Validacao comercial e definicao de tier.</li>
          <li>3. Liberacao de tabela e condicoes de pagamento.</li>
          <li>4. Pedidos recorrentes com exportacao CSV de compras e catalogo.</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/suporte/contato" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Solicitar cadastro B2B
          </Link>
          <Link href="/catalogo" className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            Ver catalogo tecnico
          </Link>
        </div>
      </div>
    </section>
  );
}

