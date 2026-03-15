"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { featuredCatalog, findProduct, getProductUrl } from "@/lib/catalog";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { featuredCatalog, getProductUrl } from "@/lib/catalog";

type Item = { id: string; product_id?: string; status?: string; created_at?: string };
<<<<<<< ours

type FavoriteRow = { id: string; product_id: string; created_at?: string };
type QuoteRow = { id: string; product_id?: string; status?: string; created_at?: string };
=======
>>>>>>> theirs

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
<<<<<<< ours
<<<<<<< ours
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
=======
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
>>>>>>> theirs
=======
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
>>>>>>> theirs
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabaseBrowser) {
        setReady(true);
<<<<<<< ours
<<<<<<< ours
        return;
      }

      const {
        data: { user }
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        setReady(true);
        return;
      }
=======
=======
>>>>>>> theirs
        return;
      }
      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      if (!user) {
        setReady(true);
        return;
      }
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs

      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || null;
      setName(displayName);
      setEmail(user.email || null);
<<<<<<< ours
<<<<<<< ours

      await supabaseBrowser
        .from("profiles")
        .upsert({ id: user.id, email: user.email, full_name: displayName }, { onConflict: "id" });

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
=======
=======
>>>>>>> theirs
      await supabaseBrowser.from("profiles").upsert({ id: user.id, email: user.email, full_name: displayName }, { onConflict: "id" });

      const [{ data: favoriteRows }, { data: quoteRows }] = await Promise.all([
        supabaseBrowser.from("favorites").select("id, product_id, created_at").order("created_at", { ascending: false }).limit(12),
        supabaseBrowser.from("quote_requests").select("id, status, created_at").order("created_at", { ascending: false }).limit(8)
      ]);

      setFavorites((favoriteRows as Item[]) || []);
      setQuotes((quoteRows as Item[]) || []);
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
      setReady(true);
    }

    load();
  }, []);

  const favoriteProducts = useMemo(
    () => favorites.map((item) => findProduct(item.product_id)).filter(Boolean),
    [favorites]
  );

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

<<<<<<< ours
<<<<<<< ours
  if (!ready) {
    return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;
  }
=======
  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;
>>>>>>> theirs
=======
  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;
>>>>>>> theirs

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
<<<<<<< ours
<<<<<<< ours
        <p className="mt-4 text-white/70">
          Entre com Google para salvar favoritos, acompanhar orcamentos e acessar o historico da sua jornada.
        </p>
=======
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
>>>>>>> theirs
=======
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
>>>>>>> theirs
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Entrar com Google
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
<<<<<<< ours
<<<<<<< ours
      <div className="rounded-[32px] border border-cyan-300/20 bg-cyan-400/10 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Area do cliente</p>
        <h1 className="mt-3 text-4xl font-black text-white">Ola, {name || "cliente"}</h1>
        <p className="mt-2 text-white/65">{email}</p>
      </div>
=======
      <h1 className="text-4xl font-black text-white">Olá, {name || "cliente"}</h1>
      <p className="mt-2 text-white/65">{email}</p>
>>>>>>> theirs
=======
      <h1 className="text-4xl font-black text-white">Olá, {name || "cliente"}</h1>
      <p className="mt-2 text-white/65">{email}</p>
>>>>>>> theirs

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Favoritos salvos</h2>
          <p className="mt-1 text-sm text-white/60">{favorites.length} item(ns) salvo(s)</p>
<<<<<<< ours
<<<<<<< ours
          <div className="mt-4 grid gap-3">
            {favoriteProducts.length ? (
              favoriteProducts.map((item) => (
                <Link
                  key={item!.id}
                  href={getProductUrl(item!)}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35"
                >
                  <p className="text-cyan-100">{item!.category}</p>
                  <p className="mt-1 font-semibold text-white">{item!.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/70">Nenhum favorito salvo ainda. Explore o catalogo e marque suas pecas preferidas.</p>
            )}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Orcamentos e pedidos</h2>
          <p className="mt-1 text-sm text-white/60">{quotes.length} solicitacao(oes) recente(s)</p>
          <div className="mt-4 grid gap-3">
            {quotes.length ? (
              quotes.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">{item.status || "recebido"}</p>
                  <p className="mt-1 text-white/60">{item.product_id || "Pedido personalizado"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/70">Voce ainda nao enviou orcamento. Clique em "Pedir orcamento" em qualquer produto.</p>
            )}
          </div>
=======
=======
>>>>>>> theirs
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {favorites.length ? favorites.map((item) => <li key={item.id}>• {item.product_id}</li>) : <li>Nenhum favorito salvo ainda. Explore o catálogo e marque suas peças preferidas.</li>}
          </ul>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Orçamentos e pedidos</h2>
          <p className="mt-1 text-sm text-white/60">{quotes.length} solicitação(ões) recente(s)</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {quotes.length ? quotes.map((item) => <li key={item.id}>• {item.status || "recebido"}</li>) : <li>Você ainda não enviou orçamento. Clique em “Pedir orçamento” em qualquer produto.</li>}
          </ul>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6">
<<<<<<< ours
<<<<<<< ours
        <h3 className="text-xl font-semibold text-white">Recomendacoes para voce</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredCatalog.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              href={getProductUrl(item)}
              className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35"
            >
=======
=======
>>>>>>> theirs
        <h3 className="text-xl font-semibold text-white">Recomendações para você</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredCatalog.slice(0, 3).map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35">
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
              <p className="text-cyan-100">{item.category}</p>
              <p className="mt-1 font-semibold text-white">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-[30px] border border-white/10 bg-white/5 p-6">
<<<<<<< ours
<<<<<<< ours
        <h3 className="text-xl font-semibold text-white">Atalhos da conta</h3>
        <p className="mt-2 text-sm text-white/65">
          Enderecos salvos, historico completo e preferncias podem crescer aqui conforme novos pedidos forem registrados.
        </p>
        <button onClick={signOut} className="mt-5 rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm font-semibold text-white">
          Sair
        </button>
=======
        <h3 className="text-xl font-semibold text-white">Perfil e retenção</h3>
        <p className="mt-2 text-sm text-white/65">Endereços salvos e histórico completo serão exibidos automaticamente conforme novos pedidos forem registrados.</p>
        <button onClick={signOut} className="mt-5 rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm font-semibold text-white">Sair</button>
>>>>>>> theirs
=======
        <h3 className="text-xl font-semibold text-white">Perfil e retenção</h3>
        <p className="mt-2 text-sm text-white/65">Endereços salvos e histórico completo serão exibidos automaticamente conforme novos pedidos forem registrados.</p>
        <button onClick={signOut} className="mt-5 rounded-full border border-white/15 bg-black/25 px-6 py-3 text-sm font-semibold text-white">Sair</button>
>>>>>>> theirs
      </div>
    </section>
  );
}
