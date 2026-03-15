import Link from "next/link";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { DeliveryMap } from "@/components/delivery-map";
import { deliveryZones, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const bullets = [
  "Producao propria no RJ",
  "Rotas locais com prazo confirmado",
  "Acompanhamento pelo WhatsApp",
  "Atendimento para urgencias"
] as const;

export default function DeliveryPage() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Entrega MDH 3D</p>
      <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">Frete local e prazos com previsibilidade no Rio de Janeiro</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
        A operacao de entrega prioriza integridade da peca, confirmacao de janela e contato direto com o cliente durante todo o fluxo.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {bullets.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <DeliveryCalculator />
        <DeliveryMap />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {deliveryZones.map((zone) => (
          <div key={zone.region} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">{zone.region}</p>
            <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(zone.fee)}</p>
            <p className="mt-2 text-sm text-white/60">Prazo estimado: {zone.eta}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappHref}
          className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100"
        >
          Confirmar entrega no WhatsApp
        </a>
        <Link
          href="/catalogo"
          className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          Voltar ao catalogo
        </Link>
      </div>
    </section>
  );
}
