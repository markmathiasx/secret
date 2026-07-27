"use client";
/* eslint-disable @next/next/no-img-element -- Catalog cards use a native img so onError can always swap to the local placeholder in production. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, MessageCircleMore, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/product-routing";
import { whatsappNumber } from "@/lib/constants";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { getProductCardImage, PRODUCT_CARD_PLACEHOLDER } from "@/lib/product-card-image";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { fadeInUp } from "@/lib/animations";

interface PremiumCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

function shortText(value: string, max = 90) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}...` : clean;
}

function badgesFor(product: Product) {
  const badges: string[] = [];
  if (product.pricePix <= 29.9) badges.push("Oferta de entrada");
  if (product.customizable) badges.push("Personalizável");
  if (product.readyToShip) badges.push("Pronta entrega");
  if (product.pricePix >= 99.9) badges.push("Premium");
  if (!badges.length) badges.push(product.status === "Pronta entrega" ? "Pronta entrega" : "Sob encomenda");
  return badges.slice(0, 2);
}

export function PremiumCard({ product, index = 0, priority }: PremiumCardProps) {
  const shouldReduce = useReducedMotion();
  const { addItem } = useCart();
  const cardImage = getProductCardImage(product);
  const shouldPrioritizeImage = priority ?? index < 4;
  const [imageSrc, setImageSrc] = useState(cardImage.src);
  const productUrl = getProductUrl(product);
  const priceCard = calculateCardPrice(product.pricePix);
  const badges = badgesFor(product);
  const description = shortText(product.description || "Produto em impressão 3D para uso, presente ou decoração.");
  const publicUrl = `https://www.mdh3d.com.br${productUrl}`;
  const whatsappMessage = `Quero comprar ${product.name}. Quantidade: 1. Pix: ${formatCurrency(product.pricePix)}. Cartão + R$ 1: ${formatCurrency(priceCard)}. Categoria: ${product.category}. Intenção: compra pelo catálogo. Link: ${publicUrl}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.name,
      pricePix: product.pricePix,
      priceCard,
      image: imageSrc,
    });
  }

  return (
    <motion.article
      variants={shouldReduce ? undefined : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.04 }}
      className="group flex h-full flex-col overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
      aria-label={`Produto: ${product.name}`}
      data-product-card={product.id}
    >
      <Link
        href={productUrl}
        className="relative block aspect-square w-full overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(52,211,153,0.18),transparent_34%),linear-gradient(135deg,#111827,#020617)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        aria-label={`Abrir ${product.name}`}
      >
        <img
          src={imageSrc}
          alt={product.name}
          loading={shouldPrioritizeImage ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={shouldPrioritizeImage ? "high" : "auto"}
          onError={() => {
            if (imageSrc !== PRODUCT_CARD_PLACEHOLDER) setImageSrc(PRODUCT_CARD_PLACEHOLDER);
          }}
          className="h-full w-full object-cover opacity-100 transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/4" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full border border-black/10 bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-950 shadow-sm">
              {badge}
            </span>
          ))}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-[0.12em] text-emerald-100/75">{product.category}</p>
          <Link href={productUrl} className="mt-1 block line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-white hover:text-emerald-100">
            {product.name}
          </Link>
          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-white/58">{description}</p>
        </div>

        <div className="mt-auto rounded-[8px] border border-white/10 bg-black/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100/70">Pix</p>
          <p className="mt-1 text-2xl font-black leading-none text-white">{formatCurrency(product.pricePix)}</p>
          <p className="mt-1 text-xs font-semibold text-white/60">Cartão + R$ 1 {formatCurrency(priceCard)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
          <span className="truncate rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-2">{product.productionWindow}</span>
          <span className="truncate rounded-[8px] border border-white/10 bg-white/[0.04] px-2.5 py-2">{product.material}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-100"
            aria-label={`Comprar ${product.name}`}
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            Comprar
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-50 transition hover:bg-emerald-300/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            aria-label={`Comprar ${product.name} pelo WhatsApp`}
          >
            <MessageCircleMore className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp
          </a>
          <Link
            href={productUrl}
            className="col-span-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black text-white/82 transition hover:border-white/20 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label={`Ver produto ${product.name}`}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Ver produto
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
