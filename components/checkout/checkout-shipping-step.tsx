"use client";

import { MapPin } from "lucide-react";
import { formatCep, type ShippingOption } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";

export function CheckoutShippingStep({
  activeAddress,
  productionWindow,
  shippingOptions,
  selectedShippingId,
  shippingLoading,
  shippingError,
  onRecalculate,
  onSelectShipping,
  onBack,
  onContinue,
}: {
  activeAddress: {
    recipientName: string;
    line1: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  productionWindow: string;
  shippingOptions: ShippingOption[];
  selectedShippingId: "standard" | "express";
  shippingLoading: boolean;
  shippingError: string;
  onRecalculate: () => void;
  onSelectShipping: (value: "standard" | "express") => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Destino</p>
        <div className="mt-3 flex items-start gap-3 rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
          <MapPin className="mt-1 h-5 w-5 text-cyan-100" />
          <div>
            <p className="font-semibold text-white">{activeAddress.recipientName}</p>
            <p>{activeAddress.line1}</p>
            <p>
              {activeAddress.neighborhood} • {activeAddress.city} - {activeAddress.state}
            </p>
            <p>CEP {formatCep(activeAddress.zipCode)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Opções de envio</p>
            <p className="mt-1 text-sm text-white/68">A cotação usa sua região no Rio e o peso estimado da peça.</p>
          </div>
          <button type="button" onClick={onRecalculate} className="btn-glass" disabled={shippingLoading}>
            {shippingLoading ? "Atualizando..." : "Recalcular"}
          </button>
        </div>

        {shippingError ? <p className="mt-4 text-sm text-rose-200">{shippingError}</p> : null}

        <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
          <p className="text-xs uppercase tracking-[0.16em] text-white/45">Prazo de produção deste item</p>
          <p className="mt-2 font-semibold text-white">{productionWindow}</p>
          <p className="mt-2 text-white/55">O prazo final combina produção + envio e fica claro antes da confirmação.</p>
        </div>

        <div className="mt-4 grid gap-3">
          {shippingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectShipping(option.id)}
              className={`rounded-[22px] border p-4 text-left transition ${
                selectedShippingId === option.id ? "border-cyan-300/35 bg-cyan-300/12" : "border-white/10 bg-black/20 hover:border-white/20"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{option.title}</p>
                  <p className="mt-1 text-sm text-white/68">{option.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">{formatCurrency(option.price)}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{option.eta}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-white/55">{option.region}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">
          Voltar
        </button>
        <button type="button" onClick={onContinue} className="btn-primary">
          Continuar para pagamento
        </button>
      </div>
    </div>
  );
}
