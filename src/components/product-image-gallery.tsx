"use client";

import { BadgeCheck, PaintBucket, ScanSearch } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
import { getPrimaryProductImage } from "@/lib/product-media";

export function ProductImageGallery({ product }: { product: Product }) {
  const image = getPrimaryProductImage(product);

  return (
    <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4">
      <div className="grid gap-3">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
          <ProductImage
            src={image.src}
            fallbackSrcs={image.fallbackSrcs}
            alt={image.alt}
            priority
            sizes="(max-width: 1280px) 100vw, 72vw"
            containerClassName="aspect-square"
          />
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{product.visualLabel}</p>
          <h3 className="mt-2 text-2xl font-black text-white">{product.name}</h3>
          <p className="mt-3 text-sm leading-7 text-white/68">
            A galeria mantém consistencia comercial: foto real quando disponivel e render fiel quando a peca ainda nao teve ensaio fotografico final.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { icon: ScanSearch, title: "Visual confiável", text: "A peça nunca fica sem imagem durante a navegação." },
              { icon: PaintBucket, title: "Material e acabamento", text: `${product.material} com ${product.finish}.` },
              { icon: BadgeCheck, title: "Prazo claro", text: `${product.grams} g e ${product.productionWindow}.` }
            ].map((item) => (
              <div key={item.title} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-sm font-semibold text-cyan-50">Atualizacao de vitrine sem retrabalho</p>
            <p className="mt-2 text-sm leading-6 text-cyan-100/78">
              Quando houver foto real aprovada, o card e a pagina do produto ja estao preparados para atualizar sem quebrar layout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
