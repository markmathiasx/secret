"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Expand, Image as ImageIcon, Sparkles, X } from "lucide-react";
import { ProductMediaImage } from "@/components/product-media-image";
import type { Product } from "@/lib/catalog";
import { getProductGallery } from "@/lib/product-images";
import { cn } from "@/lib/utils";

type ProductImageGalleryProps = {
  product: Product;
  compact?: boolean;
  overlayClassName?: string;
};

export function ProductImageGallery({ product, compact = false, overlayClassName }: ProductImageGalleryProps) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
    };
  }, [expanded]);

  const activeItem = gallery[active];
  const previewRatio = compact ? "aspect-square" : "aspect-[1.08/1]";

  return (
    <>
      <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_24px_64px_rgba(2,8,23,0.28)]">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative block w-full overflow-hidden text-left"
          aria-label={`Ampliar galeria de ${product.name}`}
        >
          <ProductMediaImage
            product={product}
            src={activeItem.src}
            alt={activeItem.alt}
            className={`${previewRatio} w-full object-cover transition duration-500 group-hover:scale-[1.02]`}
            style={{ objectPosition: activeItem.objectPosition }}
            loading="eager"
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02),rgba(2,6,23,0.72))]" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
            <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/80">
              {activeItem.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/78">
              {activeItem.isPlaceholder ? <Sparkles className="h-3.5 w-3.5 text-amber-200" /> : <ImageIcon className="h-3.5 w-3.5 text-cyan-200" />}
              {activeItem.isPlaceholder ? "Visual ilustrativo" : "Foto da peca"}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-4 py-4">
            <div className="max-w-[28rem]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">{product.collection}</p>
              <p className="mt-2 text-sm leading-6 text-white/82">{activeItem.caption}</p>
            </div>
            <span className="rounded-full border border-white/20 bg-black/30 p-2 text-white/90 transition group-hover:scale-105">
              <Expand className="h-4 w-4" />
            </span>
          </div>
        </button>

        <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid grid-cols-3 gap-3">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  "overflow-hidden rounded-[24px] border bg-black/20 text-left transition",
                  active === index ? "border-cyan-300/60 shadow-[0_0_0_1px_rgba(103,232,249,0.18)]" : "border-white/10 hover:border-white/20"
                )}
                aria-pressed={active === index}
              >
                <ProductMediaImage
                  product={product}
                  src={image.src}
                  alt={image.alt}
                  className="aspect-square w-full object-cover"
                  style={{ objectPosition: image.objectPosition }}
                  loading="lazy"
                />
                <div className="border-t border-white/10 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/48">{image.label}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">Leitura rapida</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
            <p className="mt-3 text-sm leading-7 text-white/64">{activeItem.caption}</p>
            <div className="mt-4 grid gap-2 text-sm text-white/62">
              <div className="flex items-center justify-between gap-3">
                <span>SKU</span>
                <strong className="text-white">{product.sku}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Prazo</span>
                <strong className="text-white">{product.productionWindow}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Status da midia</span>
                <strong className="text-white">{activeItem.isPlaceholder ? "Visual ilustrativo" : "Foto pronta"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          className={cn("fixed inset-0 z-[70] bg-slate-950/88 p-4 backdrop-blur-sm", overlayClassName)}
          onClick={() => setExpanded(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Galeria ampliada de ${product.name}`}
            onClick={(event) => event.stopPropagation()}
            className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,14,28,0.98),rgba(3,7,18,0.98))] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Galeria da peca</p>
                <h3 className="mt-2 text-2xl font-black text-white">{product.name}</h3>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-white/15 bg-black/35 p-2 text-white transition hover:text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                aria-label="Fechar galeria ampliada"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
              <div className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                <ProductMediaImage
                  product={product}
                  src={activeItem.src}
                  alt={activeItem.alt}
                  className="h-full min-h-[24rem] w-full object-cover"
                  style={{ objectPosition: activeItem.objectPosition }}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              <div className="flex flex-col p-5">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">{activeItem.label}</p>
                  <p className="mt-3 text-sm leading-7 text-white/70">{activeItem.caption}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
                      {product.collection}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
                      {product.theme}
                    </span>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                      {product.productionWindow}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {gallery.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActive(index)}
                      className={cn(
                        "grid gap-3 rounded-[24px] border p-3 text-left transition md:grid-cols-[7rem_minmax(0,1fr)]",
                        active === index ? "border-cyan-300/50 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <ProductMediaImage
                        product={product}
                        src={image.src}
                        alt={image.alt}
                        className="aspect-square w-full rounded-[20px] object-cover"
                        style={{ objectPosition: image.objectPosition }}
                        loading="lazy"
                      />
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">{image.label}</p>
                        <p className="mt-2 text-sm leading-6 text-white/68">{image.caption}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-auto rounded-[28px] border border-white/10 bg-black/20 p-4 text-sm text-white/64">
                  A galeria continua bonita mesmo quando a foto final ainda nao entrou. O visual ilustrativo protege a experiencia da loja sem quebrar a compra.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
