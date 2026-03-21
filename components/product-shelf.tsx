"use client";

import Link from "next/link";
import { ArrowRight, Heart, History, Sparkles } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { SafeProductImage } from "@/components/safe-product-image";
import { getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

type ProductShelfProps = {
  title: string;
  description: string;
  products: Product[];
  href?: string;
  hrefLabel?: string;
  variant?: "favorites" | "recent";
};

export function ProductShelf({
  title,
  description,
  products,
  href,
  hrefLabel,
  variant = "recent",
}: ProductShelfProps) {
  if (!products.length) return null;

  const Icon = variant === "favorites" ? Heart : History;

  return (
    <section className="rounded-[30px] border border-[#e8dac7] bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Icon className="h-4 w-4" />
            Curadoria pessoal
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {href && hrefLabel ? (
          <Link href={href} className="inline-flex items-center gap-2 rounded-full border border-[#eadcc8] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            {hrefLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <article key={product.id} className="rounded-[26px] border border-[#eadcc8] bg-[#fff8ef] p-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f5e7d6_100%)]">
              <SafeProductImage product={product} alt={product.name} className="w-full object-contain p-3" />
              <div className="absolute right-3 top-3">
                <FavoriteButton productId={product.id} label={product.name} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{product.collection}</p>
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                  product.realPhoto ? "bg-[#fff0da] text-orange-700" : "bg-[#efe9ff] text-violet-700"
                }`}
              >
                {product.realPhoto ? "Foto real" : "Conceitual"}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-900">{product.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">No Pix</p>
                <p className="text-xl font-black text-slate-900">{formatCurrency(product.pricePix)}</p>
              </div>
              <Link href={getProductUrl(product)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Ver produto
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
