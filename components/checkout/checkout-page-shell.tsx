"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, CheckCircle2, Loader2, MessageCircleMore, ShieldCheck, ShoppingBag, Truck, UserRound, Wallet } from "lucide-react";
import { MercadoPagoWallet } from "@/components/checkout/mercadopago-wallet";
import { useCart } from "@/lib/cart-context";
import { calculateCartTotals } from "@/lib/checkout";
import { brand, whatsappNumber } from "@/lib/constants";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { findStorefrontProductById } from "@/lib/products";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

type CheckoutFormState = {
  customerName: string;
  email: string;
  phone: string;
  zipCode: string;
  line1: string;
  line2: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
};

type CheckoutShippingOption = {
  id: string;
  title: string;
  eta: string;
  price: number;
  provider: "mdh-local" | "melhor-envio";
  company?: string;
  recommended?: boolean;
};

const initialFormState: CheckoutFormState = {
  customerName: "",
  email: "",
  phone: "",
  zipCode: "",
  line1: "",
  line2: "",
  neighborhood: "",
  city: "Rio de Janeiro",
  state: "RJ",
  notes: "",
};

const CHECKOUT_DRAFT_KEY = "mdh:checkout:draft:v1";

export function CheckoutPageShell({
  publicKey,
}: {
  publicKey: string;
}) {
  const { hydrated, items, updateQuantity, removeItem } = useCart();
  const [form, setForm] = useState<CheckoutFormState>(initialFormState);
  const [shippingOptions, setShippingOptions] = useState<CheckoutShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null);
  const [shippingStatus, setShippingStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [shippingMessage, setShippingMessage] = useState("");
  const [personalizationByProductId, setPersonalizationByProductId] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<{
    orderCode: string;
    preferenceId: string | null;
    initPoint: string | null;
    totalPix: number;
    totalCard: number;
    paymentFallback?: boolean;
    message?: string | null;
  } | null>(null);
  const selectedShipping =
    shippingOptions.find((option) => option.id === selectedShippingId) ||
    shippingOptions.find((option) => option.recommended) ||
    shippingOptions[0];
  const totals = calculateCartTotals(items, selectedShipping?.price);

  const paymentOnlineReady = Boolean(publicKey.trim());
  const isTestMode = paymentOnlineReady && publicKey.trim().toUpperCase().startsWith("TEST-");
  const checkoutSteps = [
    { id: "cart", label: "Carrinho", done: items.length > 0 },
    { id: "guest", label: "Visitante", done: true },
    { id: "data", label: "Dados", done: Boolean(form.customerName && form.email && form.phone && form.zipCode) },
    { id: "payment", label: "Pagamento", done: Boolean(checkoutSession) },
  ];
  const whatsappHref = useMemo(() => {
    const lines = [
      "Quero finalizar este pedido da MDH 3D:",
      ...items.map((item) => {
        const details = personalizationByProductId[item.productId] || item.personalizationText;
        return `- ${item.quantity}x ${item.title}. Pix: ${formatCurrency(item.pricePix)}. Cartão + R$ 1: ${formatCurrency(calculateCardPrice(item.pricePix))}${details ? ` | personalização: ${details}` : ""}`;
      }),
      `Total Pix: ${formatCurrency(totals.totalPix)}`,
      `Total Cartão + R$ 1: ${formatCurrency(totals.totalCard)}`,
      "Intenção: finalizar checkout.",
      form.customerName ? `Nome: ${form.customerName}` : "",
      form.phone ? `WhatsApp: ${form.phone}` : "",
      form.zipCode ? `CEP: ${form.zipCode}` : "",
      form.line1 ? `Endereço: ${form.line1}${form.line2 ? `, ${form.line2}` : ""}` : "",
      form.neighborhood ? `Bairro: ${form.neighborhood}` : "",
      form.city ? `Cidade: ${form.city}/${form.state}` : "",
      form.notes ? `Observações: ${form.notes}` : "",
    ].filter(Boolean);

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [form, items, personalizationByProductId, totals.totalCard, totals.totalPix]);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;

    try {
      const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CheckoutFormState>;
        setForm((current) => ({ ...current, ...parsed }));
      }
    } catch {}

    trackEvent("begin_checkout", {
      currency: "BRL",
      value: totals.totalPix,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
      items: items.map((item) => ({
        item_id: item.productId,
        item_name: item.title,
        price: item.pricePix,
        quantity: item.quantity,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, items.length]);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    try {
      window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(form));
    } catch {}
  }, [form, hydrated, items.length]);

  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    const cep = form.zipCode.replace(/\D/g, "").slice(0, 8);
    if (cep.length !== 8) {
      setShippingOptions([]);
      setSelectedShippingId(null);
      setShippingStatus("idle");
      setShippingMessage("");
      return;
    }

    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setShippingStatus("loading");
        const response = await fetch("/api/shipping/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cep,
            items: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          quote?: { recommendedOptionId?: string; options?: CheckoutShippingOption[] };
          source?: string;
          error?: string;
        };

        if (!active) return;
        if (!response.ok || !data.ok || !Array.isArray(data.quote?.options)) {
          throw new Error(data.error || "Não foi possível calcular o frete.");
        }

        setShippingOptions(data.quote.options);
        setSelectedShippingId(data.quote.recommendedOptionId || data.quote.options[0]?.id || null);
        setShippingStatus("done");
        setShippingMessage(
          data.source === "melhor-envio"
            ? "Cotação Melhor Envio aplicada em tempo real."
            : "Cotação local aplicada como fallback operacional."
        );
      } catch (err) {
        if (!active) return;
        setShippingStatus("error");
        setShippingMessage(err instanceof Error ? err.message : "Não foi possível calcular o frete.");
      }
    }, 450);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [form.zipCode, hydrated, items]);

  async function handleGenerateCheckout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            personalizationText: personalizationByProductId[item.productId] || item.personalizationText || "",
          })),
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          address: {
            label: "Entrega principal",
            recipientName: form.customerName,
            phone: form.phone,
            zipCode: form.zipCode,
            line1: form.line1,
            line2: form.line2,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
            country: "BR",
          },
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        setError(data?.message || "Não foi possível gerar o checkout agora.");
        return;
      }

      setCheckoutSession({
        orderCode: data.orderCode,
        preferenceId: data.preferenceId || null,
        initPoint: data.initPoint || data.sandboxInitPoint || null,
        totalPix: data.totalPix || totals.totalPix,
        totalCard: data.totalCard || totals.totalCard,
        paymentFallback: Boolean(data.paymentFallback),
        message: data.message || null,
      });
      trackEvent("checkout_order_created", {
        currency: "BRL",
        value: data.totalPix || totals.totalPix,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        payment_fallback: Boolean(data.paymentFallback),
      });
    } catch {
      setError("Erro de conexão ao gerar o checkout. Tente novamente ou feche pelo WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel animate-pulse p-8">
          <div className="h-8 w-48 rounded-full bg-white/10" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
            <div className="h-[540px] rounded-[28px] bg-white/10" />
            <div className="h-[540px] rounded-[28px] bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="glass-panel p-8 text-center md:p-10">
          <p className="section-kicker">Checkout</p>
          <h1 className="section-title">Seu checkout começa no carrinho.</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            Adicione pelo menos um produto para liberar {paymentOnlineReady ? "Pix, cartão e atendimento por WhatsApp." : "Pix e atendimento por WhatsApp."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/carrinho" className="btn-primary">
              Ir para o carrinho
            </Link>
            <Link href="/catalogo" className="btn-secondary">
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-kicker">Checkout</p>
          <h1 className="section-title">Checkout sem cadastro com Pix e cartão claros.</h1>
          <p className="section-copy mt-3 max-w-3xl">
            Você informa só os dados necessários para entrega, gera o pedido com código e escolhe {paymentOnlineReady ? "Mercado Pago ou atendimento humano" : "Pix com atendimento humano"} se quiser acelerar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            {paymentOnlineReady ? (isTestMode ? "Mercado Pago em teste" : "Mercado Pago ativo") : "Pix + atendimento humano"}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
            {selectedShipping ? selectedShipping.title : "Frete em tempo real"}
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.07] p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-wrap gap-2">
          {checkoutSteps.map((step, index) => (
            <span
              key={step.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                step.done
                  ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/5 text-white/55"
              }`}
            >
              {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{index + 1}</span>}
              {step.label}
            </span>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-50">
          <UserRound className="h-4 w-4" />
          Compra como visitante ativa
        </div>
      </div>

      <div className="mb-6 rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-100">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-black text-white">Pix como principal, cartão Pix + R$ 1,00</p>
              <p className="mt-1 text-xs leading-6 text-white/70">
                No cartão, cada produto fica R$ 1,00 acima do Pix. O WhatsApp já leva o carrinho completo.
              </p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-right">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Total cartão</p>
            <p className="mt-1 text-lg font-black text-white">{formatCurrency(totals.totalCard)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <div className="glass-panel p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">Produto e contexto</p>
                <h2 className="mt-2 text-2xl font-black text-white">Venda web-first</h2>
              </div>
              <Link href="/carrinho" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/72 transition hover:border-white/20 hover:text-white">
                Editar carrinho
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {items.map((item) => {
                const storefrontProduct = findStorefrontProductById(item.productId);
                const personalizationEnabled = Boolean(storefrontProduct?.acceptsPersonalizationText);

                return (
                  <article key={item.productId} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-[18px] border border-white/10 bg-black/25">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                            unoptimized
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-2 text-xs text-emerald-100">Pix {formatCurrency(item.pricePix)} cada</p>
                            <p className="mt-1 text-xs text-white/50">Cartão + R$ 1 {formatCurrency(calculateCardPrice(item.pricePix))} cada</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-rose-300/30 hover:text-rose-100"
                          >
                            Remover
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity > 1 ? item.quantity - 1 : 1)}
                              className="rounded-full px-2 py-1 text-sm text-white/72"
                            >
                              -
                            </button>
                            <span className="min-w-7 text-center text-sm font-semibold text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="rounded-full px-2 py-1 text-sm text-white/72"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-white">Pix {formatCurrency(item.pricePix * item.quantity)}</p>
                            <p className="mt-0.5 text-[11px] font-semibold text-white/50">
                              Cartão + R$ 1 {formatCurrency(calculateCardPrice(item.pricePix) * item.quantity)}
                            </p>
                          </div>
                        </div>

                        {personalizationEnabled ? (
                          <label className="mt-4 block">
                            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/72">
                              {storefrontProduct?.personalizationLabel || "Detalhes da personalização"}
                            </span>
                            <textarea
                              value={personalizationByProductId[item.productId] || item.personalizationText || ""}
                              onChange={(event) =>
                                setPersonalizationByProductId((state) => ({
                                  ...state,
                                  [item.productId]: event.target.value,
                                }))
                              }
                              rows={3}
                              placeholder={storefrontProduct?.personalizationPlaceholder || "Explique o nome, frase ou referência"}
                              className="w-full rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                            />
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between text-sm text-white/72">
                <span>Subtotal Pix</span>
                <span>{formatCurrency(totals.subtotalPix)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-white/72">
                <span>Subtotal Cartão</span>
                <span>{formatCurrency(totals.subtotalCard)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-white/72">
                <span>Frete</span>
                <span>{selectedShipping ? `${formatCurrency(totals.shipping)} • ${selectedShipping.eta}` : formatCurrency(totals.shipping)}</span>
              </div>
              <div className="mt-3 h-px bg-white/10" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Pix</span>
                <span className="text-2xl font-black text-emerald-100">{formatCurrency(totals.totalPix)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Cartão</span>
                <span className="text-lg font-black text-white">{formatCurrency(totals.totalCard)}</span>
              </div>
              <p className="mt-3 text-xs leading-6 text-white/48">
                No cartão, cada produto fica R$ 1,00 acima do Pix. Frete não recebe acréscimo.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="grid gap-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "🔒 Seu pedido está seguro",
                  body: "Pedido fica salvo com código antes do pagamento e pode ser retomado a qualquer momento.",
                },
                {
                  icon: Wallet,
                  title: paymentOnlineReady ? "Pix + cartão online" : "Pix + atendimento assistido",
                  body: paymentOnlineReady
                    ? "Você escolhe o método dentro do checkout protegido do Mercado Pago."
                    : "O pedido fica registrado e a equipe orienta o fechamento quando cartão online não estiver habilitado.",
                },
                {
                  icon: Truck,
                  title: "Produção local — Rio de Janeiro",
                  body: `${brand.name} produz com atendimento humano e envia para todo o Brasil.`,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs leading-6 text-white/58">{item.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <form onSubmit={handleGenerateCheckout} className="glass-panel p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">Dados para fechar</p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {checkoutSession ? "Quase lá! ✨" : "Complete o pedido"}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                Sem login obrigatório
              </span>
            </div>

            <div className="mt-5 rounded-[22px] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-100">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Guest checkout liberado</p>
                  <p className="mt-1 text-xs leading-6 text-white/68">
                    Não precisa criar conta antes de pagar. Depois do pedido, você acompanha pelo código, e-mail ou atendimento.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Nome completo</span>
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm((state) => ({ ...state, customerName: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="Seu nome"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">E-mail</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="voce@email.com"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">WhatsApp</span>
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((state) => ({ ...state, phone: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="(21) 99999-9999"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">CEP</span>
                <input
                  required
                  value={form.zipCode}
                  onChange={(event) => setForm((state) => ({ ...state, zipCode: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="00000-000"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Endereço completo</span>
                <input
                  required
                  value={form.line1}
                  onChange={(event) => setForm((state) => ({ ...state, line1: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="Rua, avenida e número"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Complemento</span>
                <input
                  value={form.line2}
                  onChange={(event) => setForm((state) => ({ ...state, line2: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="Apto, bloco, referência"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr_0.4fr]">
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Bairro</span>
                <input
                  required
                  value={form.neighborhood}
                  onChange={(event) => setForm((state) => ({ ...state, neighborhood: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="Bairro"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Cidade</span>
                <input
                  required
                  value={form.city}
                  onChange={(event) => setForm((state) => ({ ...state, city: event.target.value }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="Cidade"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">UF</span>
                <input
                  required
                  maxLength={2}
                  value={form.state}
                  onChange={(event) => setForm((state) => ({ ...state, state: event.target.value.toUpperCase() }))}
                  className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                  placeholder="RJ"
                />
              </label>
            </div>

            <div className="mt-4 rounded-[22px] border border-cyan-300/15 bg-cyan-300/[0.07] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100/72">Frete calculado</p>
                  <p className="mt-1 text-sm text-white/65">
                    {shippingStatus === "loading"
                      ? "Consultando opções de envio..."
                      : shippingMessage || "Digite o CEP para liberar Melhor Envio ou rota local."}
                  </p>
                </div>
                {selectedShipping ? (
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                    {formatCurrency(selectedShipping.price)}
                  </span>
                ) : null}
              </div>
              {shippingOptions.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {shippingOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedShippingId(option.id)}
                      className={`flex items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-left transition ${
                        selectedShipping?.id === option.id
                          ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                          : "border-white/10 bg-black/20 text-white/72 hover:border-white/20"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{option.title}</span>
                        <span className="mt-1 block text-xs opacity-75">
                          {option.company || (option.provider === "melhor-envio" ? "Melhor Envio" : "MDH Local")} • {option.eta}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-black">{formatCurrency(option.price)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="mt-4 grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">Observações do pedido</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((state) => ({ ...state, notes: event.target.value }))}
                className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/35"
                placeholder="Cor desejada, urgência, referência de embalagem ou detalhes do pedido"
              />
            </label>

            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-[20px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary justify-center text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Gerar pedido sem cadastro
              </button>
              <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick("checkout_form")} className="btn-zap justify-center text-base">
                <MessageCircleMore className="mr-2 h-4 w-4" />
                Finalizar via WhatsApp
              </a>
            </div>
          </form>

          <div className="glass-panel p-6 md:p-7">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/72">Pagamento</p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {checkoutSession
                    ? checkoutSession.paymentFallback
                      ? "Pedido registrado. Feche pelo WhatsApp."
                      : paymentOnlineReady
                        ? "Pix e cartão liberados"
                        : "Pedido registrado para fechamento assistido"
                    : paymentOnlineReady
                      ? "Gere o checkout para liberar o pagamento"
                      : "Registre o pedido para fechar pelo atendimento"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
                  {checkoutSession
                    ? checkoutSession.paymentFallback
                      ? checkoutSession.message || `Pedido ${checkoutSession.orderCode} criado. Use o fallback comercial abaixo para concluir agora.`
                      : paymentOnlineReady
                        ? `Pedido ${checkoutSession.orderCode} criado. Pix e cartão aparecem com valores claros no fechamento.`
                        : `Pedido ${checkoutSession.orderCode} criado. A equipe confirma o pagamento e a produção pelo atendimento.`
                    : paymentOnlineReady
                      ? "Preencha os dados acima para criar o pedido e abrir o checkout real do Mercado Pago."
                      : "Preencha os dados acima para registrar o pedido e fechar com atendimento humano."}
                </p>
              </div>
              {checkoutSession ? (
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                  Pedido {checkoutSession.orderCode}
                </span>
              ) : null}
            </div>

            {checkoutSession ? (
              <div className="mt-6 space-y-5">
                <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Total Pix liberado</p>
                      <p className="mt-2 text-3xl font-black text-emerald-100">
                        {formatCurrency(checkoutSession.totalPix)}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white/70">
                        Cartão + R$ 1 {formatCurrency(checkoutSession.totalCard)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/72">
                        Pix
                      </span>
                      {paymentOnlineReady ? (
                        <>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/72">
                            Cartão
                          </span>
                          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                            Mercado Pago
                          </span>
                        </>
                      ) : (
                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                          Atendimento humano
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {checkoutSession.preferenceId && publicKey ? (
                  <MercadoPagoWallet
                    publicKey={publicKey}
                    preferenceId={checkoutSession.preferenceId}
                    initPoint={checkoutSession.initPoint}
                  />
                ) : checkoutSession.paymentFallback ? (
                  <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-50">
                    {checkoutSession.message || "O checkout online não abriu neste momento. O pedido foi salvo e pode ser concluído imediatamente pelo WhatsApp."}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-50">
                    O pagamento online não abriu neste momento. O pedido foi salvo e pode ser concluído imediatamente pelo WhatsApp com os mesmos dados.
                  </div>
                )}

                <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-5">
                  <div className="flex items-start gap-3">
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 p-2 text-emerald-100">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">Fallback comercial imediato</p>
                      <p className="mt-2 text-sm leading-7 text-white/75">
                        Se o checkout não abrir, envie o pedido já preenchido para o WhatsApp e feche com atendimento humano sem perder os dados.
                      </p>
                      <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick("checkout_fallback")} className="btn-zap mt-4 inline-flex text-base">
                        <MessageCircleMore className="mr-2 h-4 w-4" />
                        Finalizar via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
