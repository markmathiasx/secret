"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { PublicProductPayload } from "@/lib/public-catalog";

const FAVORITES_KEY = "mdh:favorites";

type FavoriteItem = {
  id: string;
  addedAt?: string;
};

export default function FavoritosPage() {
  const [catalogItems, setCatalogItems] = useState<PublicProductPayload[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<PublicProductPayload[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/store/products", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        setCatalogItems(Array.isArray(payload?.products) ? (payload.products as PublicProductPayload[]) : []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!catalogItems.length) return;

    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) {
        setFavoriteProducts([]);
        return;
      }

      const parsed = JSON.parse(raw) as Record<string, FavoriteItem[]>;
      const ids = new Set<string>();

      for (const items of Object.values(parsed)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item?.id) ids.add(item.id);
          }
        }
      }

      setFavoriteProducts(catalogItems.filter((product) => ids.has(product.id)));
    } catch {
      setFavoriteProducts([]);
    }
  }, [catalogItems]);

  function removeFavorite(productId: string) {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, FavoriteItem[]>;
      for (const key of Object.keys(parsed)) {
        parsed[key] = (parsed[key] || []).filter((item) => item.id !== productId);
      }
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(parsed));
      setFavoriteProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      // ignore
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="section-kicker">Sua lista</p>
        <h1 className="section-title">Favoritos</h1>
        <p className="section-copy">Produtos que você salvou para conferir depois.</p>
      </div>

      {!loaded && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-[24px] bg-white/5" />
          ))}
        </div>
      )}

      {loaded && favoriteProducts.length === 0 && (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-12 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-white/20" />
          <p className="text-white/60">Você ainda não tem produtos favoritos.</p>
          <Link href="/catalogo" className="btn-primary mt-4 inline-flex">
            Explorar catálogo
          </Link>
        </div>
      )}

      {loaded && favoriteProducts.length > 0 && (
        <>
          <p className="mb-4 text-sm text-white/50">{favoriteProducts.length} produto{favoriteProducts.length !== 1 ? "s" : ""} favorito{favoriteProducts.length !== 1 ? "s" : ""}</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="glass-card group relative flex flex-col gap-3">
                <button
                  onClick={() => removeFavorite(product.id)}
                  className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 p-1.5 text-rose-300 transition hover:bg-rose-300/20"
                  title="Remover dos favoritos"
                >
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </button>

                <Link href={`/catalogo/${product.id}-${product.slug || product.sku.toLowerCase()}`}>
                  <div className="aspect-square overflow-hidden rounded-[16px] bg-white/5">
                    {product.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20 text-3xl">📦</div>
                    )}
                  </div>
                  <div>
                    <p className="mt-2 font-semibold text-white leading-tight">{product.name}</p>
                    <p className="mt-0.5 text-xs text-white/50">{product.category}</p>
                    <p className="mt-2 text-sm font-bold text-emerald-200">{fmt(product.pricePix)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
