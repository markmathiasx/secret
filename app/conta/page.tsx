'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Heart,
  History,
  ReceiptText,
  Sparkles,
  WalletCards,
} from 'lucide-react';
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

const RECENT_KEY = 'mdh_catalog_recent';

function readRecentIds() {
  if (typeof window === 'undefined') return [] as string[];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function formatOrderStatus(status: string | null | undefined) {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('pix')) return 'Aguardando Pix';
  if (normalized.includes('cartao')) return 'Aguardando cartão';
  if (normalized.includes('checkout')) return 'Checkout iniciado';
  if (normalized.includes('produc')) return 'Em produção';
  if (normalized.includes('entreg')) return 'Em entrega';
  return status || 'Em análise';
}

function resolveProductUrl(productId: string) {
  const product = findProduct(productId);
  return product ? getProductUrl(product) : '/catalogo';
}

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
  const [recentIds, setRecentIds] = useState<string[]>([]);

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
      setRecentIds(readRecentIds());
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
  const recentProducts = useMemo(() => recentIds.map((item) => findProduct(item)).filter(Boolean), [recentIds]);
  const lastQuote = account.quotes[0] || null;
  const stats = [
    { label: 'Favoritos', value: String(account.favorites.length).padStart(2, '0') },
    { label: 'Pedidos', value: String(account.orders.length).padStart(2, '0') },
    { label: 'Orçamentos', value: String(account.quotes.length).padStart(2, '0') },
    { label: 'Recentes', value: String(recentProducts.length).padStart(2, '0') },
  ];
  const recommendedProducts = useMemo(() => {
    const favoriteCategories = Array.from(new Set(favoriteProducts.map((item) => item!.category)));
    return featuredCatalog
      .filter((item) => !account.favorites.includes(item.id))
      .sort((a, b) => Number(favoriteCategories.includes(b.category)) - Number(favoriteCategories.includes(a.category)))
      .slice(0, 4);
  }, [account.favorites, favoriteProducts]);
  const journeyLinks = useMemo(() => {
    const sources = [...favoriteProducts, ...recentProducts]
      .filter(Boolean)
      .map((item) => item!.category)
      .filter(Boolean);
    return Array.from(new Set(sources)).slice(0, 4);
  }, [favoriteProducts, recentProducts]);

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
        <p className="mt-4 text-white/70">Faça login para salvar favoritos, acompanhar pedidos e manter seu histórico com a MDH 3D organizado.</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">
          Entrar na minha conta
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
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/catalogo" className="btn-secondary">Voltar ao catálogo</Link>
          <Link href="/imagem-para-impressao-3d" className="btn-secondary">Enviar referência</Link>
          {lastQuote ? <Link href={`/checkout?product=${lastQuote.productId}`} className="btn-primary">Continuar pedido</Link> : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="surface-stat rounded-[22px] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{item.label}</p>
              <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-cyan-100">
            <ReceiptText className="h-4 w-4" />
            <p className="text-sm font-semibold">Continue de onde parou</p>
          </div>
          {lastQuote ? (
            <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Último orçamento</p>
              <h2 className="mt-2 text-2xl font-black text-white">{lastQuote.productName}</h2>
              <p className="mt-2 text-sm leading-7 text-white/66">
                Código {lastQuote.quoteId} • {formatCurrency(lastQuote.totalPix)} • {lastQuote.paymentMethod}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/checkout?product=${lastQuote.productId}`} className="btn-primary">
                  Abrir checkout
                </Link>
                <Link href="/checkout" className="btn-glass">
                  Revisar pagamento
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-white/66">
              Quando você enviar um orçamento ou iniciar um pedido, o ponto de retomada aparece aqui.
            </p>
          )}

          <div className="mt-5 grid gap-3">
            {[
              { label: 'Abrir checkout', href: '/checkout', icon: WalletCards },
              { label: 'Explorar pronta entrega', href: '/catalogo?status=Pronta%20entrega', icon: Sparkles },
              { label: 'Mandar nova referência', href: '/imagem-para-impressao-3d', icon: ArrowRight },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 transition hover:border-cyan-300/30">
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-cyan-100" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {journeyLinks.length ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Reentradas rápidas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {journeyLinks.map((item) => (
                  <Link key={item} href={`/catalogo?category=${encodeURIComponent(item)}&mode=all`} className="chip-nav">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-2 text-cyan-100">
            <History className="h-4 w-4" />
            <p className="text-sm font-semibold">Itens vistos recentemente</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {recentProducts.length ? recentProducts.slice(0, 6).map((item) => (
              <Link key={item!.id} href={getProductUrl(item!)} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/80 transition hover:border-cyan-300/35">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">{item!.category}</p>
                <p className="mt-2 font-semibold text-white">{item!.name}</p>
                <p className="mt-2 text-white/60">{formatCurrency(item!.pricePix)} • {item!.productionWindow}</p>
              </Link>
            )) : <p className="text-sm text-white/70">Os itens que você abrir no catálogo aparecem aqui para retomada rápida.</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div id="favoritos" className="glass-panel p-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Heart className="h-5 w-5 text-cyan-100" />
            Favoritos salvos
          </h2>
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
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/55">{formatOrderStatus(item.status)}</span>
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
              <p className="mt-1 text-white/60">{formatCurrency(item.totalPix)} • {item.paymentMethod}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/checkout?product=${item.productId}`} className="btn-secondary px-4 py-2 text-xs">
                  Continuar
                </Link>
                <Link href={resolveProductUrl(item.productId)} className="btn-glass px-4 py-2 text-xs">
                  Ver item
                </Link>
              </div>
            </div>
          )) : <p className="text-sm text-white/70">Você ainda não enviou orçamento. Clique em “Pedir orçamento” em qualquer produto.</p>}
          </div>
        </div>

      <div className="mt-6 glass-panel p-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
          <Sparkles className="h-5 w-5 text-cyan-100" />
          Recomendações para você
        </h3>
        <p className="mt-1 text-sm text-white/60">A seleção abaixo tenta aproveitar o que você já curtiu ou abriu recentemente.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/80 hover:border-cyan-300/35">
              <p className="text-cyan-100">{item.category}</p>
              <p className="mt-1 font-semibold text-white">{item.name}</p>
              <p className="mt-2 text-white/60">{formatCurrency(item.pricePix)} • {item.productionWindow}</p>
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
