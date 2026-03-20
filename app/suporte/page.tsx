import Link from "next/link";

const supportCards = [
  {
    title: "Envio e frete",
    description: "Calculo por CEP, prazo de entrega e rastreio no pos-compra.",
    href: "/suporte/envio",
  },
  {
    title: "Trocas e devolucoes",
    description: "Fluxo de arrependimento em 7 dias e abertura de solicitacao de RMA.",
    href: "/suporte/trocas-devolucoes",
  },
  {
    title: "Garantia",
    description: "Garantia legal, garantia contratual e cobertura por categoria de produto.",
    href: "/suporte/garantia",
  },
  {
    title: "Contato",
    description: "Atendimento comercial e tecnico para PF e B2B.",
    href: "/suporte/contato",
  },
];

export default function SuportePage() {
  return (
    <section className="mx-auto max-w-[1300px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Central de suporte</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Politicas, atendimento e compliance</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Estrutura de suporte para ecommerce no Brasil com foco em transparencia, LGPD e experiencia pos-compra.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {supportCards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[28px] border border-[#e8dac7] bg-white p-5 hover:bg-[#fff8ef]">
            <h2 className="text-2xl font-black text-slate-900">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

