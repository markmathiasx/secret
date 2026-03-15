import Link from "next/link";
import { ProductMediaImage } from "@/components/product-media-image";
import type { Product } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { getProductUrl } from "@/lib/catalog";

export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
            </div>
          </div>

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

            <p className="text-sm leading-6 text-white/68">{product.description}</p>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <div className="rounded-[22px] border border-emerald-400/18 bg-emerald-400/10 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">Pix</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Midia</p>
                <p className="mt-2 text-sm font-semibold text-white">{product.imageStatus === "imported" ? "Imagem local" : "Preview premium"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/45">Valor competitivo para compra rápida e personalização</p>
              <Link href={getProductUrl(product)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">
                Ver produto
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
