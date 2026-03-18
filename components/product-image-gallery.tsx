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
      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/5 transition-all duration-300 hover:border-cyan-300/30 hover:shadow-lg hover:shadow-cyan-400/10">
        <SafeProductImage candidates={current.candidates} alt={current.alt} className="aspect-square w-full object-cover transition-transform duration-300" />
        <div className="border-t border-white/10 bg-slate-950/75 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="uppercase tracking-[0.16em] text-white/80 font-medium">{product.material}</span>
            <span className="text-cyan-200 font-semibold">{product.finish}</span>
          </div>
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
          className="group block w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/5 text-left transition-all duration-300 hover:border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-400/10"
        >
          <SafeProductImage candidates={current.candidates} alt={current.alt} className="aspect-square w-full object-cover transition duration-300" />
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-slate-950/78 px-5 py-4">
            <div className="flex flex-col">
              <span className="text-sm text-white/90 font-medium">{product.name}</span>
              <span className="text-xs text-cyan-200 uppercase tracking-wide">{product.material} • {product.finish}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-100 group-hover:text-cyan-glow transition-colors duration-300">
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Galeria</span>
              <Expand className="h-4 w-4" />
            </div>
          </div>
        </button>
        <div className="grid grid-cols-3 gap-3">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActive(index)}
              className={`overflow-hidden rounded-[20px] border transition-all duration-300 hover:scale-105 ${
                index === active ? "border-cyan-300/40 bg-cyan-400/10 shadow-cyan" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
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
                      className={`flex items-center gap-3 rounded-[18px] border p-3 text-left transition-colors duration-200 ${
                        index === active ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <SafeProductImage
                        candidates={image.candidates}
                        alt={image.alt}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{product.name} #{index + 1}</p>
                        <p className="text-xs text-white/60">{image.alt}</p>
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
