"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Package, ShoppingCart, Wallet } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/product-routing";
import { addLocalCartItem } from "@/lib/cart-store";
import { trackAddToCart, trackBeginCheckout } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

export function ProductBundleSuggestion({
  currentProduct,
  relatedProducts,
}: {
  currentProduct: Product;
  relatedProducts: Product[];
}) {
  const [message, setMessage] = useState("");
  const suggestions = useMemo(
    () =>
      relatedProducts
        .filter((p) => p.id !== currentProduct.id && p.pricingMode === "faixa-auditada")
        .slice(0, 2),
    [currentProduct.id, relatedProducts]
  );

  if (suggestions.length < 1) return null;

  const bundleProducts = [currentProduct, ...suggestions];
  const bundleTotal = suggestions.reduce((sum, p) => sum + p.pricePix, currentProduct.pricePix);

  function addBundle(redirectToCheckout = false) {
    for (const product of bundleProducts) {
      trackAddToCart(product, 1);
      addLocalCartItem({
        productId: product.id,
        quantity: 1,
        title: product.name,
        pricePix: product.pricePix,
        priceCard: product.priceCard,
        image: product.images?.[0],
      });
    }

    setMessage(`${bundleProducts.length} itens adicionados ao carrinho.`);
    window.setTimeout(() => setMessage(""), 2200);

    if (redirectToCheckout) {
      trackBeginCheckout(currentProduct, bundleProducts.length, bundleTotal);
      window.location.href = "/checkout";
    }
  }

  return (
    <div className="rounded-[28px] border border-violet-300/15 bg-violet-300/[0.08] p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-violet-100" />
          <div>
            <p className="text-sm font-semibold text-violet-100">Aumente o pedido em um clique</p>
            <p className="mt-1 text-xs text-white/55">Conjunto coerente com esta categoria, sem item aleatório.</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100">
          {formatCurrency(bundleTotal)} no Pix
        </span>
      </div>

      <div className="space-y-3">
        {bundleProducts.map((product, index) => (
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

      {message ? (
        <div className="mt-4 rounded-[18px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
          {message}
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => addBundle(true)} className="btn-primary justify-center gap-2 text-sm">
          <Wallet className="h-4 w-4" />
          Comprar conjunto
        </button>
        <button type="button" onClick={() => addBundle(false)} className="btn-secondary justify-center gap-2 text-sm">
          <ShoppingCart className="h-4 w-4" />
          Adicionar conjunto
        </button>
        {suggestions.slice(0, 1).map((p) => (
          <Link
            key={p.id}
            href={getProductUrl(p)}
            className="btn-glass justify-center text-sm sm:col-span-2"
          >
            Ver {p.name.split(" ").slice(0, 3).join(" ")}
          </Link>
        ))}
      </div>
    </div>
  );
}
