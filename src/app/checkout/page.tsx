import type { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutRoutePage() {
  return <CheckoutPage cardEnabled={Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN)} />;
}
