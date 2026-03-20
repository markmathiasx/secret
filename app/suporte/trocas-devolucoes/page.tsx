import Link from "next/link";

export default function SuporteTrocasPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <h1 className="text-3xl font-black text-slate-900">Trocas e devolucoes</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Compras online contam com direito de arrependimento em ate 7 dias corridos apos o recebimento, respeitando
          condicoes de devolucao previstas em lei.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-slate-700">
          <li>1. Solicitar devolucao na area de suporte ou por atendimento.</li>
          <li>2. Receber orientacao de postagem/logistica reversa.</li>
          <li>3. Analise de recebimento e conformidade.</li>
          <li>4. Reembolso conforme meio de pagamento original.</li>
        </ol>
        <p className="mt-4 text-sm text-slate-600">
          Itens personalizados podem seguir regra especifica quando houver aprovacao formal de briefing antes da
          producao.
        </p>
        <div className="mt-5">
          <Link href="/suporte" className="rounded-full border border-[#e5d4be] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            Voltar para suporte
          </Link>
        </div>
      </div>
    </section>
  );
}

