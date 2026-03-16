"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock3, Heart, LayoutDashboard, PackageSearch, Star } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type ViewerState =
  | { ready: false; name: null; loggedIn: false }
  | { ready: true; name: null; loggedIn: false }
  | { ready: true; name: string; loggedIn: true };

function getFriendlyName(email?: string | null, fullName?: string | null) {
  if (fullName?.trim()) return fullName.trim().split(" ")[0];
  if (email?.trim()) return email.split("@")[0];
  return "cliente";
}

export function HomePersonalized() {
  const [viewer, setViewer] = useState<ViewerState>({ ready: false, name: null, loggedIn: false });

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabaseBrowser) {
        if (active) setViewer({ ready: true, name: null, loggedIn: false });
        return;
      }

      const { data } = await supabaseBrowser.auth.getUser();
      if (!active) return;

      if (!data.user) {
        setViewer({ ready: true, name: null, loggedIn: false });
        return;
      }

      const metadata = data.user.user_metadata as { full_name?: string } | undefined;
      setViewer({
        ready: true,
        name: getFriendlyName(data.user.email, metadata?.full_name || null),
        loggedIn: true
      });
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  if (!viewer.ready) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="h-32 rounded-[32px] border border-white/10 bg-white/5" />
      </section>
    );
  }

  if (!viewer.loggedIn) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Experiencia publica</p>
            <h2 className="mt-2 text-2xl font-black text-white">Loja aberta para navegar, comparar e pedir orcamento.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/66">
              Veja a vitrine completa, confira prazo, fale pelo WhatsApp e avance no seu ritmo sem criar conta antes da hora.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Star, title: "Mais vendidos", text: "Selecao enxuta com foco em conversao." },
              { icon: PackageSearch, title: "Prazo claro", text: "Lead time e material exibidos ja no card." },
              { icon: LayoutDashboard, title: "Conta opcional", text: "Login entra como camada extra, nao como barreira." }
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="rounded-[32px] border border-cyan-300/18 bg-[linear-gradient(135deg,rgba(23,37,84,0.7),rgba(8,15,33,0.88))] p-6 shadow-[0_24px_80px_rgba(8,145,178,0.12)]">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Area personalizada</p>
            <h2 className="mt-2 text-2xl font-black text-white">Bem-vindo de volta, {viewer.name}.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Sua conta libera uma camada mais pessoal da loja com atalhos para acompanhamento, favoritos e proximos orcamentos.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/conta" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950">
                Minha conta
              </Link>
              <Link href="/catalogo" className="rounded-full border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white">
                Continuar comprando
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Heart, title: "Favoritos", text: "Salve itens para fechar depois com mais calma." },
              { icon: Clock3, title: "Historico", text: "Acompanhe orcamentos e pedidos assim que forem registrados." },
              { icon: LayoutDashboard, title: "Atalhos", text: "Conta, canais de compra e suporte em um so lugar." }
            ].map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
