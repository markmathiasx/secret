"use client";

import { useMemo, useState } from "react";
import { Expand, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import { SafeProductImage } from "@/components/safe-product-image";
=======
import { ProductImage } from "@/components/product-image";
>>>>>>> theirs
=======
import { ProductImage } from "@/components/product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs
=======
import { SafeProductImage } from "@/components/safe-product-image";
>>>>>>> theirs

export function ProductImageGallery({ product, compact = false }: { product: Product; compact?: boolean }) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======

>>>>>>> theirs
=======

>>>>>>> theirs
=======

>>>>>>> theirs
=======

>>>>>>> theirs
  if (compact) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
        <SafeProductImage candidates={gallery[0].candidates} alt={gallery[0].alt} className="aspect-square w-full object-cover" />
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
          aria-label={`Ampliar visual de ${product.name}`}
        >
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          <SafeProductImage
            candidates={gallery[active].candidates}
            alt={gallery[active].alt}
            className="aspect-[1.08/1] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-5 py-5">
=======
=======
>>>>>>> theirs
          <div className={`relative w-full ${compact ? "aspect-square" : "aspect-[1.15/1]"}`}>
            <ProductImage src={gallery[active].src} alt={gallery[active].alt} label={`${product.name} • ${product.category}`} priority={!compact} />
          </div>
=======
          <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className={`h-full w-full object-cover ${compact ? "aspect-[1/1]" : "aspect-[1.15/1]"}`} />
>>>>>>> theirs
=======
          <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className={`h-full w-full object-cover ${compact ? "aspect-[1/1]" : "aspect-[1.15/1]"}`} />
>>>>>>> theirs
=======
          <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className={`h-full w-full object-cover ${compact ? "aspect-[1/1]" : "aspect-[1.15/1]"}`} />
>>>>>>> theirs
=======
          <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className={`h-full w-full object-cover ${compact ? "aspect-[1/1]" : "aspect-[1.15/1]"}`} />
>>>>>>> theirs
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 py-4">
>>>>>>> theirs
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">Galeria do produto</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
              <p className="mt-1 text-sm text-white/80">Foto real quando disponivel, com fallback visual premium.</p>
=======
              <p className="mt-1 text-sm text-white/80">Fotos locais quando disponíveis, com fallback visual premium</p>
>>>>>>> theirs
=======
              <p className="mt-1 text-sm text-white/80">Fotos locais quando disponíveis, com fallback visual premium</p>
>>>>>>> theirs
=======
              <p className="mt-1 text-sm text-white/80">Fotos locais quando disponíveis, com fallback visual premium</p>
>>>>>>> theirs
=======
              <p className="mt-1 text-sm text-white/80">Fotos locais quando disponíveis, com fallback visual premium</p>
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
              className={`overflow-hidden rounded-2xl border ${
                active === index ? "border-cyan-300/70" : "border-white/10"
              }`}
            >
              <SafeProductImage candidates={image.candidates} alt={image.alt} className="aspect-square w-full object-cover" />
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
              className={`relative overflow-hidden rounded-2xl border ${active === index ? "border-cyan-300/70" : "border-white/10"}`}
            >
              <div className="relative aspect-square w-full">
                <ProductImage src={image.src} alt={image.alt} label={product.name} sizes="120px" />
              </div>
>>>>>>> theirs
=======
              className={`relative overflow-hidden rounded-2xl border ${active === index ? "border-cyan-300/70" : "border-white/10"}`}
            >
<<<<<<< ours
              <div className="relative aspect-square w-full">
                <ProductImage src={image.src} alt={image.alt} label={product.name} sizes="120px" />
              </div>
>>>>>>> theirs
=======
>>>>>>> theirs
=======
              <SafeProductImage candidates={image.candidates} alt={image.alt} className="aspect-square w-full object-cover" />
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
            <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className="aspect-[1.12/1] w-full object-cover" />
=======
            <div className="relative aspect-[1.15/1] w-full">
              <ProductImage src={gallery[active].src} alt={gallery[active].alt} label={`${product.name} • ${product.category}`} sizes="100vw" />
            </div>
>>>>>>> theirs
=======
            <div className="relative aspect-[1.15/1] w-full">
              <ProductImage src={gallery[active].src} alt={gallery[active].alt} label={`${product.name} • ${product.category}`} sizes="100vw" />
            </div>
>>>>>>> theirs
=======
            <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className="aspect-[1.15/1] w-full object-cover" />
>>>>>>> theirs
=======
            <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className="aspect-[1.15/1] w-full object-cover" />
>>>>>>> theirs
=======
            <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className="aspect-[1.15/1] w-full object-cover" />
>>>>>>> theirs
=======
            <SafeProductImage candidates={gallery[active].candidates} alt={gallery[active].alt} className="aspect-[1.15/1] w-full object-cover" />
>>>>>>> theirs
            <div className="grid gap-3 border-t border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Galeria do produto</p>
                <h3 className="mt-2 text-2xl font-black text-white">{product.name}</h3>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
                <p className="mt-2 text-sm leading-7 text-white/65">
                  Use fotos reais para reforcar prova visual e mantenha o preview premium como fallback quando o ensaio local ainda nao estiver disponivel.
                </p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visoes com fallback</span>
=======
                <p className="mt-2 text-sm leading-7 text-white/65">Fotos reais locais aparecem automaticamente quando você adiciona arquivos em /public/products/&lt;slug&gt;.</p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visões com fallback</span>
>>>>>>> theirs
=======
                <p className="mt-2 text-sm leading-7 text-white/65">Fotos reais locais aparecem automaticamente quando você adiciona arquivos em /public/products/&lt;slug&gt;.</p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visões com fallback</span>
>>>>>>> theirs
=======
                <p className="mt-2 text-sm leading-7 text-white/65">Fotos reais locais aparecem automaticamente quando você adiciona arquivos em /public/products/&lt;slug&gt;.</p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visões com fallback</span>
>>>>>>> theirs
=======
                <p className="mt-2 text-sm leading-7 text-white/65">Fotos reais locais aparecem automaticamente quando você adiciona arquivos em /public/products/&lt;slug&gt;.</p>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <ImageIcon className="h-5 w-5 text-cyan-200" />
                <span className="text-sm text-white/70">3 visões com fallback</span>
>>>>>>> theirs
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
