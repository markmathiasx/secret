import type { Metadata } from "next";
import AccountPage from "@/app/conta/page";

export const metadata: Metadata = {
  title: "Perfil | MDH 3D Store",
  description: "Perfil protegido da conta MDH 3D Store.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PerfilPage() {
  return <AccountPage />;
}
