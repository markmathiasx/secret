"use client";

import type { Product } from "@/lib/catalog";
import { getProductVisual } from "@/lib/product-visuals";
import { validateProductMedia, isPublicSafe, isHeroEligible } from "@/lib/media-validation";

export function ProductVisualBadge({ product, className = "" }: { product: Product; className?: string }) {
  const visual = getProductVisual(product);
  const mediaRecord = validateProductMedia(product);
  const heroEligible = isHeroEligible(mediaRecord.status, mediaRecord.gallery.length);

  // Use media validation status for more nuanced badge
  const badgeLabel = mediaRecord.status === "verified"
    ? heroEligible
      ? "Foto real"
      : "Verificada"
    : mediaRecord.status === "render-verified"
      ? heroEligible
        ? "Render fiel"
        : "Render validado"
      : mediaRecord.status === "probable"
        ? "Imagem provável"
        : mediaRecord.status === "needs_review"
          ? "Em revisão"
          : "Ilustrativa";

  const badgeClass = isHeroEligible(mediaRecord.status, mediaRecord.gallery.length)
    ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
    : isPublicSafe(mediaRecord.status)
      ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
      : "border-amber-300/25 bg-amber-300/10 text-amber-100";

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${badgeClass} ${className}`.trim()}
    >
      {badgeLabel}
    </span>
  );
}

export function ProductVisualNotice({ product }: { product: Product }) {
  const visual = getProductVisual(product);
  const mediaRecord = validateProductMedia(product);
  const isSafe = isPublicSafe(mediaRecord.status);

  return (
    <div className={`rounded-[24px] border p-4 text-sm leading-7 ${visual.panelClassName}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-80">Como ler esta imagem</p>
      <p className="mt-2 font-semibold text-white">{visual.label}</p>
      <p className="mt-2 opacity-90">{visual.description}</p>
      {visual.note ? <p className="mt-2 opacity-90">{visual.note}</p> : null}
      {mediaRecord.reviewNote && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-xs ${
            isSafe
              ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
              : "border border-amber-400/20 bg-amber-400/10 text-amber-200"
          }`}
        >
          {mediaRecord.reviewNote}
        </p>
      )}
    </div>
  );
}
