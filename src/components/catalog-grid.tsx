"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
<<<<<<< ours
=======
import { formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/product-visual";
import { SafeProductImage } from "@/components/safe-product-image";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
import { getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";
<<<<<<< ours
<<<<<<< ours
import { SafeProductImage } from "@/components/safe-product-image";
import { formatCurrency } from "@/lib/utils";
import { getCommercialCategory } from "@/lib/constants";

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const isRealPhoto = useMemo(() => Boolean(resolvedSrc?.includes("/products/")), [resolvedSrc]);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10">
      <SafeProductImage
        product={product}
        alt={product.name}
        className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        onResolved={setResolvedSrc}
      />
      <span
        className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${
          isRealPhoto
            ? "border-emerald-300/35 bg-emerald-400/20 text-emerald-50"
            : "border-white/15 bg-black/50 text-white/80"
        }`}
      >
        {isRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
      <div className="absolute right-3 top-3">
        <FavoriteButton productId={product.id} />
      </div>
    </div>
  );
}
=======

const badgeByIndex = ["Foto real", "Sob encomenda", "Personalizável", "Mais vendido", "Pronta entrega"];
>>>>>>> theirs

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const isRealPhoto = useMemo(() => Boolean(resolvedSrc?.includes("/products/")), [resolvedSrc]);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10">
      <SafeProductImage product={product} alt={product.name} className="aspect-square w-full object-cover" onResolved={setResolvedSrc} />
      <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${isRealPhoto ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-50" : "border-white/20 bg-black/45 text-white/80"}`}>
        {isRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
    </div>
  );
}

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const isRealPhoto = useMemo(() => Boolean(resolvedSrc?.includes("/products/")), [resolvedSrc]);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10">
      <SafeProductImage product={product} alt={product.name} className="aspect-square w-full object-cover" onResolved={setResolvedSrc} />
      <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${isRealPhoto ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-50" : "border-white/20 bg-black/45 text-white/80"}`}>
        {isRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
    </div>
  );
}

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const isRealPhoto = useMemo(() => Boolean(resolvedSrc?.includes("/products/")), [resolvedSrc]);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10">
      <SafeProductImage product={product} alt={product.name} className="aspect-square w-full object-cover" onResolved={setResolvedSrc} />
      <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${isRealPhoto ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-50" : "border-white/20 bg-black/45 text-white/80"}`}>
        {isRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
    </div>
  );
}

function ProductCardImage({ product }: { product: Product }) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const isRealPhoto = useMemo(() => Boolean(resolvedSrc?.includes("/products/")), [resolvedSrc]);

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10">
      <SafeProductImage product={product} alt={product.name} className="aspect-square w-full object-cover" onResolved={setResolvedSrc} />
      <span className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[11px] font-semibold ${isRealPhoto ? "border-emerald-300/40 bg-emerald-300/20 text-emerald-50" : "border-white/20 bg-black/45 text-white/80"}`}>
        {isRealPhoto ? "Foto real" : "Preview conceitual"}
      </span>
    </div>
  );
}
=======

const badgeByIndex = ["Foto real", "Sob encomenda", "Personalizável", "Mais vendido", "Pronta entrega"];
>>>>>>> theirs

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
<<<<<<< ours
<<<<<<< ours
      {products.map((product) => {
        const commercialCategory = getCommercialCategory(product.category);
        const stockLabel = product.grams <= 120 ? "Pronta entrega" : "Sob encomenda";

        return (
          <article
            key={product.id}
            className="group rounded-[30px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/25"
          >
            <ProductCardImage product={product} />

            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">{commercialCategory}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                {product.productionWindow}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                product.featured ? "Mais vendido" : stockLabel,
                "Personalizavel",
                "PLA premium"
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-white/80"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/70">
              <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">PLA</div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.grams} g</div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{stockLabel}</div>
=======
      {products.map((product, index) => (
        <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
      {products.map((product, index) => (
        <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
>>>>>>> theirs
          <div className="relative">
            <ProductVisual product={product} compact />
            <div className="absolute right-3 top-3">
              <FavoriteButton productId={product.id} />
            </div>
<<<<<<< ours
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <ProductCardImage product={product} />

          <div className="mt-4">
            <ProductVisual product={product} compact />
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
>>>>>>> theirs
            </div>

<<<<<<< ours
            <p className="mt-4 min-h-[72px] text-sm leading-6 text-white/68">{product.description}</p>

            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-white/45">A partir de</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
                <p className="text-xs text-white/50">Pix • prazo {product.productionWindow}</p>
              </div>
              <Link
                href={getProductUrl(product)}
                className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
              >
                Ver produto
              </Link>
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
          <p className="mt-4 text-sm leading-6 text-white/68 line-clamp-3">{product.description}</p>
=======
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              product.featured ? "Mais vendido" : "Sob encomenda",
              "Personalizável",
              product.grams < 130 ? "Pronta entrega" : "Produção programada"
            ].map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-white/80">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">PLA</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.grams} g</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.productionWindow}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              product.featured ? "Mais vendido" : "Sob encomenda",
              "Personalizável",
              product.grams < 130 ? "Pronta entrega" : "Produção programada"
            ].map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-white/80">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">PLA</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.grams} g</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.productionWindow}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              product.featured ? "Mais vendido" : "Sob encomenda",
              "Personalizável",
              product.grams < 130 ? "Pronta entrega" : "Produção programada"
            ].map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-white/80">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">PLA</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.grams} g</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.productionWindow}</div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[
              product.featured ? "Mais vendido" : "Sob encomenda",
              "Personalizável",
              product.grams < 130 ? "Pronta entrega" : "Produção programada"
            ].map((label) => (
              <span key={label} className="rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[11px] text-white/80">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-white/70">
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">PLA</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.grams} g</div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-2 text-center">{product.productionWindow}</div>
          </div>

<<<<<<< ours
          <p className="mt-4 text-sm leading-6 text-white/68">{product.description}</p>
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/68 line-clamp-3">{product.description}</p>
>>>>>>> theirs

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">A partir de</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
              <p className="text-xs text-white/50">Prazo {product.productionWindow}</p>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
            </div>
          </article>
        );
      })}
    </div>
  );
}
