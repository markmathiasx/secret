import type { Metadata } from "next";
import { CheckoutPageShell } from "@/components/checkout/checkout-page-shell";
import { getMercadoPagoPublicKey, getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Checkout",
  description: "Finalize seu pedido na MDH 3D com frete fixo, Pix, cartão e fallback direto por WhatsApp.",
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
