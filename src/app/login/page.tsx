import type { Metadata } from "next";
import { PublicLoginPage } from "@/components/public-login-page";

export const metadata: Metadata = {
  title: "Entrar",
  robots: {
    index: false,
    follow: false
  }
};

export default function LoginPage() {
  return <PublicLoginPage />;
}
