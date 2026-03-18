'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { featuredCatalog, findProduct, getProductUrl } from '@/lib/catalog';
import { supabaseBrowser } from '@/lib/supabase/browser';

type Item = { id: string; product_id?: string; status?: string; created_at?: string };

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [quotes, setQuotes] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

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

      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || null;
      setName(displayName);
      setEmail(user.email || null);

      await supabaseBrowser.from('profiles').upsert({ id: user.id, email: user.email, full_name: displayName }, { onConflict: 'id' });

      const [{ data: favoriteRows }, { data: quoteRows }] = await Promise.all([
        supabaseBrowser.from('favorites').select('id, product_id, created_at').order('created_at', { ascending: false }).limit(12),
        supabaseBrowser.from('quote_requests').select('id, product_id, status, created_at').order('created_at', { ascending: false }).limit(8)
      ]);

      setFavorites((favoriteRows as Item[]) || []);
      setQuotes((quoteRows as Item[]) || []);
      setReady(true);
    }

    load();
  }, []);

  const favoriteProducts = useMemo(() => favorites.map((item) => findProduct(item.product_id || '')).filter(Boolean), [favorites]);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = '/';
  }

  if (!ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!email) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-black text-white">Minha conta</h1>
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar orçamentos e acessar o histórico da sua jornada.</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">
          Entrar agora
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Área do cliente</p>
        <h1 className="mt-3 text-4xl font-black text-white">Olá, {name || 'cliente'}</h1>
        <p className="mt-2 text-white/65">{email}</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="glass-panel p-6">
          <h2 className="text-2xl font-bold text-white">Favoritos salvos</h2>
          <p className="mt-1 text-sm text-white/60">{favorites.length} item(ns) salvo(s)</p>
          <div className="mt-4 grid gap-3">
            {favoriteProducts.length ? favoriteProducts.map((item) => (
              <Link key={item!.id} href={getProductUrl(item!)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35">
                <p className="text-cyan-100">{item!.category}</p>
                <p className="mt-1 font-semibold text-white">{item!.name}</p>
              </Link>
            )) : <p className="text-sm text-white/70">Nenhum favorito salvo ainda. Explore o catálogo e marque suas peças preferidas.</p>}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-2xl font-bold text-white">Orçamentos e pedidos</h2>
          <p className="mt-1 text-sm text-white/60">{quotes.length} solicitação(ões) recente(s)</p>
          <div className="mt-4 grid gap-3">
            {quotes.length ? quotes.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                <p className="font-semibold text-white">{item.status || 'recebido'}</p>
                <p className="mt-1 text-white/60">{item.product_id || 'Pedido personalizado'}</p>
              </div>
            )) : <p className="text-sm text-white/70">Você ainda não enviou orçamento. Clique em “Pedir orçamento” em qualquer produto.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel p-6">
        <h3 className="text-xl font-semibold text-white">Recomendações para você</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featuredCatalog.slice(0, 3).map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35">
              <p className="text-cyan-100">{item.category}</p>
              <p className="mt-1 font-semibold text-white">{item.name}</p>
            </Link>
          ))}
        </div>

        <button type="button" onClick={signOut} className="btn-ghost-sm mt-6">
          Sair da conta
        </button>
      </div>
    </section>
  );
}
