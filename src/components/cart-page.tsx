"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { buttonFamilies } from "@/components/ui/buttons";
import { ProductMediaImage } from "@/components/product-media-image";
import { trackEvent } from "@/lib/analytics-client";
import { getProductUrl } from "@/lib/catalog";
import { formatCurrency, formatInstallment } from "@/lib/utils";

export function CartPage() {
  const { items, subtotalPix, subtotalCard, customerDraft, setCustomerDraft, updateQuantity, removeItem, clearCart } = useCart();

  if (!items.length) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="section-shell rounded-[36px] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Carrinho</p>
          <h1 className="mt-4 text-4xl font-black text-white">Seu carrinho está vazio</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62">
            Explore a colecao, escolha suas pecas favoritas e volte aqui para finalizar com mais rapidez.
          </p>
          <Link href="/catalogo" className={`${buttonFamilies.primary} mt-8 inline-flex`}>
            Ir para o catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.productId} className="section-shell rounded-[32px] p-5">
              <div className="flex gap-4">
                <Link href={getProductUrl(item.snapshot)} className="shrink-0">
                  <ProductMediaImage
                    product={{
                      imagePath: item.snapshot.imagePath,
                      name: item.snapshot.name,
                      sku: item.snapshot.sku,
                      category: item.snapshot.category
                    }}
                    className="h-28 w-28 rounded-[24px] border border-white/10 object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">{item.snapshot.category}</p>
                      <Link href={getProductUrl(item.snapshot)} className="mt-2 block text-xl font-semibold text-white">
                        {item.snapshot.name}
                      </Link>
                      <p className="mt-1 text-sm text-white/45">{item.snapshot.productionWindow}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className={`${buttonFamilies.tertiary} ${buttonFamilies.icon} text-white/60`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="premium-card rounded-[20px] border-emerald-400/18 bg-emerald-400/10 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">Pix</p>
                        <p className="mt-1 text-lg font-black text-white">{formatCurrency(item.snapshot.pricePix)}</p>
                      </div>
                      <div className="premium-card rounded-[20px] bg-black/20 px-4 py-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cartão</p>
                        <p className="mt-1 text-lg font-black text-white">{formatCurrency(item.snapshot.priceCard)}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className={`${buttonFamilies.tertiary} ${buttonFamilies.icon} h-8 min-h-8 min-w-8 p-0 text-white/70`}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-6 text-center font-semibold text-white">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className={`${buttonFamilies.tertiary} ${buttonFamilies.icon} h-8 min-h-8 min-w-8 p-0 text-white/70`}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="section-shell h-fit rounded-[36px] p-6 xl:sticky xl:top-36">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Resumo</p>
          <h2 className="mt-3 text-3xl font-black text-white">Seu pedido esta quase pronto</h2>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Revise as quantidades, deixe observacoes importantes e siga para um checkout simples, rapido e pensado para concluir sua compra sem atrito.
          </p>

          <div className="premium-card mt-6 space-y-3 rounded-[28px] bg-black/20 p-5">
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Subtotal Pix</span>
              <strong className="text-lg text-white">{formatCurrency(subtotalPix)}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-white/65">
              <span>Subtotal Cartão</span>
              <strong className="text-lg text-white">{formatCurrency(subtotalCard)}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-white/55">
              <span>Parcelamento</span>
              <span>{formatInstallment(subtotalCard)}</span>
            </div>
          </div>

          <label className="mt-5 block text-sm text-white/68">
            <span className="mb-2 block">Observacoes para sua compra</span>
            <textarea
              value={customerDraft.notes}
              onChange={(event) => setCustomerDraft({ notes: event.target.value })}
              placeholder="Cor desejada, urgencia, referencia de entrega, presente..."
              className="premium-textarea"
            />
          </label>

          <div className="premium-card mt-5 grid gap-3 rounded-[28px] bg-black/20 p-5">
            {[
              "Pix segue como o melhor caminho para comprar com mais vantagem.",
              "Checkout simples ajuda voce a fechar o pedido em poucos minutos.",
              "Se quiser confirmar cor, prazo ou detalhe, o WhatsApp entra como apoio rapido."
            ].map((item) => (
              <p key={item} className="text-sm leading-6 text-white/62">
                {item}
              </p>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/checkout"
              onClick={() =>
                trackEvent("begin_checkout", {
                  itemCount: items.length,
                  subtotalPix,
                  subtotalCard,
                  source: "cart_page"
                })
              }
              className={buttonFamilies.primary}
            >
              Finalizar pedido
            </Link>
            <Link href="/catalogo" className={buttonFamilies.secondary}>
              Continuar comprando
            </Link>
            <button type="button" onClick={clearCart} className={`${buttonFamilies.tertiary} text-white/60`}>
              Limpar carrinho
            </button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
        <div className="premium-floating-bar flex items-center justify-between gap-3 rounded-full px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Subtotal Pix</p>
            <p className="truncate text-sm font-semibold text-white">{formatCurrency(subtotalPix)}</p>
          </div>
          <Link
            href="/checkout"
            onClick={() =>
              trackEvent("begin_checkout", {
                itemCount: items.length,
                subtotalPix,
                subtotalCard,
                source: "cart_mobile_sticky"
              })
            }
            className={buttonFamilies.primary}
          >
            Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
