"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Mail, MessageSquareShare, Smartphone } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { supportEmail, whatsappMessage, whatsappNumber } from "@/lib/constants";

export function PublicLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const supabaseReady = Boolean(supabaseBrowser);
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  async function oauth(provider: "google" | "apple") {
    setError(null);
    setInfo(null);
    if (!supabaseBrowser) {
      setError("Login social opcional: primeiro preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local.");
      return;
    }

    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback` }
    });
    if (error) setError(error.message);
  }

  async function emailOtp() {
    setError(null);
    setInfo(null);
    if (!supabaseBrowser) {
      setError("Para link por e-mail, configure o Supabase no .env.local.");
      return;
    }
    if (!email.trim()) {
      setError("Digite seu e-mail.");
      return;
    }

    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${origin}/auth/callback` }
    });

    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Se o Supabase estiver configurado, enviamos um link de acesso para seu e-mail.");
  }

  async function phoneOtp() {
    setError(null);
    setInfo(null);
    if (!supabaseBrowser) {
      setError("Para login por telefone/SMS, configure o Supabase no .env.local e um provedor de SMS/WhatsApp no painel.");
      return;
    }
    if (!phone.trim()) {
      setError("Digite seu telefone com DDI. Ex.: +5521999999999");
      return;
    }

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      phone: phone.trim()
    });

    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Se o provedor de telefone estiver configurado, o código OTP foi disparado para esse número.");
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Conta opcional</p>
        <h1 className="mt-3 text-4xl font-black text-white">Entrar</h1>
        <p className="mt-4 text-white/65">
          A loja foi pensada para vender sem exigir conta do cliente. Google, Apple e OTP continuam disponíveis como camada opcional de conveniência quando o Supabase estiver configurado.
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Cliente</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Login opcional</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supabaseReady ? "bg-emerald-400/15 text-emerald-100" : "bg-amber-400/15 text-amber-100"}`}>
              {supabaseReady ? "Supabase detectado" : "Supabase ainda não configurado"}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={() => oauth("google")} className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950">
              Entrar com Google
            </button>
            <button onClick={() => oauth("apple")} className="rounded-full border border-white/10 bg-black/20 px-6 py-3 text-sm font-semibold text-white">
              Entrar com Apple
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3 text-white">
                <Mail className="h-5 w-5 text-cyan-200" />
                <h3 className="font-semibold">Link por e-mail</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">Bom para recorrência futura, sem criar senha na unha.</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="cliente@email.com"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <button onClick={emailOtp} className="mt-4 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                Enviar link
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3 text-white">
                <Smartphone className="h-5 w-5 text-cyan-200" />
                <h3 className="font-semibold">Telefone / OTP</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">Formato recomendado: +5521999999999.</p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+5521999999999"
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <button onClick={phoneOtp} className="mt-4 inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                Enviar código
              </button>
            </div>
          </div>

          {error ? <p className="mt-5 text-sm text-rose-200">{error}</p> : null}
          {info ? <p className="mt-5 text-sm text-emerald-200">{info}</p> : null}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Guest-first</p>
          <h2 className="mt-2 text-2xl font-bold text-white">A compra principal não depende disso</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Se você quer vender amanhã, o fluxo oficial continua sendo catálogo, carrinho, checkout guest, pedido real e acompanhamento por número + e-mail ou WhatsApp.
          </p>

          <div className="mt-6 space-y-4">
            <a href={whatsappHref} className="flex items-center justify-between rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Continuar pelo WhatsApp</p>
                <p className="text-xs text-white/65">Atendimento direto com a loja</p>
              </div>
              <MessageSquareShare className="h-5 w-5" />
            </a>

            <Link href="/catalogo" className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Comprar sem conta</p>
                <p className="text-xs text-white/65">Navegue, adicione ao carrinho e finalize sem criar senha</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link href="/acompanhar-pedido" className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Acompanhar um pedido</p>
                <p className="text-xs text-white/65">Use número do pedido + e-mail ou WhatsApp</p>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/60">
            <p className="font-semibold text-white">Campos do .env.local</p>
            <p className="mt-2 font-mono text-xs text-cyan-100/90">NEXT_PUBLIC_SUPABASE_URL=...</p>
            <p className="font-mono text-xs text-cyan-100/90">NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
            <p className="mt-3">
              Para a conta pública opcional você só precisa das chaves públicas do Supabase. A service role continua restrita ao backend.
            </p>
            <p className="mt-3">Suporte atual da loja: {supportEmail}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
