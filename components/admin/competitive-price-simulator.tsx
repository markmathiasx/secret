"use client";

import { useMemo, useState } from "react";
import { calculateCompetitivePrice } from "@/lib/competitive-pricing";
import { formatCurrency } from "@/lib/utils";

export function CompetitivePriceSimulator() {
  const [competitor, setCompetitor] = useState(23.9);
  const [cost, setCost] = useState(8);
  const [fee, setFee] = useState(0);

  const calculation = useMemo(() => {
    try {
      return { result: calculateCompetitivePrice({ competitorPrice: competitor, totalCost: cost, discountBrl: 2, channelFeePercent: fee, minimumNetMarginPercent: 30 }), error: "" };
    } catch (error) {
      return { result: null, error: error instanceof Error ? error.message : "Dados inválidos." };
    }
  }, [competitor, cost, fee]);

  return (
    <section className="rounded-[30px] border border-amber-300/20 bg-black/30 p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Simulador competitivo protegido</p>
      <h2 className="mt-2 text-2xl font-black text-white">R$ 2 abaixo, somente quando ainda existe lucro.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">O preço do concorrente é uma referência, não uma ordem. O sistema preserva margem líquida mínima de 30% e considera a taxa do canal.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MoneyField label="Preço concorrente" value={competitor} onChange={setCompetitor} />
        <MoneyField label="Custo total da peça" value={cost} onChange={setCost} />
        <MoneyField label="Taxa do canal (%)" value={fee} onChange={setFee} />
      </div>
      {calculation.error ? <p className="mt-5 rounded-2xl bg-rose-400/10 p-4 text-sm text-rose-100">{calculation.error}</p> : null}
      {calculation.result ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Alvo (- R$ 2)" value={formatCurrency(calculation.result.targetBelowCompetitor)} />
          <Metric label="Piso de margem" value={formatCurrency(calculation.result.profitabilityFloor)} />
          <Metric label="Preço Pix seguro" value={formatCurrency(calculation.result.suggestedPix)} highlight />
          <Metric label="Lucro líquido estimado" value={`${formatCurrency(calculation.result.netProfit)} · ${calculation.result.netMarginPercent.toFixed(1)}%`} />
        </div>
      ) : null}
      {calculation.result?.protectedByMargin ? <p className="mt-4 text-sm text-amber-100">Proteção ativa: ficar R$ 2 abaixo causaria margem insuficiente; o piso seguro prevaleceu.</p> : null}
    </section>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="text-sm text-white/70"><span className="mb-2 block">{label}</span><input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={`rounded-[22px] border p-5 ${highlight ? "border-amber-300/30 bg-amber-300/10" : "border-white/10 bg-white/5"}`}><p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p><p className="mt-3 text-2xl font-black text-white">{value}</p></div>;
}

