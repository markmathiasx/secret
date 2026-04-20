"use client";

import { useRef, useState, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";
import { SafeProductImage } from "@/components/safe-product-image";

export function ImageZoomModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoom <= 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOrigin(`${x}% ${y}%`);
    },
    [zoom]
  );

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/85 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-label="Visualizar imagem ampliada"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/80 transition hover:bg-white/10"
        aria-label="Fechar zoom"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoom(1); }}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            zoom === 1 ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100" : "border-white/15 bg-black/50 text-white/70"
          }`}
        >
          1x
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoom(2); }}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            zoom === 2 ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100" : "border-white/15 bg-black/50 text-white/70"
          }`}
        >
          2x
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setZoom(3); }}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
            zoom === 3 ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100" : "border-white/15 bg-black/50 text-white/70"
          }`}
        >
          3x
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMove}
        style={{ cursor: zoom > 1 ? "zoom-out" : "zoom-in" }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: origin,
            transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
          }}
          onClick={() => setZoom((z) => (z >= 3 ? 1 : z + 1))}
        >
          <SafeProductImage
            candidates={[src]}
            alt={alt}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        </div>
      </div>
    </div>
  );
}

export function ZoomTrigger({
  src,
  alt,
  children,
  className = "",
}: {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`group relative cursor-zoom-in ${className}`}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-label="Clique para ampliar"
      >
        {children}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/60 opacity-0 transition group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </div>
      </div>
      {open ? <ImageZoomModal src={src} alt={alt} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
