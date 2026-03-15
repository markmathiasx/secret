import Link from "next/link";
import { buttonFamilies } from "@/components/ui/buttons";
import { ProductMediaImage } from "@/components/product-media-image";
import type { Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";

const badgeByIndex = ["Foto real", "Sob encomenda", "Personalizável", "Mais vendido", "Pronta entrega"];

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
      {products.map((product) => (
        <article key={product.id} className="group overflow-hidden rounded-[30px] border border-white/10 bg-card transition hover:-translate-y-1 hover:border-cyan-300/30">
          <div className="relative overflow-hidden">
            <ProductMediaImage
              product={product}
              className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.62))]" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/75">
                {product.collection}
              </span>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {product.productionWindow}
              </span>
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      {products.map((product, index) => (
        <article key={product.id} className="group rounded-[28px] border border-white/10 bg-card p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
          <div className="relative">
            <ProductVisual product={product} compact />
            <div className="absolute right-3 top-3">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
              <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
>>>>>>> theirs
            </div>
          </div>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
              </div>
              <span className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-right text-[11px] text-white/60">
                {product.grams} g
              </span>
            </div>

            <p className="text-sm leading-6 text-white/68">
              {typeof product.metadata.subtitle === "string" ? product.metadata.subtitle : product.description}
            </p>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="rounded-[22px] border border-emerald-400/18 bg-emerald-400/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">Pix</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Destaque</p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {typeof product.metadata.badge === "string" ? product.metadata.badge : product.collection}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/45">Pix em destaque, prazo visivel e uma selecao que mistura presente, decor e utilidade.</p>
              <Link href={getProductUrl(product)} className={buttonFamilies.secondary}>
                Ver produto
              </Link>
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
>>>>>>> theirs
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
          <p className="mt-4 text-sm leading-6 text-white/68 line-clamp-3">{product.description}</p>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">A partir de</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
              <p className="text-xs text-white/50">Prazo {product.productionWindow}</p>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
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
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
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
          </div>
        </article>
      ))}
    </div>
  );
}
