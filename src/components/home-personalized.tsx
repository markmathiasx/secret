"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function HomePersonalized() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) return;
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) return;
      const display = user.user_metadata?.full_name || user.email || "Cliente";
      setName(String(display));
    }
    load();
  }, []);

  if (!name) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <div className="rounded-[30px] border border-cyan-300/25 bg-cyan-400/10 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Área personalizada</p>
        <h2 className="mt-2 text-2xl font-black text-white">Olá, {name.split("@")[0]} 👋</h2>
        <p className="mt-3 text-sm text-white/75">Atalhos rápidos para sua conta, histórico de pedidos e produtos favoritos.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link href="/conta" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Minha conta</Link>
          <Link href="/catalogo" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Favoritos (em breve)</Link>
          <Link href="/conta" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Histórico de pedidos (em breve)</Link>
        </div>
      </div>
    </section>
  );
}
