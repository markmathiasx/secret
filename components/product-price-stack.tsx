"use client";

import type { Product } from "@/lib/catalog";
import {
  FIXED_MARGIN_BADGE_LABEL,
  LOCAL_PRODUCTION_BADGE_LABEL,
} from "@/lib/pricing-engine";
import { formatCurrency } from "@/lib/utils";

function getReferencePrice(product: Product) {
  return Math.max(product.marketplaceSuggested || 0, product.priceCard, product.pricePix);
}

export function ProductPriceStack({
  product,
  label = "Preço no Pix",
  compact = false,
  showInstallments = true,
}: {
  product: Product;
  label?: string;
  compact?: boolean;
  showInstallments?: boolean;
}) {
  const referencePrice = getReferencePrice(product);
  const savings = Math.max(0, referencePrice - product.pricePix);
  const productionLeadTime = product.printTime || product.productionWindow || "sob consulta";

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.16em] text-white/45">{label}</p>
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-sm font-medium text-white/30 line-through">
          {formatCurrency(referencePrice)}
        </span>
        <span className={compact ? "text-[1.55rem] font-black leading-none text-white" : "text-3xl font-black leading-none text-white"}>
          {formatCurrency(product.pricePix)}
        </span>
      </div>
      {savings > 0 ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
          Economia no Pix {formatCurrency(savings)}
        </div>
      ) : null}
      {showInstallments ? (
        <p className="text-xs text-white/55">Cartão + R$ 1: {formatCurrency(product.priceCard)}</p>
      ) : null}
      <p className="text-xs text-white/55">Prazo de produção: {productionLeadTime}</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
          {FIXED_MARGIN_BADGE_LABEL}
        </span>
        <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">
          {LOCAL_PRODUCTION_BADGE_LABEL}
        </span>
        {product.readyToShip ? (
          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-100">
            Pronta entrega
          </span>
        ) : null}
      </div>
    </div>
  );
}
