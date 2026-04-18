"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { PostPurchaseHub } from "@/components/post-purchase-hub";

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  PAID: "Pagamento confirmado",
  PRINTING: "Em produção",
  READY_TO_SHIP: "Pronto para envio",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  PAID: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  PRINTING: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
  READY_TO_SHIP: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  SHIPPED: "border-blue-300/30 bg-blue-300/10 text-blue-100",
  DELIVERED: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  CANCELED: "border-rose-300/20 bg-rose-300/10 text-rose-200",
  REFUNDED: "border-white/10 bg-white/5 text-white/60",
};

type OrderResult = {
  orderNumber: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  customerName: string;
  grandTotal: number;
  paymentMethod: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  tracking: { code: string | null; carrier: string | null; shippedAt: string | null } | null;
};

export default function RastrearPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Pedido não encontrado.");
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setLoading(false);
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="section-kicker">Acompanhar pedido</p>
        <h1 className="section-title">Rastrear</h1>
        <p className="section-copy">Digite o código do seu pedido para acompanhar o status.</p>
      </div>

      <div className="mb-6">
        <PostPurchaseHub compact />
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ex: MDH-001234"
            className="field-base pl-9 uppercase tracking-widest"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? "Buscando…" : "Rastrear"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-[20px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {order && (
        <div className="glass-card space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-white/40">Pedido</p>
              <p className="font-mono text-xl font-bold text-cyan-200">{order.orderNumber}</p>
              {order.customerName && <p className="mt-0.5 text-sm text-white/60">{order.customerName}</p>}
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${STATUS_COLORS[order.status] || "border-white/10 bg-white/5 text-white/60"}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/40">Data</p>
              <p className="mt-1 text-white">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/40">Total</p>
              <p className="mt-1 text-emerald-200 font-semibold">{fmt(order.grandTotal)}</p>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-white/40">Pagamento</p>
              <p className="mt-1 text-white capitalize">{order.paymentMethod === "PIX" ? "Pix" : order.paymentMethod === "CARD" ? "Cartão" : order.paymentMethod}</p>
            </div>
          </div>

          {order.items.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Itens</p>
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-white/30" />
                      <span className="text-white">{item.name}</span>
                      <span className="text-white/40">× {item.quantity}</span>
                    </div>
                    <span className="text-white/60">{fmt(item.unitPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.tracking && (
            <div className="rounded-[18px] border border-cyan-300/20 bg-cyan-300/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/70">Rastreio</p>
              {order.tracking.code && (
                <p className="mt-1 font-mono text-cyan-100">{order.tracking.code}</p>
              )}
              {order.tracking.carrier && (
                <p className="text-sm text-white/60">{order.tracking.carrier}</p>
              )}
              {order.tracking.shippedAt && (
                <p className="mt-1 text-xs text-white/40">Enviado em {new Date(order.tracking.shippedAt).toLocaleDateString("pt-BR")}</p>
              )}
            </div>
          )}

          <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Próxima ação</p>
            <p className="mt-2 text-sm leading-7 text-white/68">
              Se precisar abrir troca, falar com a equipe ou rever a compra, os atalhos do pós-venda ficam disponíveis na página.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
