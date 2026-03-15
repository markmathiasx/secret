"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { SafeProductImage } from "@/components/safe-product-image";
import { FavoriteButton } from "@/components/favorite-button";
import { formatCurrency } from "@/lib/utils";

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const hasRealPhoto = Boolean(resolvedSrc?.includes("/products/"));

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/30">
      <SafeProductImage
        product={product}
        alt={product.name}
        className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        onResolved={setResolvedSrc}
      />
      <span
        className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${
          hasRealPhoto
            ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-50"
            : "border-white/15 bg-black/45 text-white/80"
        }`}
      >
        {hasRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
    </div>
  );
}

function buildBadges(product: Product, hasRealPhoto: boolean) {
  return [
    hasRealPhoto ? "Foto real" : "Preview conceitual",
    product.featured ? "Mais vendido" : product.readyToShip ? "Pronta entrega" : "Sob encomenda",
    "Personalizavel",
    product.material
  ];
}

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          className="group rounded-[30px] border border-white/10 bg-card p-5 transition duration-300 hover:-translate-y-1.5 hover:border-cyan-300/35"
        >
          <div className="relative">
            <ProductCardImage product={product} />
            <div className="absolute right-3 top-3">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/85">{product.category}</p>
              <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">{product.name}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/60">
              {product.productionWindow}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {buildBadges(product, product.readyToShip).map((label) => (
              <span
                key={`${product.id}-${label}`}
                className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/78"
              >
                {label}
              </span>
            ))}
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/66">{product.description}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] text-white/70">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="font-semibold text-white">{product.material}</div>
              <div>Material</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="font-semibold text-white">{product.finish}</div>
              <div>Acabamento</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2">
              <div className="font-semibold text-white">{product.grams} g</div>
              <div>Peso</div>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">A partir de</p>
              <p className="text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              <p className="text-xs text-white/55">Pix ou atendimento assistido</p>
            </div>
            <Link
              href={getProductUrl(product)}
              className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
            >
              Ver produto
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
