"use client";

import type { Product } from "@/lib/catalog";
import { getProductVisual } from "@/lib/product-visuals";

export function ProductVisualBadge({ product, className = "" }: { product: Product; className?: string }) {
  const visual = getProductVisual(product);

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${visual.badgeClassName} ${className}`.trim()}
    >
      {visual.label}
    </span>
  );
}

export function ProductVisualNotice({ product }: { product: Product }) {
  const visual = getProductVisual(product);

  return (
    <div className={`rounded-[24px] border p-4 text-sm leading-7 ${visual.panelClassName}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-80">Como ler esta imagem</p>
      <p className="mt-2 font-semibold text-white">{visual.label}</p>
      <p className="mt-2 opacity-90">{visual.description}</p>
      {visual.note ? <p className="mt-2 opacity-90">{visual.note}</p> : null}
    </div>
  );
}
