"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, MessageCircleMore, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { whatsappNumber } from "@/lib/constants";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";

export type RotatingHeroProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  pricePix: number;
  image: string;
  imageAlt: string;
  href: string;
  productionWindow: string;
  material: string;
};

const ROTATION_MS = 3000;
const PRODUCT_IMAGE_PLACEHOLDER = "/placeholders/product-card.svg";

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function RotatingProductHero({ products }: { products: RotatingHeroProduct[] }) {
  const shouldReduceMotion = useReducedMotion();
  const { addItem } = useCart();
  const items = useMemo(() => products.filter((product) => product.pricePix > 0).slice(0, 16), [products]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = items[clampIndex(activeIndex, items.length)];
  const [imageSrc, setImageSrc] = useState(active?.image || PRODUCT_IMAGE_PLACEHOLDER);

  useEffect(() => {
    setImageSrc(active?.image || PRODUCT_IMAGE_PLACEHOLDER);
  }, [active?.image]);

  useEffect(() => {
    if (!items.length || shouldReduceMotion || paused) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((value) => clampIndex(value + 1, items.length));
    }, ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [items.length, paused, shouldReduceMotion]);

  if (!active) {
    return null;
  }

  const priceCard = calculateCardPrice(active.pricePix);
  const productUrl = `https://www.mdh3d.com.br${active.href}`;
  const whatsappMessage = `Quero comprar ${active.name}. Quantidade: 1. Pix: ${formatCurrency(active.pricePix)}. Cartão + R$ 3: ${formatCurrency(priceCard)}. Categoria: ${active.category}. Intenção: vitrine rotativa da home. Link: ${productUrl}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  function goTo(delta: number) {
    setActiveIndex((value) => clampIndex(value + delta, items.length));
  }

  function addActiveToCart() {
    addItem({
      productId: active.id,
      quantity: 1,
      title: active.name,
      pricePix: active.pricePix,
      priceCard,
      image: imageSrc || PRODUCT_IMAGE_PLACEHOLDER,
    });
  }

  return (
    <section
      data-rotating-product-hero="true"
      data-carousel-interval={ROTATION_MS}
      className="group relative overflow-hidden rounded-[8px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.035))] shadow-[0_28px_90px_rgba(0,0,0,0.32)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-label="Vitrine rotativa de produtos"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.20),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.14),transparent_34%)]" />
      <div className="mdh-cad-grid pointer-events-none absolute inset-0 opacity-20" />

      <div className="relative grid min-h-[520px] lg:grid-cols-[1.04fr_0.96fr]">
        <Link href={active.href} className="relative block min-h-[330px] overflow-hidden bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 lg:min-h-full">
          <motion.img
            key={active.id}
            src={imageSrc}
            alt={active.imageAlt}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={() => {
              if (imageSrc !== PRODUCT_IMAGE_PLACEHOLDER) setImageSrc(PRODUCT_IMAGE_PLACEHOLDER);
            }}
            initial={shouldReduceMotion ? false : { scale: 1.04, opacity: 0.45 }}
            animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-full w-full object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/64 via-transparent to-white/5" />
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/38 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/86 backdrop-blur">
            Produto em destaque
          </div>
        </Link>

        <div className="relative flex flex-col justify-between gap-5 p-5 sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/78">{active.category}</p>
            <h2 className="mt-3 line-clamp-3 text-3xl font-black leading-none text-white sm:text-5xl">{active.name}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[8px] border border-emerald-300/22 bg-emerald-300/10 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100/70">Pix</p>
                <p className="mt-1 text-4xl font-black leading-none text-white">{formatCurrency(active.pricePix)}</p>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/48">Cartão + R$ 3</p>
                <p className="mt-1 text-2xl font-black leading-none text-white">{formatCurrency(priceCard)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/64">
              <span className="truncate rounded-[8px] border border-white/10 bg-black/22 px-3 py-2">Prazo: {active.productionWindow}</span>
              <span className="truncate rounded-[8px] border border-white/10 bg-black/22 px-3 py-2">Material: {active.material}</span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={addActiveToCart} className="btn-primary justify-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Comprar
            </button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp justify-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              WhatsApp
            </a>
            <Link href={active.href} className="btn-secondary justify-center gap-2">
              <Eye className="h-4 w-4" />
              Ver produto
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2" aria-label="Slides da vitrine">
              {items.slice(0, 12).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === clampIndex(activeIndex, items.length) ? "w-8 bg-emerald-200" : "w-2.5 bg-white/28 hover:bg-white/52"}`}
                  aria-label={`Mostrar produto ${index + 1}`}
                  aria-current={index === clampIndex(activeIndex, items.length)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => goTo(-1)} className="btn-glass px-3 py-2" aria-label="Produto anterior">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => goTo(1)} className="btn-glass px-3 py-2" aria-label="Próximo produto">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
