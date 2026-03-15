"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { ProductQuickView } from "@/components/product-quick-view";
import { useStore } from "@/components/store-provider";
import { getProductUrl, type Product } from "@/lib/catalog";
import { formatInstallments } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

export function StoreProductCard({ product }: { product: Product }) {
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  const favorite = isFavorite(product.id);

  return (
    <>
      <article className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            className={`absolute right-3 top-3 z-10 rounded-full border p-2 ${
              favorite
                ? "border-rose-300/50 bg-rose-400/15 text-rose-100"
                : "border-white/10 bg-black/35 text-white/80"
            }`}
            aria-label={favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
          >
            <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
          </button>

          <Link href={getProductUrl(product)} className="block">
            <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
              <ProductImage
                src={`/catalog-assets/${product.id}.webp`}
                alt={product.name}
                label={`${product.name} • ${product.category}`}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              />
            </div>
          </Link>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
            {product.productionWindow}
          </span>
        </div>

        <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/62 line-clamp-3">{product.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-xs text-white/45">Preço no Pix</p>
          <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
          <p className="mt-1 text-sm text-cyan-100/80">ou {formatInstallments(product.priceCard)} no cartão</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              addToCart(product.id);
              setAdded(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950"
          >
            <ShoppingBag className="h-4 w-4" />
            {added ? "No carrinho" : "Comprar"}
          </button>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
          >
            <Eye className="h-4 w-4" />
            Espiar
          </button>
        </div>
      </article>

      <ProductQuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
