"use client";

import { useEffect, useMemo, useState } from "react";
import { Expand, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
import { SafeProductImage } from "@/components/safe-product-image";

function getVisualChip(product: Product) {
  if (product.realPhoto) {
    return {
      compact: "Foto real",
      full: "Foto real da peça",
      className: "bg-white/95 text-slate-800",
    };
  }

  return {
    compact: "Imagem conceitual",
    full: "Imagem conceitual da peça",
    className: "bg-violet-100/95 text-violet-900",
  };
}

export function ProductImageGallery({ product, compact = false }: { product: Product; compact?: boolean }) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = gallery[active] || gallery[0];
  const visualChip = getVisualChip(product);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  if (!current) {
    return <div className="aspect-[4/5] w-full rounded-[28px] border border-[#eadcc8] bg-white/70 animate-pulse" />;
  }

  if (compact) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[#eadcc8] bg-[linear-gradient(180deg,#fffdf9_0%,#fff4e5_100%)] p-3 shadow-[0_22px_48px_rgba(15,23,42,0.08)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f7ebdc_55%,#f2e3d1_100%)]">
          <SafeProductImage candidates={current.candidates} alt={current.alt} className="w-full object-contain p-3 md:p-4" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${visualChip.className}`}>
              {visualChip.compact}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {product.status}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>{product.material}</span>
          <span>{product.finish}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block w-full overflow-hidden rounded-[32px] border border-[#eadcc8] bg-[linear-gradient(180deg,#fffdf9_0%,#fff3e2_100%)] p-4 text-left shadow-[0_26px_64px_rgba(15,23,42,0.10)] transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7ebdc_55%,#f0dfcb_100%)]">
            <SafeProductImage candidates={current.candidates} alt={current.alt} className="w-full object-contain p-4 md:p-6" priority />
          </div>

          <div className="absolute left-7 top-7 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${visualChip.className}`}>
              {visualChip.full}
            </span>
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {product.status}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-white via-white/92 to-transparent px-6 py-5">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">{product.name}</span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {product.material} • {product.finish}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 transition-colors duration-300 group-hover:text-slate-900">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">Ampliar</span>
              <Expand className="h-4 w-4" />
            </div>
          </div>
        </button>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-[22px] border p-2 transition-all duration-300 ${
                index === active
                  ? "border-orange-400 bg-[#fff3df] shadow-[0_16px_32px_rgba(249,115,22,0.18)]"
                  : "border-[#eadcc8] bg-white hover:border-slate-300"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f5e7d6_100%)]">
                <SafeProductImage candidates={image.candidates} alt={image.alt} className="w-full object-contain p-2" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria ampliada de ${product.name}`}
          className="fixed inset-0 z-[90] bg-slate-950/72 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setExpanded(false)}
        >
          <div
            className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[36px] border border-[#eadcc8] bg-[#fff8ef] animate-scaleIn"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#eadcc8] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Galeria do produto</p>
                <h3 className="mt-2 text-xl font-black text-slate-900">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Fechar galeria"
                className="rounded-full border border-[#eadcc8] bg-white p-2 text-slate-700 transition-colors duration-300 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 gap-0 lg:grid-cols-[1fr_300px]">
              <div className="flex items-center justify-center p-5">
                <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f1e1cd_100%)]">
                  <SafeProductImage candidates={current.candidates} alt={current.alt} className="h-full w-full object-contain p-5 md:p-8" priority />
                </div>
              </div>

              <div className="border-l border-[#eadcc8] bg-white/60 p-5">
                <div className="grid gap-3">
                  {gallery.map((image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => setActive(index)}
                      className={`flex items-center gap-3 rounded-[18px] border p-3 text-left transition-colors duration-200 ${
                        index === active ? "border-orange-400 bg-[#fff1de]" : "border-[#eadcc8] bg-white hover:bg-[#fff6ea]"
                      }`}
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-[14px] bg-[radial-gradient(circle_at_top,#fffdf9_0%,#f5e7d6_100%)]">
                        <SafeProductImage candidates={image.candidates} alt={image.alt} className="h-full w-full object-contain p-2" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{image.alt}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
