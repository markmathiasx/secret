"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, History, ReceiptText, RotateCcw } from "lucide-react";
import { catalog, getProductUrl } from "@/lib/catalog";
import { useCustomerSession } from "@/lib/customer-session-client";
import { getMemberKey, listFavorites, listSavedQuotes, type SavedQuote } from "@/lib/member-store";
import { formatCurrency } from "@/lib/utils";

const RECENT_KEY = "mdh_catalog_recent";

function readRecentIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function HomeResumePanel() {
  const session = useCustomerSession();
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);

  useEffect(() => {
    if (!session.ready) return;
    const memberKey = getMemberKey({ id: session.user?.id, email: session.user?.email });
    setFavoriteIds(listFavorites(memberKey));
    setQuotes(listSavedQuotes(memberKey));
    setRecentIds(readRecentIds());
  }, [session.ready, session.user?.email, session.user?.id]);

  function clearRecent() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(RECENT_KEY);
    setRecentIds([]);
  }

  const favorites = useMemo(
    () => favoriteIds.map((id) => catalog.find((product) => product.id === id)).filter(Boolean).slice(0, 6),
    [favoriteIds]
  );
  const recents = useMemo(
    () => recentIds.map((id) => catalog.find((product) => product.id === id)).filter(Boolean).slice(0, 6),
    [recentIds]
  );
  const lastQuote = quotes[0] || null;

  if (!favorites.length && !recents.length && !lastQuote) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">
      <div className="glass-panel p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="section-kicker">Retomar jornada</p>
            <h2 className="section-title">A loja agora lembra onde você parou.</h2>
            <p className="section-copy mt-4">
              Favoritos, itens vistos e último orçamento ajudam a continuar a compra sem recomeçar tudo do zero.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/catalogo" className="btn-secondary">
              Voltar para o catálogo
            </Link>
            {lastQuote ? (
              <Link href={`/checkout?product=${lastQuote.productId}`} className="btn-primary">
                Continuar pedido
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.05fr_1.05fr]">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-cyan-100">
              <ReceiptText className="h-4 w-4" />
              <p className="text-sm font-semibold">Último orçamento</p>
            </div>
            {lastQuote ? (
              <>
                <h3 className="mt-4 text-xl font-black text-white">{lastQuote.productName}</h3>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  Código {lastQuote.quoteId} • {formatCurrency(lastQuote.totalPix)} • {lastQuote.paymentMethod}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/checkout?product=${lastQuote.productId}`} className="btn-primary">
                    Abrir checkout
                  </Link>
                  <Link href="/conta" className="btn-glass">
                    Ver conta
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm leading-7 text-white/66">
                Assim que um orçamento for registrado, ele aparece aqui para retomada rápida.
              </p>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Heart className="h-4 w-4" />
                Favoritos
              </p>
              <span className="text-xs uppercase tracking-[0.16em] text-white/45">{favorites.length}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {favorites.length ? (
                favorites.map((product) => (
                  <Link
                    key={product!.id}
                    href={getProductUrl(product!)}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/78 transition hover:border-cyan-300/25 hover:text-cyan-100"
                  >
                    {product!.name}
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-white/66">Seus favoritos aparecem aqui para voltar direto aos itens mais promissores.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <History className="h-4 w-4" />
                Vistos recentemente
              </p>
              {recents.length ? (
                <button type="button" onClick={clearRecent} className="text-xs uppercase tracking-[0.16em] text-white/45 transition hover:text-white/75">
                  <span className="inline-flex items-center gap-1">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Limpar
                  </span>
                </button>
              ) : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recents.length ? (
                recents.map((product) => (
                  <Link
                    key={product!.id}
                    href={getProductUrl(product!)}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/78 transition hover:border-cyan-300/25 hover:text-cyan-100"
                  >
                    {product!.name}
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-white/66">Os itens que você abrir no catálogo vão aparecer aqui para retomada rápida.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
