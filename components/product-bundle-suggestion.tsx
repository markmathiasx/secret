import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export function ProductBundleSuggestion({
  currentProduct,
  relatedProducts,
}: {
  currentProduct: Product;
  relatedProducts: Product[];
}) {
  const suggestions = relatedProducts
    .filter((p) => p.id !== currentProduct.id && p.pricingMode === "faixa-auditada")
    .slice(0, 2);

  if (suggestions.length < 1) return null;

  const bundleTotal = suggestions.reduce((sum, p) => sum + p.pricePix, currentProduct.pricePix);

  return (
    <div className="rounded-[28px] border border-violet-300/15 bg-violet-300/[0.08] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Package className="h-5 w-5 text-violet-100" />
        <p className="text-sm font-semibold text-violet-100">Complete o conjunto</p>
      </div>

      <div className="space-y-3">
        {[currentProduct, ...suggestions].map((product, index) => (
          <div key={product.id} className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[12px] border border-white/10 bg-black/30">
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{product.name}</p>
              <p className="text-xs text-emerald-100">{formatCurrency(product.pricePix)}</p>
            </div>
            {index === 0 && (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-100">
                Este item
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 p-3 text-sm">
        <span className="text-white/60">Total do conjunto: </span>
        <span className="font-black text-white">{formatCurrency(bundleTotal)} no Pix</span>
      </div>

      <div className="mt-4 flex gap-2">
        {suggestions.slice(0, 1).map((p) => (
          <Link
            key={p.id}
            href={getProductUrl(p)}
            className="btn-secondary flex-1 justify-center text-sm"
          >
            Ver {p.name.split(" ").slice(0, 3).join(" ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
