import type { Metadata } from "next";
import { CartPageShell } from "@/components/cart-page-shell";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Revise o pedido da MDH 3D, confirme subtotal, frete fixo e siga para checkout com Pix ou cartão.",
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
  return <CartPageShell />;
}
