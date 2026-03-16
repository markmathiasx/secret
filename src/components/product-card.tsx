import Link from "next/link";
import type { Product, ProductBadge } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { ProductImage } from "@/components/product-image";
import { formatCurrency } from "@/lib/utils";
import { getPrimaryProductImage } from "@/lib/product-media";

const badgeStyles: Record<ProductBadge, string> = {
  "Mais vendido": "border-amber-300/25 bg-amber-300/10 text-amber-100",
  "Foto real": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  "Personalizável": "border-violet-300/25 bg-violet-300/10 text-violet-100",
  "Sob encomenda": "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  "Pronta entrega": "border-rose-300/25 bg-rose-300/10 text-rose-100"
};

export function ProductCard({ product }: { product: Product }) {
  const image = getPrimaryProductImage(product);

  return (
    <article className="group rounded-[30px] border border-white/10 bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {product.badges.map((badge) => (
            <span key={badge} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${badgeStyles[badge]}`}>
              {badge}
            </span>
          ))}
        </div>
        <FavoriteToggle productId={product.id} compact />
      </div>

      <Link href={getProductUrl(product)} className="block">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
          <ProductImage
            src={image.src}
            fallbackSrcs={image.fallbackSrcs}
            alt={image.alt}
            containerClassName="aspect-[1.02/1]"
            imageClassName="transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">{product.category}</p>
          <h3 className="mt-2 text-xl font-bold text-white">{product.name}</h3>
          <p className="mt-2 text-sm leading-6 text-white/62">{product.description}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/65">{product.productionWindow}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/62">
        <span className="rounded-full border border-white/10 px-3 py-1">{product.material}</span>
        <span className="rounded-full border border-white/10 px-3 py-1">{product.finish}</span>
        <span className="rounded-full border border-white/10 px-3 py-1">{product.visualLabel}</span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-white/45">A partir de</p>
          <p className="text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
        </div>
        <Link
          href={getProductUrl(product)}
          className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/18"
        >
          Ver produto
        </Link>
      </div>
    </article>
  );
}
