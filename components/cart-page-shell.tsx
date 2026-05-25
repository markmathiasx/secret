"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { MessageCircleMore, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, Wallet } from "lucide-react";
import { QuickAddToCart } from "@/components/quick-add-to-cart";
import { useCart } from "@/lib/cart-context";
import { calculateCartTotals } from "@/lib/checkout";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { whatsappNumber } from "@/lib/constants";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { bestsellerStorefrontProducts, resolveStorefrontHref } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export function CartPageShell({ cardCheckoutReady = false }: { cardCheckoutReady?: boolean }) {
  const { hydrated, items, removeItem, updateQuantity, clearCart } = useCart();
  const totals = calculateCartTotals(items);
  const whatsappHref = useMemo(() => {
    const lines = [
      "Quero fechar este carrinho da MDH 3D:",
      ...items.map((item) => `- ${item.quantity}x ${item.title}. Pix: ${formatCurrency(item.pricePix)}. Cartão + R$ 3: ${formatCurrency(calculateCardPrice(item.pricePix))}.`),
      `Subtotal Pix: ${formatCurrency(totals.subtotalPix)}`,
      `Subtotal Cartão + R$ 3: ${formatCurrency(totals.subtotalCard)}`,
      `Total Pix: ${formatCurrency(totals.totalPix)}`,
      `Total Cartão + R$ 3: ${formatCurrency(totals.totalCard)}`,
      "Intenção: finalizar compra pelo carrinho.",
    ];
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [items, totals.subtotalCard, totals.subtotalPix, totals.totalCard, totals.totalPix]);

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel animate-pulse p-8">
          <div className="h-6 w-48 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="h-32 rounded-[28px] bg-white/10" />
              <div className="h-32 rounded-[28px] bg-white/10" />
            </div>
            <div className="h-80 rounded-[28px] bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Carrinho</p>
          <h1 className="section-title">Revise o pedido e escolha Pix ou cartão.</h1>
          <p className="section-copy mt-3 max-w-3xl">
            Frete fixo de R$ 15,00, checkout sem cadastro e fallback imediato por WhatsApp se você quiser confirmar com a equipe.
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clearCart}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white"
          >
            Limpar carrinho
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="glass-panel overflow-hidden p-8 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">Pronto para vender hoje</p>
              <h2 className="mt-3 text-3xl font-black text-white">Seu carrinho está vazio.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                Escolha um item de utilidade, presente ou decoração para seguir direto para o checkout.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/catalogo" className="btn-primary">
                  Ver catálogo completo
                </Link>
                <Link href="/presentes-3d" className="btn-secondary">
                  Explorar presentes
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {bestsellerStorefrontProducts.slice(0, 4).map((product) => (
                <article key={product.id} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                  <Link href={product.href} className="block">
                    <div className="relative h-40 overflow-hidden rounded-[20px] border border-white/10 bg-black/30">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 240px"
                        unoptimized
                      />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-white">{product.name}</p>
                    <p className="mt-2 text-xs leading-6 text-white/60">{product.shortDescription}</p>
                  </Link>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-black text-emerald-100">{formatCurrency(product.pricePix)}</span>
                    <QuickAddToCart
                      productId={product.id}
                      productName={product.name}
                      pricePix={product.pricePix}
                      priceCard={product.priceCard}
                      image={product.images[0]}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.productId} className="glass-panel p-5">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <Link
                    href={resolveStorefrontHref(item.productId)}
                    className="relative block h-40 w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/25 sm:h-36 sm:w-36"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="144px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/30">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-cyan-100/65">Pedido ativo</p>
                        <h2 className="mt-1 text-xl font-bold text-white">{item.title}</h2>
                        {item.personalizationText ? (
                          <p className="mt-3 rounded-[16px] border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm text-cyan-50">
                            Personalização: {item.personalizationText}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-full border border-rose-300/20 bg-rose-300/10 p-3 text-rose-100 transition hover:border-rose-300/35"
                        aria-label={`Remover ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-[auto_auto_1fr] md:items-end">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Preço unitário</p>
                        <p className="mt-2 text-lg font-black text-emerald-100">Pix {formatCurrency(item.pricePix)}</p>
                        <p className="mt-1 text-xs font-semibold text-white/60">Cartão + R$ 3 {formatCurrency(calculateCardPrice(item.pricePix))}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Quantidade</p>
                        <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:border-white/20"
                            aria-label={`Diminuir quantidade de ${item.title}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:border-white/20"
                            aria-label={`Aumentar quantidade de ${item.title}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Subtotal Pix</p>
                        <p className="mt-2 text-xl font-black text-white">
                          {formatCurrency(item.pricePix * item.quantity)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-white/60">
                          Cartão + R$ 3 {formatCurrency(calculateCardPrice(item.pricePix) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="glass-panel h-fit p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/72">Resumo</p>
            <h2 className="mt-3 text-2xl font-black text-white">Fechamento web-first</h2>

            <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Itens</span>
                <span>{totals.quantity}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Subtotal Pix</span>
                <span>{formatCurrency(totals.subtotalPix)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Subtotal Cartão</span>
                <span>{formatCurrency(totals.subtotalCard)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Frete fixo</span>
                <span>{formatCurrency(totals.shipping)}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Pix</span>
                <span className="text-2xl font-black text-emerald-100">{formatCurrency(totals.totalPix)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Cartão</span>
                <span className="text-xl font-black text-white">{formatCurrency(totals.totalCard)}</span>
              </div>
              <p className="text-xs leading-6 text-white/45">
                No cartão, cada produto fica R$ 3,00 acima do Pix. Frete fixo de R$ 15,00.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[24px] border border-rose-300/20 bg-rose-300/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-100">
                      <Wallet className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-black text-white">Pix e cartão no carrinho</p>
                      <p className="mt-1 text-xs text-white/62">Pix e cartão aparecem antes de finalizar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() =>
                  trackEvent("cart_checkout_click", {
                    item_count: totals.quantity,
                    value: totals.totalPix,
                  })
                }
                className="btn-primary justify-center text-base"
              >
                Fechar pedido agora
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsAppClick("cart_page_summary")}
                className="btn-zap justify-center"
              >
                <MessageCircleMore className="mr-2 h-4 w-4" />
                Fechar pelo WhatsApp
              </a>
              <Link href="/catalogo" className="btn-secondary justify-center">
                Continuar comprando
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Compra protegida",
                  body: "Pedido salvo com código, retorno de pagamento e fallback por WhatsApp.",
                },
                {
                  icon: Wallet,
                  title: cardCheckoutReady ? "Pix e cartão online" : "Pix e atendimento assistido",
                  body: cardCheckoutReady
                    ? "O checkout abre o pagamento online e mantém WhatsApp como fallback comercial."
                    : "O checkout registra o pedido com Pix e leva cartão para orientação humana quando necessário.",
                },
                {
                  icon: Truck,
                  title: "Produção no RJ",
                  body: "Operação local com atendimento humano para confirmar acabamento e prazo.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs leading-6 text-white/58">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
