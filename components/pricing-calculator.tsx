"use client";

import { useMemo, useState } from "react";
import { calculateBaseCost, calculateSalePrice, type PaymentMethod, type SalesChannel } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export function PricingCalculator() {
  const [grams, setGrams] = useState(110);
  const [hours, setHours] = useState(4.1);
  const [complexity, setComplexity] = useState(1.08);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [channel, setChannel] = useState<SalesChannel>("site");

  const result = useMemo(() => {
    const cost = calculateBaseCost(grams, hours, complexity);
    const price = calculateSalePrice(grams, hours, complexity, paymentMethod, channel);
    return {
      cost,
      price,
      profit: Number((price - cost).toFixed(2))
    };
  }, [grams, hours, complexity, paymentMethod, channel]);

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Calculadora MDH</p>
        <h2 className="mt-2 text-2xl font-bold text-white">Preço justo com margem de erro e lucro alvo</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Fórmula pensada para PLA a R$ 100/kg, desperdício, embalagem, energia, manutenção e 20% de reserva de falha.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm text-white/70">
          <span className="mb-2 block">Peso em gramas</span>
          <input type="number" value={grams} onChange={(e) => setGrams(Number(e.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0" />
        </label>
        <label className="text-sm text-white/70">
          <span className="mb-2 block">Horas de impressão</span>
          <input type="number" step="0.1" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0" />
        </label>
        <label className="text-sm text-white/70">
          <span className="mb-2 block">Complexidade</span>
          <input type="number" step="0.01" value={complexity} onChange={(e) => setComplexity(Number(e.target.value))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none ring-0" />
        </label>
        <label className="text-sm text-white/70">
          <span className="mb-2 block">Pagamento</span>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            <option value="pix">Pix</option>
            <option value="cartao">Cartão</option>
            <option value="boleto">Boleto</option>
          </select>
        </label>
        <label className="text-sm text-white/70">
          <span className="mb-2 block">Canal</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value as SalesChannel)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            <option value="site">Site</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="mercadolivre">Mercado Livre</option>
            <option value="shopee">Shopee</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-white/50">Custo ajustado</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(result.cost)}</p>
        </div>
        <div className="rounded-[24px] border border-cyan-400/15 bg-cyan-400/10 p-5">
          <p className="text-sm text-cyan-100/70">Preço sugerido</p>
          <p className="mt-2 text-3xl font-bold text-cyan-100">{formatCurrency(result.price)}</p>
        </div>
        <div className="rounded-[24px] border border-violet-400/15 bg-violet-400/10 p-5">
          <p className="text-sm text-violet-100/70">Margem nominal</p>
          <p className="mt-2 text-3xl font-bold text-violet-100">{formatCurrency(result.profit)}</p>
        </div>
      </div>
    </section>
  );
}
