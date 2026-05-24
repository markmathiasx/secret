"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, ShoppingCart, Package, BadgeCheck } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { validateProductMedia, isPublicSafe, isHeroEligible } from "@/lib/media-validation";
import { fadeInUp } from "@/lib/animations";

interface PremiumCardProps {
  product: Product;
  index?: number;
}

export function PremiumCard({ product, index = 0 }: PremiumCardProps) {
  const shouldReduce = useReducedMotion();
  const { addItem } = useCart();

  const mediaRecord = validateProductMedia(product);
  const publicSafe = isPublicSafe(mediaRecord.status);
  const heroEligible = isHeroEligible(mediaRecord.status, mediaRecord.gallery.length);

  if (!publicSafe) return null;

  const firstImageUrl: string | null =
    mediaRecord.gallery[0]?.url ?? product.images?.[0] ?? product.image ?? null;
  const productUrl = getProductUrl(product);
  const visualLabel =
    mediaRecord.status === "verified"
      ? "Imagem validada"
      : mediaRecord.status === "render-verified"
        ? "Visual validado"
        : "Imagem sinalizada";

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      quantity: 1,
      title: product.name,
      pricePix: product.pricePix,
      priceCard: product.priceCard,
      image: firstImageUrl ?? undefined,
    });
  }

  const delay = index * 0.07;

  return (
    <motion.article
      variants={shouldReduce ? undefined : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
      whileHover={shouldReduce ? undefined : { scale: 1.02 }}
      className={`mdh-product-card-2026 group relative flex flex-col overflow-hidden rounded-[8px] border backdrop-blur-sm ${
        heroEligible
          ? "border-emerald-400/24 bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(3,7,13,0.86))]"
          : "border-cyan-300/16 bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(3,7,13,0.86))]"
      }`}
      aria-label={`Produto: ${product.name}`}
    >
      {/* Image */}
      <Link
        href={productUrl}
        className="relative block aspect-square w-full overflow-hidden rounded-[8px] bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        tabIndex={0}
        aria-label={`Ver ${product.name}`}
      >
      {firstImageUrl ? (
          <Image
            src={firstImageUrl}
            alt={mediaRecord.gallery[0]?.alt || product.imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-12 w-12 text-white/20" aria-hidden="true" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {heroEligible && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-900/70 px-2.5 py-1 text-[10px] font-semibold text-emerald-200 backdrop-blur-sm">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              {visualLabel}
            </span>
          )}
          {product.featured && (
            <span className="rounded-full border border-cyan-400/30 bg-cyan-900/70 px-2.5 py-1 text-[10px] font-semibold text-cyan-100 backdrop-blur-sm">
              Destaque
            </span>
          )}
          {product.readyToShip && (
            <span className="rounded-full border border-amber-400/30 bg-amber-900/70 px-2.5 py-1 text-[10px] font-semibold text-amber-200 backdrop-blur-sm">
              Pronta entrega
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-indigo-300/80">
            {product.category}
          </p>
          <Link
            href={productUrl}
            className="mt-1 block text-base font-black leading-snug text-white hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            {product.name}
          </Link>
          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/50">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-[8px] border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/62">
          <Eye className="h-3.5 w-3.5 text-cyan-100" aria-hidden="true" />
          <span>Mídia do produto: {visualLabel.toLowerCase()}</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <p className="text-xs text-white/45">
            Referência assistida {formatCurrency(product.priceCard)}
          </p>
          <p className="text-lg font-bold text-emerald-400">
            {formatCurrency(product.pricePix)}{" "}
            <span className="text-sm font-normal text-emerald-300/70">no Pix</span>
          </p>
        </div>

        {/* CTA */}
        <div className="mt-1 grid gap-2 sm:grid-cols-[1fr_auto]">
          <Link
            href={productUrl}
            className="btn-secondary min-h-11 gap-2 rounded-[8px] px-4 py-2.5 text-sm"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Ver visual
          </Link>
          <motion.button
            type="button"
            onClick={handleAddToCart}
            whileTap={shouldReduce ? undefined : { scale: 0.96 }}
            className="btn-primary min-h-11 gap-2 rounded-[8px] px-4 py-2.5 text-sm"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Adicionar
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
