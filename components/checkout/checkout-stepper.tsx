"use client";

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
  return (
    <div className="flex flex-wrap items-center gap-3">
      {CHECKOUT_STEPS.map((step, index) => {
        const active = index === currentStep;
        const done = index < currentStep || (index === 3 && orderCreated);

        return (
          <button
            key={step}
            type="button"
            onClick={() => {
              if (index <= currentStep) onSelect(index);
            }}
            className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                : done
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50"
                  : "border-white/10 bg-white/5 text-white/55"
            }`}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs">
              {index + 1}
            </span>
            {step}
          </button>
        );
      })}
    </div>
  );
}
