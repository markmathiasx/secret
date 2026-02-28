import { DeliveryCalculator } from "@/components/delivery-calculator";
import { deliveryKm } from "@/lib/constants";

export default function LogisticsPage() {
  return (
    <section className="space-y-6">
      <DeliveryCalculator adminMode />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/55">Origem da entrega</p>
          <p className="mt-2 text-2xl font-black text-white">{deliveryKm.originLabel}</p>
          <p className="mt-3 text-sm text-white/60">Modelo pensado para saída local de moto CG 160, com ajuste manual se a peça for grande.</p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/55">Frete normal</p>
          <p className="mt-2 text-2xl font-black text-white">base + km</p>
          <p className="mt-3 text-sm text-white/60">Base R$ {deliveryKm.baseFee.toFixed(2)} + R$ {deliveryKm.feePerKm.toFixed(2)} por km, limitado a R$ {deliveryKm.capFee.toFixed(2)}.</p>
        </div>
        <div className="rounded-[32px] border border-cyan-400/20 bg-cyan-400/10 p-6">
          <p className="text-sm text-cyan-100/75">Frete expresso interno</p>
          <p className="mt-2 text-2xl font-black text-cyan-50">2x o normal</p>
          <p className="mt-3 text-sm text-cyan-100/75">No checkout público você pode manter “sob consulta”. Aqui no admin o cálculo aparece para decisão rápida.</p>
        </div>
      </div>
    </section>
  );
}
