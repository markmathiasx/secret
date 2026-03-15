"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircleMore, Search, ShieldCheck } from "lucide-react";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics-client";
import { operationalStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/commerce";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

type OrderTrackingPageProps = {
  initialOrderNumber?: string;
};

type TrackingResult = {
  orderNumber: string;
  operationalStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  sourceChannel: string;
  placedAt: string;
  items: Array<{ name: string; quantity: number; lineTotalPix: number }>;
  timeline: Array<{ eventType: string; description: string; createdAt: string }>;
};

export function OrderTrackingPage({ initialOrderNumber = "" }: OrderTrackingPageProps) {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [credential, setCredential] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const whatsappHref = buildWhatsAppLink(
    whatsappNumber,
    `${whatsappMessage}\n\nQuero ajuda para acompanhar o pedido ${orderNumber || "MDH-"}`
  );

  useEffect(() => {
    if (initialOrderNumber) {
      trackEvent("search", {
        source: "order_tracking_prefill",
        orderNumber: initialOrderNumber
      });
    }
  }, [initialOrderNumber]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    trackEvent("search", {
      source: "order_tracking",
      orderNumber
    });
    setStatus("loading");
    setMessage("");
    setResult(null);

    const response = await fetch("/api/store/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, credential })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.message || "Falha ao consultar pedido.");
      return;
    }

    setResult(data.order);
    setStatus("success");
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Acompanhe seu pedido</p>
        <h1 className="mt-3 text-4xl font-black text-white">Consulta rápida</h1>
        <p className="mt-4 text-sm leading-7 text-white/65">
          Informe o número do pedido e confirme com seu e-mail ou WhatsApp para ver o status atual sem expor dados de outros clientes.
        </p>

        <div className="mt-6 grid gap-3 rounded-[28px] border border-white/10 bg-black/20 p-5 md:grid-cols-3">
          {[
            "Use o mesmo e-mail ou WhatsApp do checkout.",
            "A consulta mostra status, itens e timeline sem expor dados sensiveis.",
            "Se nao localizar, o atendimento continua por WhatsApp."
          ].map((item) => (
            <p key={item} className="text-sm leading-6 text-white/62">
              {item}
            </p>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="MDH-20260313-0001" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" aria-label="Numero do pedido" />
          <input value={credential} onChange={(event) => setCredential(event.target.value)} placeholder="Seu e-mail ou WhatsApp" className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" aria-label="Email ou WhatsApp" />
          <button disabled={status === "loading"} className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-6 py-3 text-sm font-semibold text-cyan-100 disabled:opacity-60">
            {status === "loading" ? "Consultando..." : "Consultar"}
          </button>
        </form>

        {message ? (
          <p aria-live="polite" className={`mt-4 text-sm ${status === "error" ? "text-rose-200" : "text-emerald-200"}`}>
            {message}
          </p>
        ) : null}

      </div>

      {result ? (
        <div className="mt-6 rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Pedido", value: result.orderNumber },
              { label: "Operação", value: operationalStatusLabels[result.operationalStatus as keyof typeof operationalStatusLabels] || result.operationalStatus },
              { label: "Pagamento", value: paymentStatusLabels[result.paymentStatus as keyof typeof paymentStatusLabels] || result.paymentStatus },
              { label: "Total", value: formatCurrency(result.totalAmount) }
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-2 font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Canal</p>
              <p className="mt-2 text-sm font-semibold text-white">{result.sourceChannel}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Forma de pagamento</p>
              <p className="mt-2 text-sm font-semibold text-white">{paymentMethodLabels[result.paymentMethod as keyof typeof paymentMethodLabels] || result.paymentMethod}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Criado em</p>
              <p className="mt-2 text-sm font-semibold text-white">{new Date(result.placedAt).toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-xl font-black text-white">Itens</h2>
              <div className="mt-4 space-y-3">
                {result.items.map((item) => (
                  <div key={`${item.name}-${item.quantity}`} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{item.name}</p>
                      <span className="text-sm text-white/65">{item.quantity} un.</span>
                    </div>
                    <p className="mt-2 text-sm text-white/55">{formatCurrency(item.lineTotalPix)} no Pix</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Timeline</h2>
              <div className="mt-4 space-y-3">
                {result.timeline.map((event) => (
                  <div key={`${event.eventType}-${event.createdAt}`} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-white">{event.description}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                        {new Date(event.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackWhatsAppClick({ placement: "order_tracking" })}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/12 px-5 py-3 text-sm font-semibold text-emerald-100"
          >
            <MessageCircleMore className="h-4 w-4" />
            Pedir ajuda no WhatsApp
          </a>
          <Link href="/catalogo" className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80">
            Voltar ao catálogo
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-white/60">
            <ShieldCheck className="h-4 w-4" />
            Consulta protegida por numero + email ou WhatsApp
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm text-white/60">
            <Search className="h-4 w-4" />
            Se nao localizar, confirme se o pedido ja foi criado no checkout
          </span>
        </div>
      )}
    </section>
  );
}
