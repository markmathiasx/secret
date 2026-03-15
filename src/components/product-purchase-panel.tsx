"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag, Zap } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { type Product } from "@/lib/catalog";
import { buildProductWhatsAppMessage, buildWhatsAppHref, formatInstallments } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, isFavorite, toggleFavorite } = useStore();
  const [added, setAdded] = useState(false);
  const favorite = isFavorite(product.id);
  const whatsappHref = buildWhatsAppHref(buildProductWhatsAppMessage(product));

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(timer);
  }, [added]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Compra rápida</p>
          <h2 className="mt-2 text-3xl font-black text-white">{product.name}</h2>
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className={`rounded-full border p-3 ${
            favorite
              ? "border-rose-300/50 bg-rose-400/15 text-rose-100"
              : "border-white/10 bg-black/20 text-white"
          }`}
          aria-label={favorite ? "Remover dos favoritos" : "Salvar nos favoritos"}
        >
          <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <p className="mt-4 text-sm leading-7 text-white/65">{product.description}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-sm text-emerald-100/70">Pix</p>
          <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
          <p className="mt-2 text-xs text-emerald-100/75">Melhor preço para fechar o pedido</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-white/55">Cartão</p>
          <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
          <p className="mt-2 text-xs text-white/55">{formatInstallments(product.priceCard)}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm text-white/55">Prazo</p>
          <p className="mt-2 text-2xl font-black text-cyan-100">{product.productionWindow}</p>
          <p className="mt-2 text-xs text-white/55">Produção + despacho confirmados pelo CEP</p>
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <p className="text-sm text-white/55">Cores disponíveis</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <span key={color} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
              {color}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            addToCart(product.id);
            router.push("/checkout");
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          <Zap className="h-4 w-4" />
          Comprar agora
        </button>
        <button
          type="button"
          onClick={() => {
            addToCart(product.id);
            setAdded(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          {added ? "Adicionado" : "Adicionar ao carrinho"}
        </button>
        <a
          href={whatsappHref}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-50"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <Link
          href="/carrinho"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white"
        >
          Ver carrinho
        </Link>
      </div>
    </div>
  );
}
