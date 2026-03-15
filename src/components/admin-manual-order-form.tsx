"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";
import type { CartCustomerDraft } from "@/components/cart-provider";
import { buttonFamilies } from "@/components/ui/buttons";
import { CONTACT_PREFERENCES, PAYMENT_METHODS, SOURCE_CHANNELS } from "@/lib/commerce";
import { formatCurrency } from "@/lib/utils";

type ManualOrderFormProps = {
  products: Product[];
};

type OrderLine = {
  productId: string;
  quantity: number;
};

const emptyCustomer: CartCustomerDraft = {
  fullName: "",
  whatsapp: "",
  email: "",
  contactPreference: "whatsapp",
  notes: "",
  postalCode: "",
  street: "",
  number: "",
  complement: "",
  reference: "",
  neighborhood: "",
  city: "",
  state: "RJ"
};

export function AdminManualOrderForm({ products }: ManualOrderFormProps) {
  const [customer, setCustomer] = useState({ ...emptyCustomer });
  const [items, setItems] = useState<OrderLine[]>([{ productId: products[0]?.id || "", quantity: 1 }]);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [sourceChannelId, setSourceChannelId] = useState("whatsapp");
  const [shippingAmount, setShippingAmount] = useState("0");
  const [customerNotes, setCustomerNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const summary = useMemo(() => {
    const subtotalPix = items.reduce((total, item) => {
      const product = productMap.get(item.productId);
      return total + (product ? product.pricePix * item.quantity : 0);
    }, 0);
    const subtotalCard = items.reduce((total, item) => {
      const product = productMap.get(item.productId);
      return total + (product ? product.priceCard * item.quantity : 0);
    }, 0);
    const shipping = Number(shippingAmount || 0);
    const total = (paymentMethod === "card" ? subtotalCard : subtotalPix) + shipping;

    return {
      subtotalPix,
      subtotalCard,
      shipping,
      total
    };
  }, [items, paymentMethod, productMap, shippingAmount]);

  function updateItem(index: number, next: Partial<OrderLine>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/orders/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer,
        items,
        paymentMethod,
        sourceChannelId,
        shippingAmount: Number(shippingAmount || 0),
        customerNotes
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.message || "Falha ao criar pedido manual.");
      return;
    }

    if (data?.redirectTo) {
      window.location.href = data.redirectTo;
      return;
    }

    setStatus("idle");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-3 rounded-[28px] border border-white/10 bg-black/20 p-5 md:grid-cols-3">
        {[
          "Use este fluxo para WhatsApp, Instagram, Shopee, Mercado Livre, Amazon, Americanas e outros canais.",
          "O pedido manual entra na mesma fila do site, com timeline, pagamento e notas internas.",
          "A origem e a forma de pagamento ficam congeladas para rastreabilidade operacional."
        ].map((item) => (
          <p key={item} className="text-sm leading-6 text-white/62">
            {item}
          </p>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Nome completo</span>
          <input value={customer.fullName} onChange={(event) => setCustomer((current) => ({ ...current, fullName: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">WhatsApp</span>
          <input value={customer.whatsapp} onChange={(event) => setCustomer((current) => ({ ...current, whatsapp: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Email</span>
          <input value={customer.email} onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))} type="email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Canal de origem</span>
          <select value={sourceChannelId} onChange={(event) => setSourceChannelId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            {SOURCE_CHANNELS.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Contato preferido</span>
          <select value={customer.contactPreference} onChange={(event) => setCustomer((current) => ({ ...current, contactPreference: event.target.value as CartCustomerDraft["contactPreference"] }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            {CONTACT_PREFERENCES.map((preference) => (
              <option key={preference.id} value={preference.id}>
                {preference.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="text-sm text-white/68">
          <span className="mb-2 block">CEP</span>
          <input value={customer.postalCode} onChange={(event) => setCustomer((current) => ({ ...current, postalCode: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Rua</span>
          <input value={customer.street} onChange={(event) => setCustomer((current) => ({ ...current, street: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Número</span>
          <input value={customer.number} onChange={(event) => setCustomer((current) => ({ ...current, number: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Complemento</span>
          <input value={customer.complement} onChange={(event) => setCustomer((current) => ({ ...current, complement: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Referência</span>
          <input value={customer.reference} onChange={(event) => setCustomer((current) => ({ ...current, reference: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Bairro</span>
          <input value={customer.neighborhood} onChange={(event) => setCustomer((current) => ({ ...current, neighborhood: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Cidade</span>
          <input value={customer.city} onChange={(event) => setCustomer((current) => ({ ...current, city: event.target.value }))} required className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">Itens do pedido</h2>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, { productId: products[0]?.id || "", quantity: 1 }])}
            className={buttonFamilies.secondary}
          >
            Adicionar item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="grid gap-3 lg:grid-cols-[1fr_120px_auto]">
              <select value={item.productId} onChange={(event) => updateItem(index, { productId: event.target.value })} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => updateItem(index, { quantity: Number(event.target.value) || 1 })}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                disabled={items.length === 1}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 disabled:opacity-40"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 md:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Subtotal Pix</p>
            <p className="mt-2 text-lg font-bold text-white">{formatCurrency(summary.subtotalPix)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Subtotal cartão</p>
            <p className="mt-2 text-lg font-bold text-white">{formatCurrency(summary.subtotalCard)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Frete</p>
            <p className="mt-2 text-lg font-bold text-white">{formatCurrency(summary.shipping)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Total do meio escolhido</p>
            <p className="mt-2 text-lg font-bold text-cyan-100">{formatCurrency(summary.total)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Forma de pagamento</span>
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
            {PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Frete</span>
          <input value={shippingAmount} onChange={(event) => setShippingAmount(event.target.value)} type="number" min={0} step="0.01" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
        <label className="text-sm text-white/68">
          <span className="mb-2 block">Estado</span>
          <input value={customer.state} onChange={(event) => setCustomer((current) => ({ ...current, state: event.target.value }))} maxLength={2} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Resumo operacional</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Canal</p>
            <p className="mt-2 text-sm font-semibold text-white">{SOURCE_CHANNELS.find((item) => item.id === sourceChannelId)?.label || sourceChannelId}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pagamento</p>
            <p className="mt-2 text-sm font-semibold text-white">{PAYMENT_METHODS.find((item) => item.id === paymentMethod)?.label || paymentMethod}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente</p>
            <p className="mt-2 text-sm font-semibold text-white">{customer.fullName || "A preencher"}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Total</p>
            <p className="mt-2 text-sm font-semibold text-cyan-100">{formatCurrency(summary.total)}</p>
          </div>
        </div>
      </div>

      <label className="block text-sm text-white/68">
        <span className="mb-2 block">Observações do pedido</span>
        <textarea value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
      </label>

      {status === "error" ? <p className="text-sm text-rose-200">{message}</p> : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className={`${buttonFamilies.secondary} w-full disabled:opacity-60`}
      >
        {status === "loading" ? "Criando pedido..." : "Criar pedido manual"}
      </button>
    </form>
  );
}
