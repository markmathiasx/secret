"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Eye, MessageCircleMore, ShoppingBag, X } from "lucide-react";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { toCartProductSnapshot, useCart } from "@/components/cart-provider";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { getProductUrl, type Product } from "@/lib/catalog";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { formatCurrency, formatInstallment } from "@/lib/utils";

type CatalogQuickViewProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

export function CatalogQuickView({ product, open, onClose }: CatalogQuickViewProps) {
  const { addItem, items } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
    };
  }, [onClose, open]);

  if (!open || !product) return null;

  const cartQuantity = items.find((entry) => entry.productId === product.id)?.quantity || 0;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `${whatsappMessage}\n\nTenho interesse no item ${product.name} (${product.sku}).`
  )}`;

  return (
    <div className="fixed inset-0 z-[85] bg-slate-950/78 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view de ${product.name}`}
        onClick={(event) => event.stopPropagation()}
        className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,30,0.98),rgba(3,8,19,0.98))] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Quick view</p>
            <h2 className="mt-2 text-2xl font-black text-white">{product.name}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/75 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
            aria-label="Fechar quick view"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.02fr_0.98fr]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
            <ProductImageGallery product={product} overlayClassName="z-[95]" />
          </div>

          <div className="flex flex-col p-5">
            <div className="flex flex-wrap gap-2">
              {product.featured ? (
                <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-100">
                  Escolha premium
                </span>
              ) : null}
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
                {product.collection}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/65">
                {product.category}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/65">
                {product.productionWindow}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/65">
                {product.imageStatus === "imported" ? "Imagem local" : "Preview premium"}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/68">{product.merchandising}</p>
            <p className="mt-3 text-sm leading-7 text-white/58">{product.description}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/68">
                {product.theme}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/68">
                {product.materials[0]}
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-100">
                Pix com melhor valor
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-100/70">Pix</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/55">Cartão</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/55">Parcelamento</p>
                <p className="mt-2 text-lg font-bold text-white">{formatInstallment(product.priceCard)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">SKU</p>
                <p className="mt-2 font-semibold text-white">{product.sku}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Peso</p>
                <p className="mt-2 font-semibold text-white">{product.grams} g</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Impressão</p>
                <p className="mt-2 font-semibold text-white">{product.hours} h</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cores disponíveis</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/58">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                "Veja preco e prazo sem perder o scroll da vitrine.",
                "Adicione ao carrinho com um toque e siga para checkout.",
                "Se precisar confirmar detalhe, leve a conversa para o WhatsApp."
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/62">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="mb-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                <span>Quantidade no carrinho</span>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 font-semibold text-cyan-100">
                  {cartQuantity}
                </span>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => addItem(toCartProductSnapshot(product))}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/55 hover:bg-cyan-300/18"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Adicionar ao carrinho
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href={getProductUrl(product)}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    Ver página completa
                  </Link>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsAppClick({ placement: "quick_view", productId: product.id })}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/55 hover:bg-emerald-300/18"
                  >
                    <MessageCircleMore className="h-4 w-4" />
                    Tirar dúvida no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
