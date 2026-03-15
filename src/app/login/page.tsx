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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      setError("Login indisponível no momento. Tente novamente em instantes.");
=======
      setError("Login social opcional: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no .env.local.");
>>>>>>> theirs
=======
      setError("Login social opcional: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no .env.local.");
>>>>>>> theirs
=======
      setError("Login social opcional: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no .env.local.");
>>>>>>> theirs
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

<<<<<<< ours
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
=======
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Fallback seguro</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Se ainda não configurou login social</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Você pode operar a loja normalmente sem Google, Apple ou SMS. O essencial aqui é catálogo, orçamento, frete, checkout e atendimento humano.
          </p>

          <div className="mt-6 space-y-4">
            <a href={whatsappHref} className="flex items-center justify-between rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Continuar pelo WhatsApp</p>
                <p className="text-xs text-white/65">Atendimento direto com você ou seu bot</p>
              </div>
              <MessageSquareShare className="h-5 w-5" />
            </a>

            <Link href="/catalogo" className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Continuar sem conta</p>
                <p className="text-xs text-white/65">O cliente já consegue navegar, pedir orçamento e fechar pedido</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            <p className="font-semibold text-white">Campos do .env.local</p>
            <p className="mt-2 font-mono text-xs text-cyan-100/90">NEXT_PUBLIC_SUPABASE_URL=...</p>
            <p className="font-mono text-xs text-cyan-100/90">NEXT_PUBLIC_SUPABASE_ANON_KEY=... (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)</p>
            <p className="font-mono text-xs text-cyan-100/90">SUPABASE_SERVICE_ROLE_KEY=... (ou SUPABASE_SECRET_KEY)</p>
            <p className="mt-3">Suporte atual da loja: {supportEmail}</p>
          </div>
>>>>>>> theirs
        </div>

        {error ? <p className="mt-5 text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
  );
}
