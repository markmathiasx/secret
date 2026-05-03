import type { Metadata } from "next";
import { CartPageShell } from "@/components/cart-page-shell";
import { getSiteUrl, isCardCheckoutConfigured } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise o pedido da MDH 3D, confirme subtotal, frete e siga para checkout com Pix ou atendimento assistido.",
  alternates: {
    canonical: `${siteUrl}/carrinho`,
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

export default function CartPage() {
  return <CartPageShell cardCheckoutReady={isCardCheckoutConfigured()} />;
}
