"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { SafeProductImage } from "@/components/safe-product-image";
import { getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";
import { getProductImageCandidates } from "@/lib/product-images";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";

function ProductCardImage({ product }: { product: Product }) {
  const candidates = useMemo(() => getProductImageCandidates(product), [product]);
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
      <SafeProductImage candidates={candidates} alt={product.name} className="aspect-square w-full object-cover" />
      <div className="absolute left-4 top-4 rounded-full border border-cyan-300/30 bg-cyan-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">{product.status}</div>
    </div>
  );
}

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
          <ProductCardImage product={product} />
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
              <p className="mt-2 min-h-[72px] line-clamp-3 text-sm leading-6 text-white/62">{product.description}</p>
            </div>
            <FavoriteButton productId={product.id} className="shrink-0" />
          </div>
          <div className="mt-3">
            <ProductVisualBadge product={product} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.material}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.finish}</span>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.productionWindow}</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">Preço Pix</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
              <p className="text-xs text-white/55">12x de {formatCurrency(product.priceCard / 12)} no cartão</p>
            </div>
            <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">Ver produto</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
