"use client";
import { MessageCircleMore, ShoppingBag, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { addLocalCartItem } from "@/lib/cart-store";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";

export function StickyPdpCta({
  productId,
  productName,
  pricePix,
  productImage,
  sku,
  quantity = 1,
  checkoutHref,
  whatsappHref,
}: {
  productId: string;
  productName: string;
  pricePix: number;
  priceCard: number;
  productImage?: string;
  sku?: string;
  quantity?: number;
  checkoutHref: string;
  whatsappHref?: string;
}) {
  const [visible, setVisible] = useState(false);
  const normalizedPriceCard = calculateCardPrice(pricePix);

  useEffect(() => {
    const hero = document.getElementById("pdp-purchase-tools");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  function buyNow() {
    const product = { id: productId, sku, name: productName, pricePix, priceCard: normalizedPriceCard };
    trackAddToCart(product, quantity);
    trackBeginCheckout(product, quantity, pricePix * quantity);
    addLocalCartItem({
      productId,
      quantity,
      title: productName,
      pricePix,
      priceCard: normalizedPriceCard,
      image: productImage,
    });
    window.location.href = checkoutHref;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[120] border-t border-white/10 bg-[rgba(9,17,25,0.97)] px-4 pt-3 backdrop-blur-xl"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)' }}
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{productName}</p>
          <p className="text-xs font-black text-emerald-100">{formatCurrency(pricePix * quantity)} Pix</p>
          <p className="text-[11px] text-white/55">Cartão + R$ 1 {formatCurrency(normalizedPriceCard * quantity)}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 p-3 text-emerald-50 transition hover:bg-emerald-300/16"
              aria-label="Comprar pelo WhatsApp"
            >
              <MessageCircleMore className="h-4 w-4" />
            </a>
          ) : null}
          <button type="button" onClick={buyNow} className="btn-primary gap-2 py-2.5">
            <Wallet className="h-4 w-4" />
            Comprar agora
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("pdp-purchase-tools")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="hidden rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:border-cyan-300/25 hover:text-cyan-100 sm:inline-flex"
            aria-label="Ver opções de compra"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
