"use client";
import { Eye, ShoppingBag, Zap } from "lucide-react";
import { useEffect, useState } from "react";

function getViewerCount(productId: string): number {
  const seed = productId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return 3 + (seed % 12);
}

export function ProductSocialProof({
  productId,
  stockLevel,
  soldThisMonth,
}: {
  productId: string;
  stockLevel: number;
  soldThisMonth?: number;
}) {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    setViewers(getViewerCount(productId));
    const interval = setInterval(() => {
      setViewers((v) => Math.max(2, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 30_000);
    return () => clearInterval(interval);
  }, [productId]);

  const isLowStock = stockLevel > 0 && stockLevel <= 5;
  const isOutOfStock = stockLevel <= 0;

  return (
    <div className="flex flex-wrap gap-2">
      {viewers > 0 && (
        <span className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
          <Eye className="h-3.5 w-3.5" />
          {viewers} pessoas vendo agora
        </span>
      )}
      {soldThisMonth && soldThisMonth > 0 ? (
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
          <ShoppingBag className="h-3.5 w-3.5" />
          {soldThisMonth}+ vendidos no mês
        </span>
      ) : null}
      {isLowStock && (
        <span className="flex items-center gap-1.5 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-semibold text-rose-100">
          <Zap className="h-3.5 w-3.5" />
          Últimas {stockLevel} unidades
        </span>
      )}
      {isOutOfStock && (
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60">
          Sob encomenda
        </span>
      )}
    </div>
  );
}
