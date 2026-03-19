'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { featuredCatalog, findProduct, getProductUrl } from '@/lib/catalog';
import { emitCustomerAuthChange, fetchCustomerSession, useCustomerSession } from '@/lib/customer-session-client';
import { getDisplayName, getMemberKey, listFavorites, listSavedQuotes, type SavedQuote } from '@/lib/member-store';
import { formatCurrency } from '@/lib/utils';

type AccountState = {
  ready: boolean;
  loggedIn: boolean;
  name: string;
  email: string | null;
  favorites: string[];
  quotes: SavedQuote[];
  orders: Array<{
    id: string;
    order_code: string;
    product_name: string;
    payment_method: string;
    payment_status: string | null;
    payment_reference: string | null;
    quantity: number;
    total_pix: number | null;
    total_card: number | null;
    status: string;
    created_at: string;
  }>;
};

export default function AccountPage() {
  const router = useRouter();
  const session = useCustomerSession();
  const [account, setAccount] = useState<AccountState>({
    ready: false,
    loggedIn: false,
    name: 'cliente',
    email: null,
    favorites: [],
    quotes: [],
    orders: []
  });

  useEffect(() => {
    if (!session.ready) return;

    async function load() {
      const key = getMemberKey({ id: session.user?.id, email: session.user?.email });
      let orders: AccountState['orders'] = [];

      if (session.loggedIn) {
        const response = await fetch('/api/account/orders', { cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        orders = response.ok && Array.isArray(data?.orders) ? data.orders : [];
      }

      setAccount({
        ready: true,
        loggedIn: session.loggedIn,
        name: getDisplayName({
          email: session.user?.email || null,
          fullName: session.user?.displayName || null
        }),
        email: session.user?.email || null,
        favorites: listFavorites(key),
        quotes: listSavedQuotes(key),
        orders
      });
    }

    void load();

    function onStoreChange() {
      void load();
    }

    window.addEventListener('mdh:member-store', onStoreChange);
    return () => {
      window.removeEventListener('mdh:member-store', onStoreChange);
    };
  }, [session.loggedIn, session.ready, session.user?.displayName, session.user?.email, session.user?.id]);

  const favoriteProducts = useMemo(() => account.favorites.map((item) => findProduct(item)).filter(Boolean), [account.favorites]);

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' });
    await fetchCustomerSession();
    emitCustomerAuthChange();
    router.replace('/');
    router.refresh();
  }

  if (!account.ready) return <section className="mx-auto max-w-5xl px-6 py-20 text-white/70">Carregando sua conta...</section>;

  if (!account.loggedIn) {
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
        <h1 className="mt-3 text-4xl font-black text-white">Olá, {account.name}</h1>
        <p className="mt-2 text-white/65">{account.email}</p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="glass-panel p-6">
          <h2 className="text-2xl font-bold text-white">Favoritos salvos</h2>
          <p className="mt-1 text-sm text-white/60">{account.favorites.length} item(ns) salvo(s)</p>
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
          <h2 className="text-2xl font-bold text-white">Pedidos recentes</h2>
          <p className="mt-1 text-sm text-white/60">{account.orders.length} pedido(s) encontrado(s)</p>
          <div className="mt-4 grid gap-3">
            {account.orders.length ? account.orders.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{item.product_name}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/55">{item.status}</span>
                </div>
                <p className="mt-1 text-white/60">Código {item.order_code}</p>
                <p className="mt-1 text-white/60">Pagamento {item.payment_method} • {item.payment_status || "sem atualização"} • Quantidade {item.quantity}</p>
                <p className="mt-2 text-cyan-100">
                  {item.payment_method === 'cartao' ? formatCurrency(Number(item.total_card || 0)) : formatCurrency(Number(item.total_pix || 0))}
                </p>
              </div>
            )) : <p className="text-sm text-white/70">Você ainda não tem pedido com este email. Quando comprar pelo checkout, o histórico aparece aqui.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-panel p-6">
        <h3 className="text-xl font-semibold text-white">Orçamentos salvos no navegador</h3>
        <p className="mt-1 text-sm text-white/60">{account.quotes.length} solicitação(ões) recente(s)</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {account.quotes.length ? account.quotes.slice(0, 8).map((item) => (
            <div key={item.quoteId} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">
              <p className="font-semibold text-white">{item.productName}</p>
              <p className="mt-1 text-white/60">Código {item.quoteId}</p>
            </div>
          )) : <p className="text-sm text-white/70">Você ainda não enviou orçamento. Clique em “Pedir orçamento” em qualquer produto.</p>}
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
