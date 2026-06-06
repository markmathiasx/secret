import type { Metadata } from "next";
import AccountPage from "@/app/conta/page";

export const metadata: Metadata = {
  title: "Pedidos | MDH 3D Store",
  description: "Pedidos protegidos da conta MDH 3D Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PedidosPage() {
  return <AccountPage />;
}
