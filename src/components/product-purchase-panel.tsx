"use client";

import Link from "next/link";
import { MessageCircleMore, ShoppingBag } from "lucide-react";
import { toCartProductSnapshot, useCart } from "@/components/cart-provider";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { whatsappNumber } from "@/lib/constants";
import { type Product } from "@/lib/catalog";
import { formatCurrency, formatInstallment } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inCart = items.find((item) => item.productId === product.id)?.quantity || 0;
  const idealFor = typeof product.metadata.idealFor === "string" ? product.metadata.idealFor : "presentear, organizar ou decorar";
  const customization = typeof product.metadata.customization === "string" ? product.metadata.customization : "personalizacao sob encomenda";
  const whatsappUrl = buildWhatsAppLink(
    whatsappNumber,
    `Oi! Quero atendimento sobre o item ${product.name} (${product.sku}) que vi no site da MDH 3D.`
  );

  return (
    <>
      <div className="section-shell space-y-6 rounded-[32px] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Compra com clareza</p>
          <h2 className="mt-3 text-2xl font-black text-white">Leve a peça ideal com Pix em destaque, prazo visivel e ajuda humana quando fizer sentido</h2>
          <p className="mt-3 text-sm leading-7 text-white/66">
            Aqui voce compara preco, parcelamento e prazo sem atrito. Se quiser ajustar cor, tamanho ou acabamento, o WhatsApp entra no momento certo.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[24px] border border-emerald-400/18 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-100/70">Pix</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-white/55">Cartão</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
            <p className="mt-2 text-xs text-white/55">{formatInstallment(product.priceCard)}</p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
          <p>
            Quantidade no carrinho: <strong className="text-white">{inCart}</strong>
          </p>
          <p className="mt-2">Prazo estimado: {product.productionWindow}</p>
          <p className="mt-2">Materiais: {product.materials.join(", ")}</p>
          <p className="mt-2">SKU: {product.sku}</p>
          <p className="mt-2">Ideal para: {idealFor}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "Pix com melhor valor para decidir mais rapido",
            "Producao sob demanda com acabamento caprichado",
            customization
          ].map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/62">
              {item}
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => addItem(toCartProductSnapshot(product))}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100"
          >
            <ShoppingBag className="h-4 w-4" />
            Adicionar ao carrinho
          </button>
          <Link href="/carrinho" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80">
            Revisar carrinho
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsAppClick({ placement: "product_panel", productId: product.id })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-5 py-3 text-sm font-semibold text-emerald-100"
          >
            <MessageCircleMore className="h-4 w-4" />
            Confirmar detalhes no WhatsApp
          </a>
        </div>
      </div>
      <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
        <div className="flex items-center justify-between gap-3 rounded-full border border-white/10 bg-slate-950/92 px-4 py-3 shadow-2xl backdrop-blur-xl">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pix a partir de</p>
            <p className="truncate text-sm font-semibold text-white">{formatCurrency(product.pricePix)}</p>
          </div>
          <button
            type="button"
            onClick={() => addItem(toCartProductSnapshot(product))}
            className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-100"
          >
            Colocar no carrinho
          </button>
        </div>
      </div>
    </>
  );
}
