"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Heart, History, MessageSquareShare } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabaseReady = Boolean(supabaseBrowser);
  const whatsappHref = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  async function signInWithGoogle() {
    setError(null);

    if (!supabaseBrowser) {
      setError("O login com Google será liberado assim que a autenticação estiver conectada.");
      return;
    }

    setLoading(true);
    const origin = window.location.origin;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Conta MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Entre para acompanhar favoritos, orçamentos e pedidos.</h1>
        <p className="mt-4 text-base leading-8 text-white/68">
          O catálogo continua aberto para visitantes, mas a conta deixa a experiência mais pessoal e organizada para quem volta com frequência.
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Acesso</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Entrar com Google</h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${supabaseReady ? "bg-emerald-400/15 text-emerald-100" : "bg-amber-400/15 text-amber-100"}`}>
              {supabaseReady ? "Login ativo" : "Modo visitante ativo"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/62">
            Use sua conta Google para acessar uma área mais pessoal da loja sem criar senha nova.
          </p>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="mt-6 rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.01] disabled:opacity-70"
          >
            {loading ? "Conectando..." : "Entrar com Google"}
          </button>

          {error ? <p className="mt-4 text-sm text-amber-100">{error}</p> : null}

          <div className="mt-8 rounded-[26px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Não quer entrar agora?</p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Continue navegando como visitante e use o WhatsApp sempre que quiser fechar um pedido mais rápido.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Continuar como visitante
              </Link>
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/30 bg-emerald-300/12 px-4 py-2 text-sm font-semibold text-emerald-100">
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-violet-200">O que muda ao entrar</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Uma camada mais pessoal sem poluir a loja.</h2>

          <div className="mt-6 space-y-4">
            {[
              {
                icon: Heart,
                title: "Favoritos",
                text: "Salve peças que você quer comparar antes de fechar o pedido."
              },
              {
                icon: History,
                title: "Histórico",
                text: "Acompanhe os próximos passos de orçamentos e pedidos conforme o fluxo evolui."
              },
              {
                icon: MessageSquareShare,
                title: "Atalhos de conta",
                text: "Reencontre rápido seus canais de compra, suporte e itens vistos recentemente."
              }
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>

          <Link href="/conta" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100">
            Ver página da conta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
