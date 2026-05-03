import type { Metadata } from "next";
import { CheckoutPageShell } from "@/components/checkout/checkout-page-shell";
import { getMercadoPagoPublicKey, getSiteUrl, isCardCheckoutConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = getSiteUrl();
const cardCheckoutReady = isCardCheckoutConfigured();

export const metadata: Metadata = {
  title: "Checkout",
  description: cardCheckoutReady
    ? "Finalize seu pedido na MDH 3D com frete, Pix, cartão online e atendimento direto por WhatsApp."
    : "Finalize seu pedido na MDH 3D com frete, Pix e atendimento direto por WhatsApp.",
  alternates: {
    canonical: `${siteUrl}/checkout`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function CheckoutPage() {
  return <CheckoutPageShell publicKey={getMercadoPagoPublicKey()} />;
}
