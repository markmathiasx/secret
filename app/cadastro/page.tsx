import type { Metadata } from "next";
import LoginPage from "@/app/login/page";

export const metadata: Metadata = {
  title: "Cadastro | MDH 3D Store",
  description: "Crie sua conta para acompanhar pedidos, orcamentos e historico na MDH 3D Store.",
  alternates: {
    canonical: "/cadastro",
  },
};

export default function CadastroPage() {
  return <LoginPage initialMode="register" />;
}
