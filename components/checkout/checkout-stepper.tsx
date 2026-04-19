"use client";

import type { CSSProperties } from "react";
import { CHECKOUT_STEPS } from "@/lib/checkout-client";

export function CheckoutStepper({
  currentStep,
  orderCreated,
  onSelect,
}: {
  currentStep: number;
  orderCreated: boolean;
  onSelect: (index: number) => void;
}) {
  const progress = Math.min(100, Math.max(0, orderCreated ? 100 : ((currentStep + 1) / CHECKOUT_STEPS.length) * 100));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/45">
        <span>Checkout guiado</span>
        <span>~2 min para concluir</span>
      </div>

      <div className="checkout-stepper-track h-2" style={{ ["--checkout-progress" as any]: progress / 100 } as CSSProperties}>
        <div className="h-full w-full" />
      </div>

      <div className="flex flex-wrap items-center gap-3" role="tablist" aria-label="Etapas do checkout">
        {CHECKOUT_STEPS.map((step, index) => {
          const active = index === currentStep;
          const done = index < currentStep || (index === 3 && orderCreated);
          const status = done ? "✓" : index === currentStep ? "•" : String(index + 1).padStart(2, "0");

          return (
            <button
              key={step}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`${step} — ${active ? "etapa atual" : done ? "concluída" : "pendente"}`}
              onClick={() => {
                if (index <= currentStep) onSelect(index);
              }}
              className={`tab-button min-w-[10.5rem] justify-start px-4 py-3 text-left text-sm font-semibold transition ${
                active
                  ? "active"
                  : done
                    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50"
                    : "border-white/10 bg-white/5 text-white/55"
              }`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs font-black">
                {status}
              </span>
              <span className="flex flex-col leading-tight">
                <span>{step}</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
                  {active ? "etapa atual" : done ? "concluída" : "pendente"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
