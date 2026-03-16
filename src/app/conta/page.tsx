"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, History, LogOut, Sparkles } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { catalog, featuredCatalog, getProductUrl } from "@/lib/catalog";
import { getDisplayName, getMemberKey, listFavorites, listSavedQuotes, type SavedQuote } from "@/lib/member-store";
import { getPrimaryProductImage } from "@/lib/product-media";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { formatCurrency } from "@/lib/utils";

type AccountState = {
  ready: boolean;
  loggedIn: boolean;
  name: string;
  email: string | null;
  phone: string | null;
  favorites: string[];
  quotes: SavedQuote[];
};

export default function AccountPage() {
  const [account, setAccount] = useState<AccountState>({
    ready: false,
    loggedIn: false,
    name: "cliente",
    email: null,
    phone: null,
    favorites: [],
    quotes: []
  });

  useEffect(() => {
    let active = true;

    async function load() {
      const fallbackKey = getMemberKey();

      if (!supabaseBrowser) {
        if (!active) return;
        setAccount({
          ready: true,
          loggedIn: false,
          name: "cliente",
          email: null,
          phone: null,
          favorites: listFavorites(fallbackKey),
          quotes: listSavedQuotes(fallbackKey)
        });
        return;
      }

      const { data } = await supabaseBrowser.auth.getUser();
      const user = data.user;
      const key = getMemberKey({ id: user?.id, email: user?.email, phone: user?.phone });

      if (!active) return;
      setAccount({
        ready: true,
        loggedIn: Boolean(user),
        name: getDisplayName({
          email: user?.email,
          phone: user?.phone,
          fullName: typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null
        }),
        email: user?.email || null,
        phone: user?.phone || null,
        favorites: listFavorites(key),
        quotes: listSavedQuotes(key)
      });
    }

    void load();

    const authSubscription = supabaseBrowser?.auth.onAuthStateChange(() => {
      void load();
    });

    function onStoreChange() {
      void load();
    }

    window.addEventListener("mdh:member-store", onStoreChange);

    return () => {
      active = false;
      authSubscription?.data.subscription.unsubscribe();
      window.removeEventListener("mdh:member-store", onStoreChange);
    };
  }, []);

  const favoriteProducts = useMemo(
    () => catalog.filter((product) => account.favorites.includes(product.id)).slice(0, 4),
    [account.favorites]
  );

  const recommendedProducts = useMemo(() => {
    if (!favoriteProducts.length) return featuredCatalog.slice(0, 4);

    const favoriteCategories = new Set(favoriteProducts.map((item) => item.category));
    return catalog
      .filter((product) => favoriteCategories.has(product.category) && !account.favorites.includes(product.id))
      .slice(0, 4);
  }, [account.favorites, favoriteProducts]);

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  if (!account.ready) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white">Carregando sua área do cliente...</div>
      </section>
    );
  }

  if (!account.loggedIn) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Área do cliente</p>
        <h1 className="mt-3 text-4xl font-black text-white">Entre para destravar favoritos, histórico e atalhos pessoais.</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm leading-7 text-white/68">
              A vitrine continua aberta para quem visita, mas a conta deixa a navegação mais útil para quem volta com frequência para comparar peças ou retomar um orçamento.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { title: "Favoritos", text: "Salve peças para comparar com calma." },
                { title: "Orçamentos", text: "Reencontre rapidamente os pedidos enviados." },
                { title: "Recomendações", text: "Receba uma curadoria mais próxima do que você já viu." }
              ].map((item) => (
                <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.text}</p>
                </div>
              ))}
            </div>

            <Link href="/login" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
              Entrar com Google
            </Link>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Enquanto isso</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Você ainda pode usar a loja inteira sem bloqueio.</h2>
            <div className="mt-6 grid gap-4">
              <Link href="/catalogo" className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-white">
                <p className="text-sm font-semibold">Explorar catálogo</p>
                <p className="mt-2 text-sm text-white/60">Veja preços iniciais, prazo e estilos antes de fechar.</p>
              </Link>
              <Link href="/entregas" className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-white">
                <p className="text-sm font-semibold">Calcular frete</p>
                <p className="mt-2 text-sm text-white/60">Confira a faixa de prazo e entrega local no RJ.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Área do cliente</p>
          <h1 className="mt-3 text-4xl font-black text-white">Olá, {account.name}.</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/68">
            Seu login agora vale a pena de verdade: favoritos, orçamentos salvos e sugestões montadas a partir do que você já viu.
          </p>
        </div>

        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Contato</p>
          <p className="mt-3 text-lg font-semibold text-white">{account.email || account.phone}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Favoritos salvos</p>
          <p className="mt-3 text-3xl font-black text-white">{account.favorites.length}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Orçamentos deste navegador</p>
          <p className="mt-3 text-3xl font-black text-white">{account.quotes.length}</p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center gap-3">
            <Heart className="h-5 w-5 text-amber-200" />
            <h2 className="text-2xl font-bold text-white">Favoritos</h2>
          </div>

          {favoriteProducts.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteProducts.map((product) => {
                const image = getPrimaryProductImage(product);

                return (
                  <Link key={product.id} href={getProductUrl(product)} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <ProductImage src={image.src} fallbackSrcs={image.fallbackSrcs} alt={image.alt} containerClassName="aspect-square rounded-[20px]" />
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200">{product.category}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
                    <p className="mt-2 text-sm text-white/60">{formatCurrency(product.pricePix)} no Pix</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm leading-7 text-white/60">Você ainda não salvou peças. Navegue pelo catálogo e marque as favoritas para comparar depois.</p>
          )}
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex items-center gap-3">
            <History className="h-5 w-5 text-cyan-200" />
            <h2 className="text-2xl font-bold text-white">Orçamentos salvos</h2>
          </div>

          {account.quotes.length ? (
            <div className="space-y-3">
              {account.quotes.slice(0, 6).map((quote) => (
                <div key={quote.quoteId} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">{quote.quoteId}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{quote.productName}</p>
                  <p className="mt-1 text-sm text-white/60">Total estimado no Pix: {formatCurrency(quote.totalPix)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-white/60">Assim que você enviar um orçamento pelo site, ele aparece aqui como referência rápida.</p>
          )}
        </div>
      </div>

      <div className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-6">
        <div className="mb-5 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-200" />
          <h2 className="text-2xl font-bold text-white">Recomendações para continuar sua jornada</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recommendedProducts.map((product) => {
            const image = getPrimaryProductImage(product);

            return (
              <Link key={product.id} href={getProductUrl(product)} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <ProductImage src={image.src} fallbackSrcs={image.fallbackSrcs} alt={image.alt} containerClassName="aspect-square rounded-[20px]" />
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-cyan-200">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
                <p className="mt-2 text-sm text-white/60">{formatCurrency(product.pricePix)} no Pix</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
