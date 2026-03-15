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
  const badge = typeof product.metadata.badge === "string" ? product.metadata.badge : product.collection;
  const subtitle = typeof product.metadata.subtitle === "string" ? product.metadata.subtitle : product.merchandising;
  const idealFor = typeof product.metadata.idealFor === "string" ? product.metadata.idealFor : "presente, setup ou decoracao";
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
        className="premium-dialog-shell mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[36px]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Veja de perto</p>
            <h2 className="mt-2 text-2xl font-black text-white">{product.name}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="premium-btn premium-btn-secondary premium-icon-btn text-white/75 hover:text-white"
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
              <span className="premium-badge premium-badge-warning text-xs">
                {badge}
              </span>
              <span className="premium-badge premium-badge-info text-xs">
                {product.collection}
              </span>
              <span className="premium-badge premium-badge-neutral text-xs">
                {product.category}
              </span>
              <span className="premium-badge premium-badge-neutral text-xs">
                {product.productionWindow}
              </span>
              <span className="premium-badge premium-badge-neutral text-xs">
                {product.imageStatus === "imported" ? "Foto da peca" : "Visual da colecao"}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/68">{product.merchandising}</p>
            <p className="mt-3 text-sm leading-7 text-white/58">{subtitle}</p>

            <div className="mt-4 flex flex-wrap gap-2">
                <span className="premium-badge premium-badge-neutral h-auto px-3 py-1 text-[11px]">
                  {product.theme}
                </span>
                <span className="premium-badge premium-badge-neutral h-auto px-3 py-1 text-[11px]">
                  {product.materials[0]}
                </span>
                <span className="premium-badge premium-badge-success h-auto px-3 py-1 text-[11px]">
                  Pix com melhor valor
                </span>
              </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="premium-card rounded-[24px] border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-100/70">Pix</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <p className="text-sm text-white/55">Cartão</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
              </div>
              <div className="premium-card rounded-[24px] p-4">
                <p className="text-sm text-white/55">Parcelamento</p>
                <p className="mt-2 text-lg font-bold text-white">{formatInstallment(product.priceCard)}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="premium-card rounded-[24px] bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">SKU</p>
                <p className="mt-2 font-semibold text-white">{product.sku}</p>
              </div>
              <div className="premium-card rounded-[24px] bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Peso</p>
                <p className="mt-2 font-semibold text-white">{product.grams} g</p>
              </div>
              <div className="premium-card rounded-[24px] bg-black/20 p-4 text-sm text-white/65">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Producao</p>
                <p className="mt-2 font-semibold text-white">{product.hours} h</p>
              </div>
            </div>

            <div className="premium-card mt-6 rounded-[24px] bg-black/20 p-4 text-sm leading-7 text-white/64">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Ideal para</p>
              <p className="mt-2">{idealFor}</p>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Cores disponíveis</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color} className="premium-chip px-3 py-1.5 text-sm">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="premium-chip h-auto px-3 py-1 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                "Veja preco, prazo e estilo da peca sem sair da vitrine.",
                "Adicione ao carrinho com um toque e continue a compra no seu ritmo.",
                "Se quiser validar cor, nome ou acabamento, fale com a gente no WhatsApp."
              ].map((item) => (
                <div key={item} className="premium-card rounded-[24px] bg-black/20 p-4 text-sm leading-7 text-white/62">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="premium-card mb-4 flex items-center justify-between rounded-[24px] px-4 py-3 text-sm text-white/65">
                <span>Quantidade no carrinho</span>
                <span className="premium-badge premium-badge-info font-semibold normal-case tracking-[0.04em]">
                  {cartQuantity}
                </span>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => addItem(toCartProductSnapshot(product))}
                  className="premium-btn premium-btn-primary"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Adicionar ao carrinho
                </button>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href={getProductUrl(product)}
                    onClick={onClose}
                    className="premium-btn premium-btn-secondary"
                  >
                    <Eye className="h-4 w-4" />
                    Ver página completa
                  </Link>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackWhatsAppClick({ placement: "quick_view", productId: product.id })}
                    className="premium-btn premium-btn-emerald"
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
