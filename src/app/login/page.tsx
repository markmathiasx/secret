"use client";

import Link from "next/link";
<<<<<<< ours
import { useState } from "react";
import { MessageCircleMore, ShieldCheck, UserRound } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const hasSupabase = Boolean(supabaseBrowser);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  async function handleGoogleLogin() {
    if (!supabaseBrowser) {
      setMessage("Login social indisponivel no momento. Continue como visitante ou feche pelo WhatsApp.");
=======
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
<<<<<<< ours
<<<<<<< ours
      setError("Login indisponível no momento. Tente novamente em instantes.");
>>>>>>> theirs
=======
      setError("Login social opcional: preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) no .env.local.");
>>>>>>> theirs
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

<<<<<<< ours
    setLoading(true);
    setMessage("");
=======
      setError("Login indisponível no momento. Tente novamente em instantes.");
      return;
    }
    setLoading(true);
>>>>>>> theirs

    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
<<<<<<< ours
      options: {
        redirectTo: `${origin}/auth/callback`
      }
=======
    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` }
>>>>>>> theirs
=======
      options: { redirectTo: `${origin}/auth/callback` }
>>>>>>> theirs
    });

    if (error) {
      setLoading(false);
<<<<<<< ours
<<<<<<< ours
      setMessage("Nao foi possivel iniciar o login com Google agora.");
=======
      setError("Não foi possível iniciar o login com Google.");
>>>>>>> theirs
=======
      setError("Não foi possível iniciar o login com Google.");
>>>>>>> theirs
    }
  }

  return (
<<<<<<< ours
<<<<<<< ours
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
        <div className="rounded-[36px] border border-white/10 bg-card p-7 md:p-9">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Conta</p>
          <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
            Entre para salvar favoritos e acompanhar seu historico sem tornar o login um bloqueio da loja.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
            O storefront continua navegavel sem Supabase. Quando a integracao estiver configurada, voce ganha experiencia
            personalizada com favoritos, pedidos e atalhos.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Favoritos sincronizados",
              "Historico de orcamentos",
              "Retorno rapido para novas compras"
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/75">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Acesso</p>
              <h2 className="text-2xl font-black text-white">Login social opcional</h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/65">
            {hasSupabase
              ? "Supabase detectado. O botao abaixo inicia o login com Google."
              : "Supabase nao esta configurado. O visitante ainda consegue navegar, pedir orcamento e fechar pelo WhatsApp."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 disabled:opacity-70"
            >
              {loading ? "Conectando..." : "Entrar com Google"}
            </button>
            <Link
              href="/catalogo"
              className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white"
            >
              Continuar como visitante
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-6 py-3 text-sm font-semibold text-emerald-100"
            >
              <MessageCircleMore className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>

          {message ? (
            <p className="mt-4 text-sm text-amber-200">{message}</p>
          ) : null}

          <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-200" />
            <p className="text-sm leading-7 text-white/65">
              Nenhuma chave server-side e exposta no cliente. Sem credencial real, a pagina continua funcional e honesta.
            </p>
          </div>
=======
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
=======
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

>>>>>>> theirs
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
<<<<<<< ours
>>>>>>> theirs
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
=======
>>>>>>> theirs
        </div>

        {error ? <p className="mt-5 text-sm text-rose-200">{error}</p> : null}
      </div>
    </section>
  );
}
