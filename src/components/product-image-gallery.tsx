"use client";

import { useMemo, useState } from "react";
import { Expand, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
import { SafeProductImage } from "@/components/safe-product-image";

export function ProductImageGallery({ product, compact = false }: { product: Product; compact?: boolean }) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = gallery[active] || gallery[0];

  if (!current) {
    return <div className="aspect-square w-full rounded-[28px] border border-white/10 bg-white/5 animate-pulse" />;
  }

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 group hover:border-cyan-300/30 transition-all duration-300">
        <SafeProductImage candidates={current.candidates} alt={current.alt} className="aspect-square w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-3 text-xs uppercase tracking-[0.16em] text-white/70 group-hover:text-white/90 transition-colors duration-300">
          {product.material} • {product.finish}
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
          className="group relative block w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/5 text-left hover:border-cyan-300/30 transition-all duration-300"
          aria-label={`Ampliar preview de ${product.name}`}
        >
          <SafeProductImage candidates={current.candidates} alt={current.alt} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/80 to-transparent px-5 py-4 text-sm text-white/75 group-hover:text-white transition-colors duration-300">
            <span className="inline-flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Galeria do produto</span>
            <span className="inline-flex items-center gap-2 text-cyan-100 group-hover:text-cyan-glow transition-colors duration-300"><Expand className="h-4 w-4" /> Ampliar</span>
          </div>
        </button>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-[20px] border transition-all duration-300 hover:scale-105 ${index === active ? "border-cyan-300/40 bg-cyan-400/10 shadow-cyan" : "border-white/10 bg-white/5 hover:border-white/20"}`}
            >
              <SafeProductImage candidates={image.candidates} alt={image.alt} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {expanded ? (
        <div className="fixed inset-0 z-[90] bg-slate-950/86 p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setExpanded(false)}>
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-slate-950 animate-scaleIn" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Galeria ampliada</p>
                <h3 className="mt-2 text-xl font-bold text-white">{product.name}</h3>
              </div>
              <button type="button" onClick={() => setExpanded(false)} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/75 hover:bg-white/10 transition-colors duration-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid flex-1 gap-0 lg:grid-cols-[1fr_280px]">
              <div className="flex items-center justify-center p-5">
                <SafeProductImage candidates={current.candidates} alt={current.alt} className="max-h-[78vh] w-auto rounded-[24px] object-contain animate-fadeInUp" />
              </div>
              <div className="border-l border-white/10 p-5">
                <div className="grid gap-3">
                  {gallery.map((image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => setActive(index)}
                      className={`overflow-hidden rounded-[20px] border transition-all duration-300 hover:scale-105 ${index === active ? "border-cyan-300/40 bg-cyan-400/10 shadow-cyan" : "border-white/10 bg-white/5 hover:border-white/20"}`}
                    >
                      <SafeProductImage candidates={image.candidates} alt={image.alt} className="aspect-square w-full object-cover" />
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
