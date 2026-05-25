"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircleMore, Package, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { whatsappNumber } from "@/lib/constants";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { validateProductMedia, isPublicSafe } from "@/lib/media-validation";
import { fadeInUp } from "@/lib/animations";

interface PremiumCardProps {
  product: Product;
  index?: number;
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

export function PremiumCard({ product, index = 0 }: PremiumCardProps) {
  const shouldReduce = useReducedMotion();
  const { addItem } = useCart();
  const mediaRecord = validateProductMedia(product);

  if (!isPublicSafe(mediaRecord.status)) return null;

  const firstImageUrl = mediaRecord.gallery[0]?.url ?? product.images?.[0] ?? product.image ?? null;
  const productUrl = getProductUrl(product);
  const priceCard = calculateCardPrice(product.pricePix);
  const badges = badgesFor(product);
  const description = shortText(product.description || "Produto em impressão 3D para uso, presente ou decoração.");
  const publicUrl = `https://www.mdh3d.com.br${productUrl}`;
  const whatsappMessage = `Quero comprar ${product.name}. Quantidade: 1. Pix: ${formatCurrency(product.pricePix)}. Cartão: ${formatCurrency(priceCard)}. Categoria: ${product.category}. Intenção: compra pelo catálogo. Link: ${publicUrl}`;
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
      image: firstImageUrl ?? undefined,
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
    >
      <Link
        href={productUrl}
        className="relative block aspect-square w-full overflow-hidden bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        aria-label={`Abrir ${product.name}`}
      >
        {firstImageUrl ? (
          <Image
            src={firstImageUrl}
            alt={product.imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-white/25" aria-hidden="true" />
          </div>
        )}
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
          <p className="mt-1 text-xs font-semibold text-white/60">Cartão {formatCurrency(priceCard)}</p>
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
        </div>
      </div>
    </motion.article>
  );
}
