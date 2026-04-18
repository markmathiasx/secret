"use client";

import { CheckCircle2 } from "lucide-react";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { PixCountdown } from "@/components/checkout/pix-countdown";
import { ProductPriceStack } from "@/components/product-price-stack";
import { ProductVisualBadge } from "@/components/product-visual-authenticity";
import { SafeProductImage } from "@/components/safe-product-image";
import type { Product } from "@/lib/catalog";
import { pix } from "@/lib/constants";
import { formatCep } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";

type ChecklistItem = {
  label: string;
  ready: boolean;
};

export function CheckoutSummary({
  product,
  imageCandidates,
  purchasePurpose,
  quantity,
  activeAddress,
  selectedShipping,
  subtotalPix,
  subtotalCard,
  shippingPrice,
  totalPix,
  totalCard,
  suggestedRoute,
  paymentMethod,
  paymentTitle,
  pixPayment,
  orderChecklist,
  draftRestored,
}: {
  product: Product | null | undefined;
  imageCandidates: string[];
  purchasePurpose: string;
  quantity: number;
  activeAddress: {
    line1: string;
    neighborhood: string;
    zipCode: string;
  };
  selectedShipping: {
    title: string;
    eta: string;
    region: string;
  } | null;
  subtotalPix: number;
  subtotalCard: number;
  shippingPrice: number;
  totalPix: number;
  totalCard: number;
  suggestedRoute: string;
  paymentMethod: "pix" | "cartao" | "boleto";
  paymentTitle: string;
  pixPayment?: {
    payload?: string | null;
    qrCodeBase64?: string | null;
    expiresAt?: string | null;
    provider?: string | null;
  } | null;
  orderChecklist: ChecklistItem[];
  draftRestored: boolean;
}) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="glass-panel p-6 md:p-7">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Checkout MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">Pedido guiado em quatro etapas claras.</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">
          Endereço, envio, pagamento e confirmação. O fluxo continua compatível com Pix e cartão, mas agora com resumo mais completo e endereço salvo para quem tem conta.
        </p>

        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          {orderChecklist.map((item) => (
            <div key={item.label} className="surface-stat rounded-[18px] px-4 py-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${item.ready ? "text-emerald-200" : "text-white/35"}`} />
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {draftRestored ? (
          <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
            Encontramos um checkout salvo neste dispositivo. Você pode continuar de onde parou ou limpar esse rascunho quando concluir o pedido.
          </div>
        ) : null}

        {product ? (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
              <SafeProductImage
                candidates={imageCandidates}
                alt={`Impressão 3D de ${product.name} - MDH 3D Store`}
                className="aspect-square w-full object-cover"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-[80%]">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="glass-chip">{product.category}</span>
                  <ProductVisualBadge product={product as Product} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">{product.name}</h2>
                <p className="mt-2 text-sm leading-7 text-white/65">{product.description}</p>
                <div className="mt-4 max-w-sm">
                  <ProductPriceStack product={product as Product} compact />
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/65">
                Quantidade {quantity}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                {purchasePurpose}
              </span>
              {selectedShipping ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                  {selectedShipping.title}
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Total no Pix</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalPix)}</p>
                <p className="mt-2 text-xs text-white/55">
                  Subtotal {formatCurrency(subtotalPix)} + envio {formatCurrency(shippingPrice)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Total no cartão</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalCard)}</p>
                <p className="mt-2 text-xs text-white/55">
                  Subtotal {formatCurrency(subtotalCard)} + envio {formatCurrency(shippingPrice)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/68">
              <p className="font-semibold text-white">Resumo em tempo real</p>
              <p className="mt-2">
                {selectedShipping
                  ? `${selectedShipping.title} • ${selectedShipping.eta} • ${selectedShipping.region}`
                  : "Escolha o envio para ver prazo e valor final."}
              </p>
              <p className="mt-1">
                Endereço atual: {activeAddress.line1 || "pendente"}
                {activeAddress.neighborhood ? `, ${activeAddress.neighborhood}` : ""} • CEP {formatCep(activeAddress.zipCode) || "pendente"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-50">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/75">Rota sugerida</p>
          <p className="mt-2">{suggestedRoute}</p>
        </div>
      </div>

      {paymentMethod === "pix" && product ? (
        <div className="space-y-3">
          {pixPayment?.expiresAt && <PixCountdown expiresAt={pixPayment.expiresAt} />}
          <PixPaymentCard
            title={paymentTitle}
            amount={totalPix}
            payload={pixPayment?.payload}
            qrCodeBase64={pixPayment?.qrCodeBase64}
            expiresAt={pixPayment?.expiresAt}
            providerLabel={pixPayment?.provider}
          />
        </div>
      ) : (
        <div className="glass-panel p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Pagamento</p>
          <h2 className="mt-3 text-2xl font-black text-white">
            {paymentMethod === "boleto" ? "Boleto com acompanhamento humano." : "Pix segue como rota mais direta."}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            {paymentMethod === "boleto"
              ? "O boleto fica como opção assistida para pedidos que precisam de acompanhamento comercial."
              : `O Pix segue como rota direta. A chave atual é ${pix.key}.`}
          </p>
        </div>
      )}
    </div>
  );
}
