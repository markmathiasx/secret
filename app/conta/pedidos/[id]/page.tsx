"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageCircle,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";
import { useCustomerSession } from "@/lib/customer-session-client";
import { formatCurrency } from "@/lib/utils";
import { whatsappNumber } from "@/lib/constants";
import { PurchaseProtectionBanner } from "@/components/purchase-protection-banner";
import { PostPurchaseHub } from "@/components/post-purchase-hub";

type Order = {
  id: string;
  order_code: string;
  product_name: string;
  payment_method: string;
  payment_status: string | null;
  payment_reference: string | null;
  quantity: number;
  total_pix: number | null;
  total_card: number | null;
  status: string;
  created_at: string;
};

function formatOrderStatus(status: string | null | undefined) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "draft") return "Rascunho";
  if (normalized === "pending_payment") return "Aguardando pagamento";
  if (normalized === "paid") return "Pago";
  if (normalized === "printing") return "Em impressão";
  if (normalized === "ready_to_ship") return "Pronto para envio";
  if (normalized === "shipped") return "Enviado";
  if (normalized === "delivered") return "Entregue";
  if (normalized === "failed") return "Falhou";
  if (normalized === "refunded") return "Reembolsado";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelado";
  if (normalized === "fulfilled") return "Concluído";
  if (normalized.includes("pix")) return "Aguardando Pix";
  if (normalized.includes("card") || normalized.includes("cartao") || normalized.includes("cartão")) return "Aguardando cartão";
  if (normalized.includes("checkout")) return "Checkout iniciado";
  if (normalized.includes("print") || normalized.includes("produc")) return "Em produção";
  if (normalized.includes("ship") || normalized.includes("entreg") || normalized.includes("envi")) return "Em entrega";
  return status || "Em análise";
}

function formatPaymentMethod(method: string | null | undefined) {
  if (!method) return "—";
  const m = method.toLowerCase();
  if (m.includes("pix")) return "Pix";
  if (m.includes("card") || m.includes("cartao") || m.includes("cartão") || m.includes("credit")) return "Cartão de crédito";
  if (m.includes("boleto")) return "Boleto";
  return method;
}

type TimelineStep = {
  label: string;
  icon: React.ElementType;
  done: boolean;
  active: boolean;
};

function buildTimeline(status: string): TimelineStep[] {
  const s = status.toLowerCase();
  const isCancelled = s.includes("cancel") || s.includes("failed") || s === "failed" || s.includes("refund");
  const isFulfilled = s === "fulfilled" || s === "delivered" || s.includes("entreg") || s.includes("conclu");
  const isShipped = isFulfilled || s === "shipped" || s.includes("ship") || s.includes("envi");
  const isReadyToShip = isShipped || s === "ready_to_ship" || s.includes("pronto");
  const isInProduction = isReadyToShip || s === "printing" || s.includes("print") || s.includes("produc") || s === "paid";
  const isPaid = isInProduction || isFulfilled || s === "paid" || s.includes("paid") || s.includes("pago");
  const isReceived = true;

  if (isCancelled) {
    return [
      { label: "Pedido recebido", icon: Clock, done: true, active: false },
      { label: "Pagamento cancelado", icon: Package, done: false, active: true },
    ];
  }

  return [
    { label: "Pedido recebido", icon: Clock, done: isReceived, active: !isPaid },
    { label: "Pagamento confirmado", icon: CheckCircle2, done: isPaid, active: isPaid && !isInProduction },
    { label: "Em produção", icon: Package, done: isInProduction, active: isInProduction && !isFulfilled },
    { label: "Enviado", icon: Truck, done: isShipped, active: isShipped && !isFulfilled },
    { label: "Entregue", icon: PackageCheck, done: isFulfilled, active: false },
  ];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const session = useCustomerSession();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!session.ready) return;

    if (!session.loggedIn) {
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        const res = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        const found: Order | null = data?.order || null;
        if (res.ok && found) {
          setOrder(found);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [session.ready, session.loggedIn, orderId, router]);

  if (loading || !session.ready) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 text-white/70">
        Carregando pedido...
      </section>
    );
  }

  if (notFound || !order) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-white/70">Pedido não encontrado.</p>
        <Link href="/conta" className="btn-primary mt-6 inline-flex gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para minha conta
        </Link>
      </section>
    );
  }

  const timeline = buildTimeline(order.status);
  const totalAmount = order.total_pix ?? order.total_card ?? 0;
  const paymentMethod = formatPaymentMethod(order.payment_method);
  const waMsg = encodeURIComponent(`Olá! Gostaria de saber sobre o pedido ${order.order_code}.`);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${waMsg}`;

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <Link
        href="/conta"
        className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Minha conta
      </Link>

      <div className="glass-panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Detalhe do pedido</p>
        <h1 className="mt-3 text-3xl font-black text-white">{order.order_code}</h1>
        <p className="mt-1 text-sm text-white/55">
          {new Date(order.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="mt-6">
        <PurchaseProtectionBanner compact />
      </div>

      <div className="mt-6">
        <PostPurchaseHub orderCode={order.order_code} />
      </div>

      {/* Timeline */}
      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
          Status do pedido
        </h2>
        <ol className="space-y-4">
          {timeline.map((step, idx) => {
            const Icon = step.icon;
            return (
              <li key={idx} className="flex items-center gap-4">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border ${
                    step.done
                      ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-200"
                      : step.active
                        ? "border-cyan-400/40 bg-cyan-400/20 text-cyan-200"
                        : "border-white/10 bg-white/5 text-white/30"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    step.done ? "text-white" : step.active ? "text-cyan-100" : "text-white/35"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Order info */}
      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
          Detalhes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-white/45">Produto</p>
            <p className="mt-1 text-sm font-semibold text-white">{order.product_name}</p>
          </div>
          <div>
            <p className="text-xs text-white/45">Quantidade</p>
            <p className="mt-1 text-sm font-semibold text-white">{order.quantity}x</p>
          </div>
          <div>
            <p className="text-xs text-white/45">Pagamento</p>
            <p className="mt-1 text-sm font-semibold text-white">{paymentMethod}</p>
          </div>
          <div>
            <p className="text-xs text-white/45">Status</p>
            <p className="mt-1 text-sm font-semibold text-white">{formatOrderStatus(order.status)}</p>
          </div>
          {totalAmount > 0 && (
            <div>
              <p className="text-xs text-white/45">Total</p>
              <p className="mt-1 text-sm font-black text-emerald-100">{formatCurrency(totalAmount)}</p>
            </div>
          )}
          {order.payment_reference && (
            <div>
              <p className="text-xs text-white/45">Referência de pagamento</p>
              <p className="mt-1 text-sm font-medium text-white/70">{order.payment_reference}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={waUrl} target="_blank" rel="noreferrer" className="btn-zap gap-2">
          <MessageCircle className="h-4 w-4" />
          Falar sobre este pedido
        </a>
        <Link href="/rastrear" className="btn-secondary gap-2">
          <Clock className="h-4 w-4" />
          Ver rastreio
        </Link>
        <Link href="/devolucoes" className="btn-secondary gap-2">
          <ArrowLeft className="h-4 w-4" />
          Trocas e devoluções
        </Link>
        <Link href="/catalogo" className="btn-secondary gap-2">
          <Package className="h-4 w-4" />
          Ver catálogo
        </Link>
      </div>
    </section>
  );
}
