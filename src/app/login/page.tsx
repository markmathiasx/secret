import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublicLoginPage } from "@/components/public-login-page";
import { getCurrentCustomerSession, sanitizeCustomerRedirectPath } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Entrar ou cadastrar",
  robots: {
    index: false,
    follow: false
  }
};

type LoginPageProps = {
  searchParams: Promise<{
    mode?: string;
    next?: string;
    logout?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const currentSession = await getCurrentCustomerSession();
  const redirectTo = sanitizeCustomerRedirectPath(params.next);

  if (currentSession) {
    redirect(redirectTo);
  }

  return (
    <PublicLoginPage
      initialMode={params.mode === "register" ? "register" : "login"}
      redirectTo={redirectTo}
      loggedOut={params.logout === "1"}
    />
  );
}
