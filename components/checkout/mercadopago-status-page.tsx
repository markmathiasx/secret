"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Package2, RefreshCw, ShoppingBag } from "lucide-react";
import { MercadoPagoStatusBrick } from "@/components/checkout/mercadopago-status-brick";
import { PostPurchaseHub } from "@/components/post-purchase-hub";
import { formatCurrency } from "@/lib/utils";

type TrackOrderResponse = {
  ok: boolean;
  order?: {
    orderNumber: string;
    status: string;
    statusLabel: string;
    createdAt: string;
    customerName: string;
    grandTotal: number;
    paymentMethod: string;
    payment?: {
      id: string | null;
      paymentId: string | null;
      externalReference: string | null;
      status: string | null;
      pixPayload: string | null;
      pixQrCode: string | null;
      boletoUrl: string | null;
      paidAt: string | null;
      metadata: Record<string, unknown> | null;
    } | null;
    items: Array<{ name: string; quantity: number; unitPrice: number }>;
    tracking: { code: string | null; carrier: string | null; shippedAt: string | null } | null;
  };
  error?: string;
};

function statusTone(variant: "success" | "failure" | "pending") {
  if (variant === "success") {
    return {
      accent: "text-emerald-100",
      border: "border-emerald-300/20",
      bg: "bg-emerald-300/10",
      icon: CheckCircle2,
      title: "Pagamento confirmado",
    };
  }

  if (variant === "failure") {
    return {
      accent: "text-rose-100",
      border: "border-rose-300/20",
      bg: "bg-rose-300/10",
      icon: AlertTriangle,
      title: "Pagamento não concluído",
    };
  }

  return {
    accent: "text-amber-100",
    border: "border-amber-300/20",
    bg: "bg-amber-300/10",
    icon: Clock3,
    title: "Pagamento em andamento",
  };
}

export function MercadoPagoStatusPage({
  variant,
  orderCode,
  paymentId,
  status,
}: {
  variant: "success" | "failure" | "pending";
  orderCode: string | null;
  paymentId: string | null;
  status: string | null;
}) {
  const tone = statusTone(variant);
  const Icon = tone.icon;
  const [data, setData] = useState<TrackOrderResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(orderCode));
  const [error, setError] = useState<string | null>(null);

  const resolvedOrder = useMemo(() => data?.order || null, [data]);
  const resolvedPaymentId = paymentId || resolvedOrder?.payment?.paymentId || null;

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/track?code=${encodeURIComponent(orderCode)}`, { cache: "no-store" });
        const json = (await response.json().catch(() => ({}))) as TrackOrderResponse;
        if (!active) return;
        setData(json);
        if (!response.ok) {
          setError(json.error || "Pedido não encontrado.");
        }
      } catch {
        if (!active) return;
        setError("Falha ao consultar o status do pedido.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [orderCode]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className={`rounded-[32px] border p-8 ${tone.border} ${tone.bg}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${tone.accent}`} />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Mercado Pago</p>
            <h1 className="text-3xl font-black text-white">{tone.title}</h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
          {variant === "success"
            ? "Seu pagamento foi confirmado e o pedido já pode avançar para produção."
            : variant === "failure"
              ? "O pagamento não foi concluído. Você pode tentar novamente sem perder o pedido."
              : "Seu pagamento está pendente ou em processamento. A atualização também é consolidada pelo webhook."}
        </p>

        {(loading || error) && (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            {loading ? "Buscando dados do pedido..." : error}
          </div>
        )}

        {resolvedOrder ? (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Pedido</p>
                <h2 className="mt-2 text-2xl font-black text-white">{resolvedOrder.orderNumber}</h2>
                <p className="mt-2 text-sm text-white/60">
                  Status interno: <span className="font-semibold text-white">{resolvedOrder.statusLabel}</span>
                </p>
                {resolvedOrder.payment?.externalReference ? (
                  <p className="mt-1 text-sm text-white/60">
                    Referência externa: <span className="font-mono text-cyan-100">{resolvedOrder.payment.externalReference}</span>
                  </p>
                ) : null}
              </div>
              <div className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Total</p>
                <p className="mt-2 text-2xl font-black text-white">{formatCurrency(resolvedOrder.grandTotal)}</p>
                <p className="mt-1 text-sm text-white/55">{resolvedOrder.paymentMethod === "pix" ? "Pix" : "Cartão"}</p>
              </div>
            </div>

            {resolvedPaymentId ? (
              <div className="mt-6">
                <MercadoPagoStatusBrick
                  paymentId={resolvedPaymentId}
                  amount={resolvedOrder.grandTotal}
                  orderCode={resolvedOrder.orderNumber}
                />
              </div>
            ) : null}

            {resolvedOrder.payment?.pixPayload ? (
              <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
                <p className="text-sm font-semibold text-cyan-50">Pix copia e cola</p>
                <textarea readOnly value={resolvedOrder.payment.pixPayload} className="field-base mt-3 min-h-28 resize-none text-xs leading-6" />
              </div>
            ) : null}

            <div className="mt-6">
              <PostPurchaseHub orderCode={resolvedOrder.orderNumber} compact />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/conta" className="btn-primary gap-2">
                <Package2 className="h-4 w-4" />
                Ver pedido
              </Link>
              <Link href="/catalogo" className="btn-secondary gap-2">
                <ShoppingBag className="h-4 w-4" />
                Voltar à loja
              </Link>
              <button type="button" onClick={() => window.location.reload()} className="btn-glass gap-2">
                <RefreshCw className="h-4 w-4" />
                Recarregar
              </button>
            </div>
          </div>
        ) : resolvedPaymentId ? (
          <div className="mt-6">
            <MercadoPagoStatusBrick paymentId={resolvedPaymentId} amount={null} orderCode={orderCode} />
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5 text-sm text-white/70">
            {status ? `Status do retorno: ${status}` : "Aguardando consolidação do pedido."}
          </div>
        )}
      </div>
    </section>
  );
}
