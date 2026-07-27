"use client";

import { BadgeCheck, Lock, Package, RotateCcw, ShieldCheck, ShoppingBag, Star, Zap } from "lucide-react";
import type { ProductAvailabilityMode } from "@/lib/product-availability";

export function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-2 py-2">
      {(
        [
          [Lock, "Pagamento seguro"],
          [Package, "Entrega rastreada"],
          [RotateCcw, "Garantia 30 dias"],
          [ShieldCheck, "Compra protegida"],
        ] as const
      ).map(([Icon, text]) => (
        <span
          key={text}
          className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-white/72"
        >
          <Icon className="h-3.5 w-3.5 text-cyan-300/80" />
          {text}
        </span>
      ))}
    </div>
  );
}

export function ProductSocialProof({
  productId,
  averageRating,
  reviewCount,
  soldTotal,
  soldLast30Days,
  stockLevel,
  availabilityMode,
  protectedPurchaseHref = "/trocas-e-devolucoes",
}: {
  productId: string;
  averageRating?: number | null;
  reviewCount?: number;
  soldTotal?: number;
  soldLast30Days?: number;
  stockLevel: number;
  availabilityMode?: ProductAvailabilityMode;
  protectedPurchaseHref?: string;
}) {
  void productId;
  const normalizedAvailability = availabilityMode || (stockLevel > 0 ? "in_stock" : "made_to_order");
  const isLowStock = normalizedAvailability === "in_stock" && stockLevel > 0 && stockLevel <= 5;
  const isMadeToOrder = normalizedAvailability === "made_to_order";
  const isOutOfStock = normalizedAvailability === "out_of_stock";
  const hasReviews =
    typeof reviewCount === "number" && reviewCount > 0 && typeof averageRating === "number";
  const recentSales =
    typeof soldLast30Days === "number" && soldLast30Days > 0 ? soldLast30Days : 0;
  const totalSales = typeof soldTotal === "number" && soldTotal > 0 ? soldTotal : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {hasReviews ? (
        <span className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
          <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
          {averageRating!.toFixed(1)}★ em {reviewCount} avaliações
        </span>
      ) : (
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60">
          <BadgeCheck className="h-3.5 w-3.5" />
          Avaliações em andamento
        </span>
      )}

      {recentSales > 0 ? (
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
          <ShoppingBag className="h-3.5 w-3.5" />
          {recentSales}+ pedidos nos últimos 30 dias
        </span>
      ) : totalSales > 0 ? (
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
          <ShoppingBag className="h-3.5 w-3.5" />
          {totalSales}+ pedidos concluídos
        </span>
      ) : null}

      {isLowStock && (
        <span className="flex items-center gap-1.5 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
          <Zap className="h-3.5 w-3.5" />
          Últimas {stockLevel} unidades
        </span>
      )}
      {isMadeToOrder && (
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60">
          Sob encomenda
        </span>
      )}
      {isOutOfStock && (
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60">
          Sem estoque no momento
        </span>
      )}

      <a
        href={protectedPurchaseHref}
        className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:border-emerald-300/35"
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Compra protegida
      </a>
    </div>
  );
}
