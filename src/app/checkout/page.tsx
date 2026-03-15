"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CreditCard, MessageCircle, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PixPaymentCard } from "@/components/pix-payment-card";
import { useStore } from "@/components/store-provider";
import { buildCheckoutWhatsAppMessage, buildWhatsAppHref, formatInstallments } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

const statusMap = {
  success: {
    title: "Pagamento aprovado",
    text: "Recebemos a confirmação do pagamento. Nossa equipe vai seguir com produção e atualização pelo WhatsApp.",
    color: "text-emerald-200"
  },
  pending: {
    title: "Pagamento pendente",
    text: "Seu pagamento está em análise. Assim que aprovar, o pedido será liberado para produção.",
    color: "text-amber-200"
  },
  failure: {
    title: "Pagamento não concluído",
    text: "Não houve confirmação de pagamento. Você pode tentar novamente por Pix ou falar com atendimento.",
    color: "text-rose-200"
  }
} as const;

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const { cartItems, cartSubtotalCard, cartSubtotalPix } = useStore();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const status = searchParams.get("status");
  const statusInfo = status ? statusMap[status as keyof typeof statusMap] : null;

  const whatsappHref = useMemo(
    () =>
      buildWhatsAppHref(
        buildCheckoutWhatsAppMessage({
          items: cartItems.map((item) => ({ name: item.product.name, quantity: item.quantity })),
          totalPix: cartSubtotalPix,
          customerName,
          cep,
          paymentMethod
        })
      ),
    [cartItems, cartSubtotalPix, cep, customerName, paymentMethod]
  );

  async function startCardCheckout() {
    if (!cartItems.length) return;

    try {
      setLoading(true);
      setCheckoutMessage("");

      const response = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          customerName,
          phone,
          email,
          cep,
          address,
          neighborhood
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setCheckoutMessage(data.fallbackMessage || data.message || "Não foi possível iniciar o checkout.");
        return;
      }

      if (data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }

      setCheckoutMessage("Checkout iniciado, mas o link de pagamento não retornou.");
    } catch {
      setCheckoutMessage("Erro de rede ao iniciar o checkout.");
    } finally {
      setLoading(false);
    }
  }

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Checkout</p>
        <h1 className="mt-3 text-4xl font-black text-white">Nenhum item para finalizar</h1>
        <p className="mt-4 text-white/65">Adicione produtos ao carrinho antes de abrir o checkout.</p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Voltar ao catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Checkout</p>
      <h1 className="mt-3 text-4xl font-black text-white">Fechamento simples</h1>
      <p className="mt-4 max-w-3xl text-white/70">
        Revise seus itens, escolha pagamento e siga por Pix, Mercado Pago ou atendimento via WhatsApp.
      </p>

      {statusInfo ? (
        <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <h2 className={`text-2xl font-black ${statusInfo.color}`}>{statusInfo.title}</h2>
          <p className="mt-2 text-white/65">{statusInfo.text}</p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Dados do pedido</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Seu nome"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="WhatsApp"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="E-mail"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <input
                value={cep}
                onChange={(event) => setCep(event.target.value)}
                placeholder="CEP"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <input
                value={neighborhood}
                onChange={(event) => setNeighborhood(event.target.value)}
                placeholder="Bairro"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Endereço / referência"
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <label className="mt-4 block text-sm text-white/70">
              <span className="mb-2 block">Pagamento</span>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              >
                <option value="pix">Pix</option>
                <option value="cartao">Cartão / Mercado Pago</option>
                <option value="whatsapp">Confirmar pelo WhatsApp</option>
              </select>
            </label>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <a
                href={whatsappHref}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-50"
              >
                <MessageCircle className="h-4 w-4" />
                Fechar pelo WhatsApp
              </a>
              <button
                type="button"
                disabled={paymentMethod !== "cartao" || loading}
                onClick={startCardCheckout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {loading ? "Abrindo pagamento..." : "Pagar com Mercado Pago"}
              </button>
            </div>

            {checkoutMessage ? <p className="mt-4 text-sm text-amber-200">{checkoutMessage}</p> : null}
          </div>

          {paymentMethod === "pix" ? <PixPaymentCard title="Pedido MDH 3D" amount={cartSubtotalPix} /> : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Resumo</p>
            <h2 className="mt-2 text-2xl font-black text-white">Seu pedido</h2>

            <div className="mt-5 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-black/20 p-4"
                >
                  <div>
                    <p className="font-semibold text-white">{item.product.name}</p>
                    <p className="mt-1 text-sm text-white/55">
                      {item.quantity}x {item.product.category}
                    </p>
                  </div>
                  <p className="font-semibold text-cyan-100">{formatCurrency(item.subtotalPix)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm">
              <div className="flex items-center justify-between text-white/65">
                <span>Total no Pix</span>
                <span className="font-semibold text-white">{formatCurrency(cartSubtotalPix)}</span>
              </div>
              <div className="flex items-center justify-between text-white/65">
                <span>Total no cartão</span>
                <span className="font-semibold text-white">{formatCurrency(cartSubtotalCard)}</span>
              </div>
              <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-50">
                Parcelamento sugerido: {formatInstallments(cartSubtotalCard)}.
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-cyan-200" />
              <div>
                <h3 className="text-lg font-semibold text-white">Prazo e frete</h3>
                <p className="mt-2 text-sm leading-7 text-white/60">
                  Confirme o CEP para fechar a estimativa de frete. O prazo final considera produção, acabamento e rota local no RJ.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/carrinho"
                className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
              >
                Voltar ao carrinho
              </Link>
              <Link
                href="/entregas"
                className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white"
              >
                Revisar frete
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
