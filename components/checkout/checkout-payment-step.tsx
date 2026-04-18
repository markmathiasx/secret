"use client";

import { CreditCard, PackageCheck, QrCode } from "lucide-react";
import { CouponInput } from "@/components/checkout/coupon-input";
import { formatCurrency } from "@/lib/utils";

export function CheckoutPaymentStep({
  paymentMethod,
  cardCheckoutReady,
  paymentsReadyLoaded,
  notes,
  totalPix,
  totalCard,
  onPaymentMethodChange,
  onNotesChange,
  onCouponApplied,
  onBack,
  onContinue,
}: {
  paymentMethod: "pix" | "cartao" | "boleto";
  cardCheckoutReady: boolean;
  paymentsReadyLoaded: boolean;
  notes: string;
  totalPix: number;
  totalCard: number;
  onPaymentMethodChange: (value: "pix" | "cartao" | "boleto") => void;
  onNotesChange: (value: string) => void;
  onCouponApplied?: (discount: number, freeShipping: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <button
          type="button"
          onClick={() => onPaymentMethodChange("pix")}
          className={`rounded-[24px] border p-4 text-left transition ${paymentMethod === "pix" ? "border-emerald-300/35 bg-emerald-400/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
        >
          <div className="flex items-center gap-2 text-emerald-100">
            <QrCode className="h-4 w-4" />
            <span className="text-sm font-semibold">Pix direto</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">Chave visível, QR Code e cópia e cola no próprio checkout.</p>
        </button>
        <button
          type="button"
          onClick={() => cardCheckoutReady && onPaymentMethodChange("cartao")}
          disabled={!cardCheckoutReady}
          className={`rounded-[24px] border p-4 text-left transition ${
            paymentMethod === "cartao" ? "border-cyan-300/35 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:border-white/20"
          } ${!cardCheckoutReady ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <div className="flex items-center gap-2 text-cyan-100">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-semibold">Cartão online</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">
            {cardCheckoutReady ? "Abre o checkout seguro do parceiro de cobrança." : "Ative o checkout do cartão para usar esta rota."}
          </p>
        </button>
        <button
          type="button"
          onClick={() => onPaymentMethodChange("boleto")}
          className={`rounded-[24px] border p-4 text-left transition ${paymentMethod === "boleto" ? "border-white/25 bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}
        >
          <div className="flex items-center gap-2 text-white">
            <PackageCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Boleto</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">Opção assistida pela equipe para casos que pedem confirmação manual.</p>
        </button>
      </div>

      {!cardCheckoutReady && paymentsReadyLoaded ? (
        <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
          O Pix segue ativo no site. Se você precisar parcelar, use o WhatsApp para receber orientação da equipe e concluir o pedido com suporte humano.
        </div>
      ) : null}

      <label>
        <span className="mb-2 block text-sm text-white/70">Cupom de desconto</span>
        <CouponInput
          total={paymentMethod === "cartao" ? totalCard : totalPix}
          onCouponApplied={(discount, freeShipping) => onCouponApplied?.(discount, freeShipping)}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm text-white/70">Observações do pedido</span>
        <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} className="field-base min-h-28 resize-y" />
      </label>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
        <p className="font-semibold text-white">Resumo desta etapa</p>
        <p className="mt-2">
          Pagamento selecionado: <span className="text-cyan-100">{paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão online" : "Boleto"}</span>
        </p>
        <p className="mt-1">
          Total projetado: <span className="text-white">{paymentMethod === "cartao" ? formatCurrency(totalCard) : formatCurrency(totalPix)}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onBack} className="btn-secondary">
          Voltar
        </button>
        <button type="button" onClick={onContinue} className="btn-primary">
          Continuar para confirmação
        </button>
      </div>
    </div>
  );
}
