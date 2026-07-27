"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/product-routing";

const RECENT_KEY = "mdh_catalog_recent";

type SlimProduct = Pick<Product, "id" | "slug" | "name" | "pricePix" | "images">;

export function RecentlyViewedShelf({
  currentProductId,
  catalog,
}: {
  currentProductId: string;
  catalog: SlimProduct[];
}) {
  const [recentProducts, setRecentProducts] = useState<SlimProduct[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const filtered = ids
        .filter((id) => id !== currentProductId)
        .slice(0, 8)
        .map((id) => catalog.find((p) => p.id === id))
        .filter((p): p is SlimProduct => Boolean(p));
      setRecentProducts(filtered);
    } catch {
      // ignore
    }
  }, [currentProductId, catalog]);

  if (recentProducts.length < 2) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <p className="mb-5 text-xs uppercase tracking-[0.22em] text-white/45">Vistos recentemente</p>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            href={getProductUrl(product as Product)}
            className="group flex-shrink-0 rounded-[22px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/[0.08]"
            style={{ width: 168 }}
          >
            <div className="relative mb-3 h-24 w-full overflow-hidden rounded-[16px] bg-black/30">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="168px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-white/20">sem foto</div>
              )}
            </div>
            <p className="line-clamp-2 text-xs font-semibold text-white/80 group-hover:text-white">{product.name}</p>
            <p className="mt-1.5 text-sm font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
