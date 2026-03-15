"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
type Summary = {
  name: string;
  favorites: number;
  quotes: number;
};

export function HomePersonalized() {
  const [summary, setSummary] = useState<Summary | null>(null);
=======
export function HomePersonalized() {
  const [name, setName] = useState<string | null>(null);
>>>>>>> theirs
=======
export function HomePersonalized() {
  const [name, setName] = useState<string | null>(null);
>>>>>>> theirs
=======
export function HomePersonalized() {
  const [name, setName] = useState<string | null>(null);
>>>>>>> theirs
=======
export function HomePersonalized() {
  const [name, setName] = useState<string | null>(null);
>>>>>>> theirs

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) return;
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) return;

      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Cliente";

      const [{ count: favoriteCount }, { count: quoteCount }] = await Promise.all([
        supabaseBrowser
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabaseBrowser
          .from("quote_requests")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
      ]);

      setSummary({
        name: String(displayName),
        favorites: favoriteCount || 0,
        quotes: quoteCount || 0
      });
    }

    load();
  }, []);

  if (!summary) return null;
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) return;
      const display = user.user_metadata?.full_name || user.email || "Cliente";
      setName(String(display));
    }
    load();
  }, []);

  if (!name) return null;
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10">
      <div className="rounded-[30px] border border-cyan-300/25 bg-cyan-400/10 p-6">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Experiencia de cliente</p>
        <h2 className="mt-2 text-2xl font-black text-white">Ola, {summary.name.split("@")[0]}</h2>
        <p className="mt-3 text-sm text-white/75">
          Seu login libera atalhos de conta, favoritos sincronizados e acompanhamento dos orcamentos enviados.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Link href="/conta" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-4 text-sm font-semibold text-white">
            Minha conta
          </Link>
          <Link href="/conta#favoritos" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-4 text-sm font-semibold text-white">
            Favoritos salvos: {summary.favorites}
          </Link>
          <Link href="/conta#orcamentos" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-4 text-sm font-semibold text-white">
            Orcamentos enviados: {summary.quotes}
          </Link>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Área personalizada</p>
        <h2 className="mt-2 text-2xl font-black text-white">Olá, {name.split("@")[0]} 👋</h2>
        <p className="mt-3 text-sm text-white/75">Atalhos rápidos para sua conta, histórico de pedidos e produtos favoritos.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link href="/conta" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Minha conta</Link>
          <Link href="/catalogo" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Favoritos (em breve)</Link>
          <Link href="/conta" className="rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm font-semibold text-white">Histórico de pedidos (em breve)</Link>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
        </div>
      </div>
    </section>
  );
}
