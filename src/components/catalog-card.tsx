"use client";

import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import { toCartProductSnapshot, useCart } from "@/components/cart-provider";
import { ProductMediaImage } from "@/components/product-media-image";
import { getProductUrl, type Product } from "@/lib/catalog";
import { formatCurrency, formatInstallment } from "@/lib/utils";

type CatalogCardProps = {
  product: Product;
  onQuickView: (product: Product) => void;
};

export function CatalogCard({ product, onQuickView }: CatalogCardProps) {
  const { addItem, items } = useCart();
  const cartQuantity = items.find((entry) => entry.productId === product.id)?.quantity || 0;
  const pixSaving = Math.max(0, product.priceCard - product.pricePix);
  const badge = typeof product.metadata.badge === "string" ? product.metadata.badge : product.featured ? "Escolha da loja" : product.collection;
  const subtitle = typeof product.metadata.subtitle === "string" ? product.metadata.subtitle : product.merchandising;

  return (
    <article className="group overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] shadow-[0_24px_64px_rgba(2,8,23,0.28)] transition hover:-translate-y-1 hover:border-cyan-300/35">
      <Link href={getProductUrl(product)} className="relative block overflow-hidden">
        <ProductMediaImage
          product={product}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.68))]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75">
            {product.collection}
          </span>
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
            {product.productionWindow}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75">
            {product.theme}
          </span>
          <span className="rounded-full border border-amber-300/25 bg-amber-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
            {badge}
          </span>
        </div>
        {cartQuantity ? (
          <div className="absolute bottom-4 left-4 rounded-full border border-emerald-400/20 bg-emerald-400/14 px-3 py-1 text-xs font-semibold text-emerald-100">
            {cartQuantity} no carrinho
          </div>
        ) : null}
      </Link>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/78">{product.category}</p>
            <Link href={getProductUrl(product)} className="mt-2 block text-lg font-semibold text-white transition hover:text-cyan-100">
              {product.name}
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right text-[11px] text-white/60">
            <div className="font-semibold text-white">{product.grams} g</div>
            <div>{product.hours} h</div>
          </div>
        </div>

        <p className="min-h-[72px] text-sm leading-6 text-white/62">{subtitle}</p>

        <div className="flex flex-wrap gap-2">
          {product.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
              {tag}
            </span>
          ))}
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/55">
            {product.materials[0]}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-white/55">
            {product.imageStatus === "imported" ? "Foto da peca" : "Visual ilustrativo"}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[22px] border border-emerald-400/18 bg-emerald-400/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">Pix</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cartão</p>
            <p className="mt-2 text-base font-bold text-white">{formatCurrency(product.priceCard)}</p>
            <p className="mt-1 text-xs text-white/55">{formatInstallment(product.priceCard)}</p>
          </div>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/58">
          {pixSaving > 0 ? `No Pix voce economiza ${formatCurrency(pixSaving)} neste item.` : "Preco pensado para compra rapida e boa leitura de valor."}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => onQuickView(product)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/82 transition hover:border-white/20 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Espiar
          </button>
          <button
            type="button"
            onClick={() => addItem(toCartProductSnapshot(product))}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
