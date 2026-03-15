"use client";

import Link from "next/link";
import { MessageCircleMore, ShoppingBag } from "lucide-react";
import { toCartProductSnapshot, useCart } from "@/components/cart-provider";
import { buttonFamilies } from "@/components/ui/buttons";
import { trackWhatsAppClick } from "@/lib/analytics-client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { whatsappNumber } from "@/lib/constants";
import { type Product } from "@/lib/catalog";
import { formatCurrency, formatInstallment } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const inCart = items.find((item) => item.productId === product.id)?.quantity || 0;
  const idealFor = typeof product.metadata.idealFor === "string" ? product.metadata.idealFor : "presentear, organizar ou decorar";
  const customization = typeof product.metadata.customization === "string" ? product.metadata.customization : "personalizacao sob medida";
  const whatsappUrl = buildWhatsAppLink(
    whatsappNumber,
    `Oi! Quero atendimento sobre o item ${product.name} (${product.sku}) que vi no site da MDH 3D.`
  );

  return (
    <>
      <div className="section-shell space-y-6 rounded-[32px] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Compra com clareza</p>
          <h2 className="mt-3 text-2xl font-black text-white">Compre com preco claro, prazo visivel e ajuda rapida para personalizar do seu jeito</h2>
          <p className="mt-3 text-sm leading-7 text-white/66">
            Compare valor no Pix, parcelamento e prazo em poucos segundos. Se quiser ajustar cor, nome, tamanho ou acabamento, o WhatsApp entra para deixar a decisao ainda mais segura.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="premium-card rounded-[24px] border-emerald-400/18 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-100/70">Pix</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
          </div>
          <div className="premium-card rounded-[24px] bg-black/20 p-4">
            <p className="text-sm text-white/55">Cartão</p>
            <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
            <p className="mt-2 text-xs text-white/55">{formatInstallment(product.priceCard)}</p>
          </div>
        </div>

        <div className="premium-card rounded-[24px] bg-black/20 p-4 text-sm text-white/68">
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
            "Pix com melhor valor para comprar com mais vantagem",
            "Producao sob demanda com qualidade premium",
            customization
          ].map((item) => (
            <div key={item} className="premium-card rounded-[22px] bg-black/20 px-4 py-3 text-sm text-white/62">
              {item}
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => addItem(toCartProductSnapshot(product))}
            className={buttonFamilies.primary}
          >
            <ShoppingBag className="h-4 w-4" />
            Adicionar ao carrinho
          </button>
          <Link href="/carrinho" className={buttonFamilies.secondary}>
            Revisar carrinho
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsAppClick({ placement: "product_panel", productId: product.id })}
            className={buttonFamilies.primaryPix}
          >
            <MessageCircleMore className="h-4 w-4" />
            Falar sobre personalizacao
          </a>
        </div>
      </div>
      <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
        <div className="premium-floating-bar flex items-center justify-between gap-3 rounded-full px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pix a partir de</p>
            <p className="truncate text-sm font-semibold text-white">{formatCurrency(product.pricePix)}</p>
          </div>
          <button
            type="button"
            onClick={() => addItem(toCartProductSnapshot(product))}
            className={buttonFamilies.primary}
          >
            Colocar no carrinho
          </button>
        </div>
      </div>
    </>
  );
}
