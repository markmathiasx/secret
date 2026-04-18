"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductPriceStack } from "@/components/product-price-stack";

function shouldIgnoreCardActivation(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a, button, input, select, textarea, [role='button'], [data-card-interactive='true']"));
}

export function CatalogGrid({ products }: { products: Product[] }) {
  const router = useRouter();

  function openProduct(product: Product) {
    router.push(getProductUrl(product));
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          className={`catalog-product-card group cursor-pointer rounded-[30px] border p-5 transition ${
            isProductVisualVerified(product)
              ? "border-white/10 bg-card hover:border-cyan-300/30"
              : "border-amber-300/15 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0.02))] hover:border-amber-300/30"
          }`}
          role="link"
          tabIndex={0}
          aria-label={`Abrir ${product.name}`}
          onClick={(event) => {
            if (shouldIgnoreCardActivation(event.target)) return;
            openProduct(product);
          }}
          onKeyDown={(event) => {
            if (shouldIgnoreCardActivation(event.target)) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openProduct(product);
            }
          }}
        >
          <ProductImageGallery product={product} compact />
            <div className="mt-4 flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{product.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{product.name}</h3>
                  <p className="mt-2 min-h-[72px] line-clamp-3 text-sm leading-6 text-white/62">{product.description}</p>
                </div>
                <FavoriteButton productId={product.id} className="shrink-0" />
              </div>
            <div className="mt-3">
              <ProductVisualBadge product={product} />
            </div>
            <div className="mt-3 rounded-[22px] border border-white/10 bg-black/20 p-3 text-xs leading-6 text-white/62">
              <p className="font-semibold text-white/82">{product.pricingMode === "faixa-auditada" ? "Compra direta" : "Projeto sob medida"}</p>
              <p className="mt-1">{product.pricingNarrative}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.material}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.finish}</span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">{product.productionWindow}</span>
            </div>
            <div className="mt-5 flex items-end justify-between gap-3">
              <ProductPriceStack product={product} compact />
              <Link href={getProductUrl(product)} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">
                {product.pricingMode === "faixa-auditada" ? "Comprar agora" : "Pedir orçamento"}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
