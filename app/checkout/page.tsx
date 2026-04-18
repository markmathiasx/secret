import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="glass-panel animate-pulse p-6 md:p-7">
              <div className="h-4 w-32 rounded-full bg-white/10" />
              <div className="mt-4 h-10 w-3/4 rounded-[20px] bg-white/10" />
              <div className="mt-6 space-y-3">
                <div className="h-24 rounded-[24px] bg-white/8" />
                <div className="h-24 rounded-[24px] bg-white/8" />
                <div className="h-24 rounded-[24px] bg-white/8" />
              </div>
            </div>
            <div className="glass-panel animate-pulse p-6 md:p-7">
              <div className="h-4 w-40 rounded-full bg-white/10" />
              <div className="mt-5 h-8 w-full rounded-[18px] bg-white/10" />
              <div className="mt-3 h-8 w-5/6 rounded-[18px] bg-white/8" />
              <div className="mt-6 h-52 rounded-[24px] bg-white/8" />
              <div className="mt-6 flex gap-3">
                <div className="h-11 flex-1 rounded-full bg-white/10" />
                <div className="h-11 flex-1 rounded-full bg-white/8" />
              </div>
              <p className="mt-6 text-sm text-white/55">Carregando checkout seguro da loja.</p>
            </div>
          </div>
        </section>
      }
    >
      <CheckoutFlow />
    </Suspense>
  );
}
