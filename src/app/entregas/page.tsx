import { DeliveryCalculator } from "@/components/delivery-calculator";
import { deliveryZones } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Frete e prazo</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
        Operação inicial local no Rio de Janeiro, com entrega própria por moto ou carro. Aqui o cliente calcula o frete estimado por CEP e recebe prazo normal de 1 a 3 dias úteis.
      </p>

      <div className="mt-8">
        <DeliveryCalculator />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {deliveryZones.map((zone) => (
          <div key={zone.region} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">{zone.region}</p>
            <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(zone.fee)}</p>
            <p className="mt-2 text-sm text-white/60">Prazo normal: {zone.eta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
