import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Carrinho",
  robots: {
    index: false,
    follow: false
  }
};

export default function CartRoutePage() {
  return <CartPage />;
}
