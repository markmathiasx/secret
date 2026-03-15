<<<<<<< ours
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
=======
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const benefits = [
  "Salvar favoritos e coleções preferidas",
  "Acompanhar solicitações de orçamento",
  "Manter histórico de pedidos",
  "Receber sugestões alinhadas ao seu perfil"
];

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  async function oauthGoogle() {
    setError(null);
    if (!supabaseBrowser) {
      setError("Login indisponível no momento. Tente novamente em instantes.");
      return;
    }
    setLoading(true);

    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` }
    });

    if (error) {
      setLoading(false);
      setError("Não foi possível iniciar o login com Google.");
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Acesso MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">Entre para manter sua jornada de compra organizada</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Sua conta libera favoritos sincronizados, histórico e acompanhamento de orçamento sem bloquear a navegação pública.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
              {benefit}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={oauthGoogle} disabled={loading} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70">
            {loading ? "Conectando..." : "Entrar com Google"}
          </button>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
            Continuar como visitante
          </Link>
          <a href={whatsappHref} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100">
            Falar no WhatsApp
          </a>
        </div>

        {error ? <p className="mt-5 text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
>>>>>>> theirs
  );
}
