"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, MessageCircleMore } from "lucide-react";
import type { SupportProduct } from "@/lib/support/support-types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function buildWhatsAppProductMessage(product: SupportProduct) {
  return [
    `Quero comprar ou tirar dúvida sobre ${product.name}.`,
    `SKU: ${product.sku}`,
    `Pix: ${formatCurrency(product.pricePix)}`,
    `Cartão: ${formatCurrency(product.priceCard)}`,
    `Link: https://www.mdh3d.com.br${product.url}`,
  ].join("\n");
}

export function SupportProductSuggestions({
  products,
  whatsappNumber,
}: {
  products: SupportProduct[];
  whatsappNumber: string;
}) {
  if (!products.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {products.map((product) => (
        <article key={product.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055]">
          <div className="flex gap-3 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border border-white/10 bg-black/30">
              <Image src={product.image} alt={product.name} width={80} height={80} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold text-white">{product.name}</p>
              <p className="mt-1 text-xs text-white/55">{product.category}</p>
              <div className="mt-2 grid gap-1 text-xs">
                <span className="font-semibold text-emerald-100">Pix {formatCurrency(product.pricePix)}</span>
                <span className="text-cyan-100">Cartão {formatCurrency(product.priceCard)}</span>
                <span className="text-white/55">{product.productionWindow}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 border-t border-white/10 text-xs font-semibold">
            <Link href={product.url} className="inline-flex items-center justify-center gap-2 px-3 py-3 text-cyan-100 transition hover:bg-cyan-300/10">
              Ver produto
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppProductMessage(product))}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border-l border-white/10 px-3 py-3 text-emerald-100 transition hover:bg-emerald-300/10"
            >
              WhatsApp
              <MessageCircleMore className="h-3.5 w-3.5" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
