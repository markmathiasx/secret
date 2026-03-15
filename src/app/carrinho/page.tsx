"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ProductImage } from "@/components/product-image";
import { useStore } from "@/components/store-provider";
import { getProductUrl } from "@/lib/catalog";
import { formatInstallments } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartSubtotalCard,
    cartSubtotalPix,
    clearCart,
    removeFromCart,
    setCartQuantity
  } = useStore();

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Carrinho</p>
        <h1 className="mt-3 text-4xl font-black text-white">Seu carrinho está vazio</h1>
        <p className="mt-4 text-white/65">Adicione produtos do catálogo para seguir para o checkout.</p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Ir para o catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Carrinho</p>
          <h1 className="mt-3 text-4xl font-black text-white">{cartCount} item(ns) prontos para checkout</h1>
          <p className="mt-4 text-white/65">Ajuste quantidades, revise o total e siga para o fechamento simples.</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white"
        >
          <Trash2 className="h-4 w-4" />
          Limpar carrinho
        </button>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <article
              key={item.product.id}
              className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-4 md:grid-cols-[160px_1fr_auto] md:items-center"
            >
              <Link href={getProductUrl(item.product)} className="block">
                <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/10 bg-black/20">
                  <ProductImage
                    src={`/catalog-assets/${item.product.id}.webp`}
                    alt={item.product.name}
                    label={`${item.product.name} • ${item.product.category}`}
                    sizes="160px"
                  />
                </div>
              </Link>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">{item.product.category}</p>
                <h2 className="mt-2 text-xl font-bold text-white">{item.product.name}</h2>
                <p className="mt-2 text-sm text-white/60">{formatCurrency(item.product.pricePix)} no Pix</p>
                <p className="mt-1 text-sm text-white/50">{formatInstallments(item.product.priceCard)} no cartão</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-2">
                  <button
                    type="button"
                    onClick={() => setCartQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                    className="rounded-full bg-white/5 p-2 text-white"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setCartQuantity(item.product.id, item.quantity + 1)}
                    className="rounded-full bg-white/5 p-2 text-white"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <div className="text-right">
                  <p className="text-xs text-white/45">Subtotal</p>
                  <p className="text-xl font-bold text-cyan-100">{formatCurrency(item.subtotalPix)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.product.id)}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-[32px] border border-white/10 bg-white/5 p-6 xl:sticky xl:top-36">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Resumo</p>
          <h2 className="mt-2 text-2xl font-black text-white">Pronto para fechar</h2>

          <div className="mt-6 space-y-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Itens</span>
              <span>{cartCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Total no Pix</span>
              <span className="font-semibold text-white">{formatCurrency(cartSubtotalPix)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Total no cartão</span>
              <span className="font-semibold text-white">{formatCurrency(cartSubtotalCard)}</span>
            </div>
            <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
              Parcelamento de referência: {formatInstallments(cartSubtotalCard)}.
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-white/60">
            Frete e prazo final são confirmados pelo CEP no checkout. O carrinho mantém seus itens salvos localmente.
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
            >
              <ShoppingBag className="h-4 w-4" />
              Ir para checkout
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Continuar comprando
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
