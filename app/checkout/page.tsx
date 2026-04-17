import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CheckoutPage() {
  return (
    <Suspense fallback={<section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando checkout...</section>}>
      <CheckoutFlow />
    </Suspense>
  );
}
