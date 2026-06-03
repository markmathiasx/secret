"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, Expand, Image as ImageIcon, X } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { getProductVisual } from "@/lib/product-visuals";
import { validateProductMedia } from "@/lib/media-validation";

const compactCardSizes =
  "(min-width: 1536px) 23vw, (min-width: 1280px) 31vw, (min-width: 640px) 48vw, 96vw";
const expandedMainSizes =
  "(min-width: 1024px) 68vw, (min-width: 640px) 88vw, 96vw";
const thumbSizes = "(min-width: 1024px) 84px, 25vw";

export function ProductImageGallery({
  product,
  compact = false,
  priority = false,
}: {
  product: Product;
  compact?: boolean;
  priority?: boolean;
}) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const visual = useMemo(() => getProductVisual(product), [product]);
  const mediaRecord = useMemo(() => validateProductMedia(product), [product]);
  const isConceptual = visual.kind === "imagem-conceitual";
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const current = gallery[active] || gallery[0];
  if (!current) {
    return <div className="aspect-square w-full rounded-[28px] border border-white/10 bg-white/5 animate-pulse" />;
  }
  if (compact) {
    return (
      <div className="group/gallery overflow-hidden rounded-[20px] border border-white/10 bg-white/5 transition-all duration-500 hover:border-cyan-300/45 hover:shadow-xl hover:shadow-cyan-400/20">
        <div className="relative">
          <SafeProductImage
            candidates={current.candidates}
            alt={current.alt}
            className="aspect-square w-full object-cover transition-transform duration-700 group-hover/gallery:scale-110"
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            sizes={compactCardSizes}
          />
          {isConceptual && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-amber-950/80 via-amber-950/40 to-transparent px-3 pb-2.5 pt-8">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-300/90 shrink-0" />
              <span className="text-[10px] font-medium tracking-wide text-amber-100/90">Imagem ilustrativa — não representa o produto final</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
            <span
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm ${
                visual.kind === "imagem-conceitual"
                  ? "border-amber-300/25 bg-amber-300/12 text-amber-50"
                  : "border-emerald-300/25 bg-emerald-300/12 text-emerald-50"
              }`}
            >
              {visual.label}
            </span>
            <span className="rounded-full border border-black/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85">
              {product.readyToShip ? "Pronta entrega" : "Sob encomenda"}
            </span>
          </div>
        </div>
        <div className="border-t border-white/10 bg-slate-950/75 px-4 py-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="truncate uppercase tracking-[0.16em] text-white/80 font-medium">{product.material} • {product.finish}</p>
              <p className="mt-1 line-clamp-1 text-[11px] text-white/55">
                {isConceptual ? "Imagem conceitual — peça final pode variar em forma, cor e acabamento." : "Mídia validada ou prévia técnica do produto."}
              </p>
            </div>
            <ProductVisualBadge product={product} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="space-y-4" data-testid="product-image-gallery">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          data-testid="product-image-gallery-main"
          className="group relative block w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/5 text-left transition-all duration-300 hover:border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-400/10"
        >
          <SafeProductImage
            candidates={current.candidates}
            alt={current.alt}
            className="aspect-square w-full object-cover transition duration-300"
            priority
            fetchPriority="high"
            sizes={expandedMainSizes}
          />
          {isConceptual && (
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-amber-950/80 via-amber-950/40 to-transparent px-5 pb-4 pt-10 pointer-events-none">
              <AlertTriangle className="h-4 w-4 text-amber-300/90 shrink-0" />
              <span className="text-xs font-medium text-amber-100/90">Imagem ilustrativa — não representa fielmente o produto final</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-slate-950/78 px-5 py-4">
            <div className="flex flex-col">
              <span className="text-sm text-white/90 font-medium">{product.name}</span>
              <span className="text-xs text-cyan-200 uppercase tracking-wide">{product.material} • {product.finish}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-100 group-hover:text-cyan-glow transition-colors duration-300">
              <ProductVisualBadge product={product} />
              <ImageIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Galeria</span>
              <Expand className="h-4 w-4" />
            </div>
          </div>
        </button>
        <div className={`grid gap-3 ${gallery.length <= 4 ? "grid-cols-3" : "grid-cols-4"}`}>
          {gallery.slice(1, 4).map((image, index) => {
            const galleryIndex = index + 1;
            return (
            <button
              type="button"
              key={image.id}
              onClick={() => setActive(galleryIndex)}
              data-testid="product-image-gallery-thumb"
              className={`overflow-hidden rounded-[20px] border transition-all duration-300 hover:scale-105 ${
                galleryIndex === active ? "border-cyan-300/40 bg-cyan-400/10 shadow-cyan" : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <SafeProductImage
                candidates={image.candidates}
                alt={image.alt}
                className="aspect-square w-full object-cover"
                priority={priority || galleryIndex <= 3}
                fetchPriority={priority || galleryIndex <= 3 ? "high" : "auto"}
                sizes={thumbSizes}
              />
            </button>
            );
          })}
          {gallery.length > 4 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center justify-center overflow-hidden rounded-[20px] border border-white/10 bg-white/5 transition-all duration-300 hover:scale-105 hover:border-cyan-300/30"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-bold text-white/80">+{gallery.length - 4}</span>
                <span className="text-[10px] uppercase tracking-wider text-white/50">fotos</span>
              </div>
            </button>
          )}
        </div>
      </div>
      {expanded ? (
        <div
          className="fixed inset-0 z-[90] bg-slate-950/86 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setExpanded(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setExpanded(false);
            if (event.key === "ArrowRight") setActive((prev) => (prev + 1) % gallery.length);
            if (event.key === "ArrowLeft") setActive((prev) => (prev - 1 + gallery.length) % gallery.length);
          }}
          tabIndex={0}
          role="dialog"
          aria-label="Galeria de imagens ampliada"
        >
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
                <SafeProductImage
                  candidates={current.candidates}
                  alt={current.alt}
                  className="max-h-[78vh] w-auto rounded-[24px] object-contain animate-fadeInUp"
                  priority
                  fetchPriority="high"
                  sizes={expandedMainSizes}
                />
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
                        sizes={thumbSizes}
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
