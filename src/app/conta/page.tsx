"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { catalog, featuredCatalog, getProductUrl } from "@/lib/catalog";
import { supabaseBrowser } from "@/lib/supabase/browser";

type FavoriteRow = {
  id: string;
  product_id: string;
  created_at?: string;
};

type QuoteRow = {
  id: string;
  product_id?: string;
  status?: string;
  created_at?: string;
};

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [ready, setReady] = useState(false);

  const favoriteProducts = useMemo(() => {
    return favorites
      .map((item) => catalog.find((product) => product.id === item.product_id))
      .filter(Boolean);
  }, [favorites]);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) {
        setReady(true);
        return;
      }

      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) {
        setReady(true);
        return;
      }

      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        null;

      setName(displayName);
      setEmail(user.email || null);
      await supabaseBrowser.from("profiles").upsert(
        { id: user.id, email: user.email, full_name: displayName },
        { onConflict: "id" }
      );

      const [{ data: favoriteRows }, { data: quoteRows }] = await Promise.all([
        supabaseBrowser
          .from("favorites")
          .select("id, product_id, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(12),
        supabaseBrowser
          .from("quote_requests")
          .select("id, product_id, status, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8)
      ]);

      setFavorites((favoriteRows as FavoriteRow[]) || []);
      setQuotes((quoteRows as QuoteRow[]) || []);
      setReady(true);
    }

    load();
  }, []);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  if (!ready) {
    return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;
  }

  if (!email) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Area do cliente</p>
        <h1 className="mt-3 text-4xl font-black text-white">Sua jornada fica melhor quando voce entra</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Com login voce salva favoritos, acompanha orcamentos e volta para a loja com recomendacoes mais relevantes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
            Entrar com Google
          </Link>
          <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Continuar navegando
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="rounded-[32px] border border-cyan-300/20 bg-cyan-400/10 p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Cliente MDH 3D</p>
        <h1 className="mt-2 text-4xl font-black text-white">Ola, {name || "cliente"}</h1>
        <p className="mt-2 text-white/70">{email}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/55">Favoritos</p>
            <p className="mt-2 text-3xl font-black text-white">{favorites.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/55">Orcamentos</p>
            <p className="mt-2 text-3xl font-black text-white">{quotes.length}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/55">Status da conta</p>
            <p className="mt-2 text-3xl font-black text-white">Ativa</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Favoritos salvos</h2>
          <p className="mt-1 text-sm text-white/60">Sua curadoria pessoal para voltar e fechar mais rapido.</p>
          <div className="mt-5 space-y-3">
            {favoriteProducts.length ? (
              favoriteProducts.map((product) => (
                <Link
                  key={product!.id}
                  href={getProductUrl(product!)}
                  className="block rounded-2xl border border-white/10 bg-black/20 p-4 text-white/80 transition hover:border-cyan-300/25"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{product!.category}</p>
                  <p className="mt-1 font-semibold text-white">{product!.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/65">
                Nenhum favorito salvo ainda. Explore o catalogo e marque as pecas que mais combinam com seu gosto.
              </p>
            )}
          </div>
        </div>

        <div id="orcamentos" className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Orcamentos e pedidos</h2>
          <p className="mt-1 text-sm text-white/60">Historico recente para manter continuidade com a equipe.</p>
          <div className="mt-5 space-y-3">
            {quotes.length ? (
              quotes.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">{item.status || "Recebido"}</p>
                  <p className="mt-1 text-white/55">{item.product_id || "Projeto personalizado"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/65">
                Voce ainda nao enviou orcamento. Abra qualquer produto e clique em pedir orcamento.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold text-white">Recomendacoes para voce</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredCatalog.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={getProductUrl(item)}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35"
            >
              <p className="text-cyan-100">{item.category}</p>
              <p className="mt-1 font-semibold text-white">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white">
          Voltar ao catalogo
        </Link>
        <button onClick={signOut} className="rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm font-semibold text-white">
          Sair
        </button>
      </div>
    </section>
  );
}
