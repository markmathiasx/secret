import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/product-visual";
import { getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";

const badgeByIndex = ["Foto real", "Sob encomenda", "Personalizável", "Mais vendido", "Pronta entrega"];

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">{product.productionWindow}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-100">{badgeByIndex[index % badgeByIndex.length]}</span>
            <span className="rounded-full border border-white/15 bg-black/30 px-2 py-1 text-[11px] text-white/75">Material PLA Premium</span>
          </div>

          <p className="mt-4 text-sm leading-6 text-white/68 line-clamp-3">{product.description}</p>

          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-white/45">A partir de</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(product.pricePix)}</p>
              <p className="text-xs text-white/50">Prazo {product.productionWindow}</p>
            </div>
            <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">
              Ver produto
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
