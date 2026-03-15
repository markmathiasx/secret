"use client";

import Link from "next/link";
import { Heart, MessageCircle, ShoppingBag, X } from "lucide-react";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { useStore } from "@/components/store-provider";
import { getProductUrl, type Product } from "@/lib/catalog";
import { buildProductWhatsAppMessage, buildWhatsAppHref, formatInstallments } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

type Props = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function ProductQuickView({ product, open, onClose }: Props) {
  const { addToCart, isFavorite, toggleFavorite } = useStore();

  if (!open) return null;

  const favorite = isFavorite(product.id);
  const whatsappHref = buildWhatsAppHref(buildProductWhatsAppMessage(product));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/84 p-4 backdrop-blur-md">
      <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#07101f] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-black/35 p-2 text-white"
          aria-label="Fechar visualização rápida"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <ProductImageGallery product={product} />

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs text-white/65">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                {product.collection}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1">{product.category}</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Prazo {product.productionWindow}</span>
            </div>

            <div>
              <h2 className="text-3xl font-black text-white">{product.name}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{product.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm text-emerald-100/70">Pix</p>
                <p className="mt-1 text-3xl font-black text-white">{formatCurrency(product.pricePix)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/25 p-4">
                <p className="text-sm text-white/55">Parcelamento</p>
                <p className="mt-1 text-xl font-bold text-white">{formatInstallments(product.priceCard)}</p>
                <p className="mt-1 text-sm text-white/55">Total no cartão: {formatCurrency(product.priceCard)}</p>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-white/55">Cores mais pedidas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <span key={color} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => addToCart(product.id)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
              >
                <ShoppingBag className="h-4 w-4" />
                Comprar
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${
                  favorite
                    ? "border-rose-300/50 bg-rose-400/15 text-rose-100"
                    : "border-white/10 bg-black/20 text-white"
                }`}
              >
                <Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} />
                {favorite ? "Nos favoritos" : "Favoritar"}
              </button>
              <Link
                href={getProductUrl(product)}
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
              >
                Ver produto
              </Link>
              <a
                href={whatsappHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-50"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
