"use client";

import { MessageCircleMore } from "lucide-react";
import { GuaranteeBar } from "@/components/guarantee-bar";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { formatCep } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";

export function CheckoutConfirmStep({
  activeAddress,
  selectedShipping,
  paymentMethod,
  totalPix,
  totalCard,
  orderCode,
  status,
  loading,
  whatsappHref,
  onWhatsAppClick,
  onBack,
  onSubmit,
  onClearDraft,
  children,
}: {
  activeAddress: {
    recipientName: string;
    line1: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  selectedShipping: {
    title: string;
    eta: string;
  } | null;
  paymentMethod: "pix" | "cartao" | "boleto";
  totalPix: number;
  totalCard: number;
  orderCode: string | null;
  status: string | null;
  loading: boolean;
  whatsappHref: string;
  onWhatsAppClick: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onClearDraft: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="mt-6 space-y-5">
      <PurchaseProtectionBanner compact />

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Compra protegida</p>
        <p className="mt-2 text-sm leading-7 text-white/68">
          O fechamento segue com produção local, suporte humano e troca clara em caso de problema. Pix continua disponível e o cartão segue pela rota segura.
        </p>
        <div className="mt-4">
          <GuaranteeBar />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Resumo final</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
            <p className="font-semibold text-white">Entrega</p>
            <p className="mt-2">{activeAddress.recipientName}</p>
            <p>{activeAddress.line1}</p>
            <p>
              {activeAddress.neighborhood} • {activeAddress.city} - {activeAddress.state}
            </p>
            <p>CEP {formatCep(activeAddress.zipCode)}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-white/72">
            <p className="font-semibold text-white">Pagamento e envio</p>
            <p className="mt-2">{selectedShipping?.title || "Envio pendente"} • {selectedShipping?.eta || "prazo pendente"}</p>
            <p>Pagamento: {paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão online" : "Boleto"}</p>
            <p>Total final: {paymentMethod === "cartao" ? formatCurrency(totalCard) : formatCurrency(totalPix)}</p>
          </div>
        </div>
      </div>

      {!orderCode ? (
        <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
          Ao confirmar, o sistema cria o pedido com código, salva o snapshot do endereço e registra a rota de envio escolhida.
        </div>
      ) : null}

      {orderCode ? (
        <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-5 text-sm text-emerald-50">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/75">Pedido criado</p>
          <h3 className="mt-2 text-2xl font-black text-white">{orderCode}</h3>
          <p className="mt-3 leading-7">{status || "Seu pedido foi registrado com sucesso."}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={onWhatsAppClick} className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Continuar no WhatsApp
            </a>
            <button type="button" onClick={onClearDraft} className="btn-glass">
              Novo pedido
            </button>
          </div>
        </div>
      ) : null}

      {children ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onBack} className="btn-secondary">
              Voltar
            </button>
          </div>
          {children}
        </div>
      ) : null}

      {!children ? (
        <div className="flex flex-wrap gap-3">
          {!orderCode ? (
            <>
              <button type="button" onClick={onBack} className="btn-secondary">
                Voltar
              </button>
              <button type="button" onClick={onSubmit} className="btn-primary" disabled={loading}>
                {loading
                  ? "Processando..."
                  : paymentMethod === "cartao"
                    ? "Gerar pedido e ir para o cartão online"
                    : paymentMethod === "boleto"
                      ? "Gerar pedido com boleto"
                      : "Gerar pedido e Pix"}
              </button>
            </>
          ) : (
            <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={onWhatsAppClick} className="btn-primary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Confirmar com a equipe
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}
