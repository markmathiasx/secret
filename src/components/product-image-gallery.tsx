"use client";

import { useMemo, useState } from "react";
import { Expand, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
import { SafeProductImage } from "@/components/safe-product-image";

export function ProductImageGallery({ product, compact = false }: { product: Product; compact?: boolean }) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  const hasRealPhoto = Boolean(resolvedSrc?.includes("/products/"));

  if (compact) {
    return (
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
        <SafeProductImage
          candidates={gallery[0].candidates}
          alt={gallery[0].alt}
          className="aspect-square w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          onResolved={setResolvedSrc}
        />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block w-full overflow-hidden text-left"
          aria-label={`Ampliar galeria de ${product.name}`}
        >
          <SafeProductImage
            candidates={gallery[active].candidates}
            alt={gallery[active].alt}
            className="aspect-square w-full object-cover md:aspect-[1.08/1]"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
            onResolved={setResolvedSrc}
          />

          <span
            className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-[11px] font-semibold ${
              hasRealPhoto
                ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50"
                : "border-white/15 bg-black/45 text-white/80"
            }`}
          >
            {hasRealPhoto ? "Foto real" : "Preview conceitual"}
          </span>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Galeria local</p>
              <p className="mt-1 text-sm text-white/80">Visual do produto com fallback premium quando a foto real ainda nao existe.</p>
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
              className={`overflow-hidden rounded-2xl border ${
                active === index ? "border-cyan-300/70" : "border-white/10"
              }`}
            >
              <SafeProductImage
                candidates={image.candidates}
                alt={image.alt}
                className="aspect-square w-full object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      </div>

      {expanded ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Visual ampliado</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{product.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70"
                aria-label="Fechar galeria"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <SafeProductImage
                candidates={gallery[active].candidates}
                alt={gallery[active].alt}
                className="aspect-square w-full rounded-[24px] object-cover md:aspect-[1.6/1]"
                sizes="100vw"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
