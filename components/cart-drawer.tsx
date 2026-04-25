"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { MessageCircleMore, Minus, Plus, ShoppingCart, TimerReset, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { whatsappNumber } from "@/lib/constants";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { hydrated, items, count, subtotalPix, subtotalCard, removeItem, updateQuantity, isDrawerOpen, closeDrawer } = useCart();
  const whatsappHref = useMemo(() => {
    const lines = [
      "Oi! Quero fechar este carrinho da MDH 3D agora:",
      ...items.map((item) => `- ${item.quantity}x ${item.title}`),
      `Subtotal Pix: ${formatCurrency(subtotalPix)}`,
    ];
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, subtotalPix]);

  if (!hydrated || !isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm"
        onClick={closeDrawer}
        aria-hidden="true"
      />
      {/* ARIA live region — announces cart changes to screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {count > 0
          ? `Carrinho: ${count} ${count === 1 ? "item" : "itens"}, subtotal Pix ${formatCurrency(subtotalPix)}`
          : "Carrinho vazio"}
      </div>
      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 z-[140] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[rgba(9,17,25,0.97)] shadow-[0_0_80px_rgba(2,8,23,0.6)]"
        style={{ paddingRight: 'env(safe-area-inset-right, 0)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-cyan-100" />
            <h2 className="text-lg font-black text-white">Carrinho</h2>
            {count > 0 && (
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-100">
                {count} {count === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
            aria-label="Fechar carrinho"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="h-12 w-12 text-white/20" />
              <p className="mt-4 text-sm font-semibold text-white/50">Seu carrinho está vazio</p>
              <p className="mt-2 text-xs text-white/35">Explore o catálogo e adicione produtos</p>
              <Link href="/catalogo" onClick={closeDrawer} className="btn-primary mt-6">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-[20px] border border-white/10 bg-white/5 p-4"
                >
                  {item.image ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[14px] border border-white/10">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-black/30">
                      <ShoppingCart className="h-6 w-6 text-white/25" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {formatCurrency(item.pricePix)} / un. • Pix
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="rounded-full border border-white/10 bg-black/20 p-1 text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                        aria-label="Diminuir"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[24px] text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= 20}
                        className="rounded-full border border-white/10 bg-black/20 p-1 text-white/70 transition hover:border-white/20 hover:text-white disabled:opacity-40"
                        aria-label="Aumentar"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <p className="text-sm font-black text-white">
                      {formatCurrency(item.pricePix * item.quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded-full border border-white/10 bg-white/5 p-1.5 text-rose-300/70 transition hover:border-rose-300/20 hover:text-rose-300"
                      aria-label="Remover item"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and CTA */}
        {items.length > 0 && (
          <div
            className="space-y-4 border-t border-white/10 px-6 pt-5"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)' }}
          >
            <div className="space-y-2 rounded-[20px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Subtotal Pix</span>
                <span className="font-black text-emerald-100">{formatCurrency(subtotalPix)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Subtotal Cartão</span>
                <span className="font-semibold text-white/80">{formatCurrency(subtotalCard)}</span>
              </div>
              <p className="text-xs text-white/40">Frete fixo de R$ 15,00 aplicado no carrinho e checkout.</p>
            </div>

            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="btn-primary w-full justify-center gap-2"
            >
              <TimerReset className="h-4 w-4" />
              Fechar agora
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                trackWhatsAppClick("cart_drawer");
                trackEvent("cart_drawer_whatsapp_click", { item_count: count, value: subtotalPix });
              }}
              className="btn-zap w-full justify-center gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Fechar pelo WhatsApp
            </a>
            <button
              type="button"
              onClick={closeDrawer}
              className="btn-secondary w-full justify-center"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
