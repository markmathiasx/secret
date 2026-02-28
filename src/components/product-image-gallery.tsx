"use client";

import { useMemo, useState } from "react";
import { Expand, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";

export function ProductImageGallery({ product, compact = false }: { product: Product; compact?: boolean }) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block w-full overflow-hidden text-left"
          aria-label={`Ampliar preview de ${product.name}`}
        >
          <img src={gallery[active].src} alt={gallery[active].alt} className={`h-full w-full object-cover ${compact ? "aspect-[1/1]" : "aspect-[1.15/1]"}`} />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Preview do catálogo</p>
              <p className="mt-1 text-sm text-white/80">Imagem local inclusa no projeto</p>
            </div>
            <span className="rounded-full border border-white/20 bg-black/30 p-2 text-white/90 transition group-hover:scale-105">
              <Expand className="h-4 w-4" />
            </span>
          </div>
        </button>

        <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
          {gallery.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-2xl border ${active === index ? "border-cyan-300/70" : "border-white/10"}`}
            >
              <img src={image.src} alt={image.alt} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {expanded ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-2xl">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/35 p-2 text-white"
              aria-label="Fechar preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={gallery[active].src} alt={gallery[active].alt} className="aspect-[1.15/1] w-full object-cover" />
            <div className="grid gap-3 border-t border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Galeria do produto</p>
                <h3 className="mt-2 text-2xl font-black text-white">{product.name}</h3>
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Preview do catálogo incluso no projeto para não deixar itens sem visual. Você pode trocar depois por foto real, render ou mídia própria.
                </p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visões locais</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
