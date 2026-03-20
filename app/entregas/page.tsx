import Link from "next/link";
import { deliveryZones } from "@/lib/constants";

export default function EntregasPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Frete e prazo</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Envio por CEP com estimativa no carrinho</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          O frete e calculado por CEP com base em peso e dimensoes da embalagem. O prazo estimado aparece antes da
          confirmacao do pedido.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deliveryZones.map((zone) => (
          <article key={zone.region} className="rounded-[24px] border border-[#e8dac7] bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">{zone.region}</h2>
            <p className="mt-2 text-sm text-slate-600">Frete medio: R$ {zone.fee}</p>
            <p className="text-sm text-slate-600">Prazo estimado: {zone.eta}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-[#e8dac7] bg-white p-5 text-sm text-slate-600">
        <p>
          Para detalhes de reversa, devolucao e prazos de estorno, consulte <Link href="/suporte/trocas-devolucoes" className="font-semibold text-slate-800">Trocas e devolucoes</Link>.
        </p>
      </div>
    </section>
  );
}

