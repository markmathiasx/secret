"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, MapPinHouse, MessageCircleMore, ShieldCheck, WalletCards } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { buttonFamilies } from "@/components/ui/buttons";
import { ProductMediaImage } from "@/components/product-media-image";
import { trackEvent, trackWhatsAppClick } from "@/lib/analytics-client";
import { formatCurrency, formatInstallment } from "@/lib/utils";

type CheckoutResponse = {
  ok: boolean;
  orderId: string;
  orderNumber: string;
  whatsappUrl: string;
  payment: {
    method: string;
    pixPayload?: string;
    qrCodeDataUrl?: string;
    initPoint?: string | null;
    fallbackMessage?: string | null;
  };
};

type CheckoutField =
  | "fullName"
  | "whatsapp"
  | "email"
  | "postalCode"
  | "street"
  | "number"
  | "neighborhood"
  | "city"
  | "state";

type CheckoutFieldErrors = Partial<Record<CheckoutField, string>>;

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatWhatsappInput(value: string) {
  const digits = normalizeDigits(value).slice(0, 13);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
}

function formatPostalCodeInput(value: string) {
  const digits = normalizeDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function validateCheckoutDraft(input: {
  fullName: string;
  whatsapp: string;
  email: string;
  postalCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}) {
  const errors: CheckoutFieldErrors = {};

  if (input.fullName.trim().length < 6) errors.fullName = "Informe nome e sobrenome.";
  if (normalizeDigits(input.whatsapp).length < 10) errors.whatsapp = "Informe um WhatsApp valido com DDD.";
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.email = "Digite um email valido.";
  if (normalizeDigits(input.postalCode).length !== 8) errors.postalCode = "CEP deve ter 8 digitos.";
  if (input.street.trim().length < 3) errors.street = "Rua ou avenida obrigatoria.";
  if (input.number.trim().length < 1) errors.number = "Numero obrigatorio.";
  if (input.neighborhood.trim().length < 2) errors.neighborhood = "Bairro obrigatorio.";
  if (input.city.trim().length < 2) errors.city = "Cidade obrigatoria.";
  if (input.state.trim().length !== 2) errors.state = "Use a UF com 2 letras.";

  return errors;
}

function getCheckoutPromise(windows: string[]) {
  if (!windows.length) return "Prazo confirmado apos o pedido.";
  if (windows.length === 1) return windows[0];
  return `${windows[0]} e variacoes da vitrine`;
}

type CheckoutPageProps = {
  cardEnabled?: boolean;
};

export function CheckoutPage({ cardEnabled = false }: CheckoutPageProps) {
  const { items, subtotalPix, subtotalCard, customerDraft, setCustomerDraft, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "cash" | "other">("pix");
  const [shippingAmount, setShippingAmount] = useState("0");
  const [customerNotes, setCustomerNotes] = useState(customerDraft.notes || "");
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const [postalCodeState, setPostalCodeState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [postalCodeMessage, setPostalCodeMessage] = useState("");
  const postalCodeLookupRef = useRef("");
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!cardEnabled && paymentMethod === "card") {
      setPaymentMethod("pix");
    }
  }, [cardEnabled, paymentMethod]);

  useEffect(() => {
    if (items.length) {
      trackEvent("begin_checkout", {
        itemCount: items.length,
        subtotalPix,
        subtotalCard
      });
    }
  }, [items.length, subtotalCard, subtotalPix]);

  useEffect(() => {
    trackEvent("order_payment_selected", {
      paymentMethod,
      cardEnabled
    });
  }, [cardEnabled, paymentMethod]);

  const totalAmount = useMemo(() => {
    const shipping = Number(shippingAmount || 0);
    return (paymentMethod === "card" ? subtotalCard : subtotalPix) + shipping;
  }, [paymentMethod, shippingAmount, subtotalCard, subtotalPix]);
  const productionWindows = useMemo(
    () => Array.from(new Set(items.map((item) => item.snapshot.productionWindow))).filter(Boolean),
    [items]
  );
  const checkoutPromise = useMemo(() => getCheckoutPromise(productionWindows), [productionWindows]);

  function clearFieldError(field: CheckoutField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function lookupPostalCode(rawPostalCode: string) {
    const digits = rawPostalCode.replace(/\D/g, "");
    if (digits.length !== 8 || postalCodeLookupRef.current === digits) return;

    postalCodeLookupRef.current = digits;
    setPostalCodeState("loading");
    setPostalCodeMessage("");

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || data?.erro) {
        setPostalCodeState("error");
        setPostalCodeMessage("Nao consegui localizar esse CEP automaticamente. Voce pode preencher manualmente.");
        return;
      }

      setCustomerDraft({
        street: data.logradouro || customerDraft.street,
        neighborhood: data.bairro || customerDraft.neighborhood,
        city: data.localidade || customerDraft.city,
        state: data.uf || customerDraft.state,
        complement: data.complemento || customerDraft.complement
      });
      setPostalCodeState("ready");
      setPostalCodeMessage("Endereco sugerido pelo CEP. Ajuste numero e referencia antes de criar o pedido.");
    } catch {
      setPostalCodeState("error");
      setPostalCodeMessage("Falha ao consultar o CEP agora. O checkout continua normalmente com preenchimento manual.");
    }
  }

  if (!items.length && !result) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="premium-panel rounded-[36px] p-10 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Checkout</p>
          <h1 className="mt-4 text-4xl font-black text-white">Seu pedido ainda nao tem itens</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62">
            Volte ao carrinho, escolha suas pecas e retorne para finalizar a compra com tranquilidade.
          </p>
          <Link href="/carrinho" className={`${buttonFamilies.primary} mt-8 inline-flex`}>
            Ir para o carrinho
          </Link>
        </div>
      </section>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateCheckoutDraft({
      fullName: customerDraft.fullName,
      whatsapp: customerDraft.whatsapp,
      email: customerDraft.email,
      postalCode: customerDraft.postalCode,
      street: customerDraft.street,
      number: customerDraft.number,
      neighborhood: customerDraft.neighborhood,
      city: customerDraft.city,
      state: customerDraft.state
    });

    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      setStatus("error");
      setMessage("Revise os campos destacados antes de criar o pedido.");
      return;
    }

    setStatus("loading");
    setMessage("");
    setFieldErrors({});

    const payload = {
      customer: {
        ...customerDraft,
        whatsapp: normalizeDigits(customerDraft.whatsapp),
        postalCode: normalizeDigits(customerDraft.postalCode),
        state: customerDraft.state.toUpperCase(),
        notes: customerNotes
      },
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      paymentMethod,
      sourceChannelId: "site",
      shippingAmount: Number(shippingAmount || 0),
      customerNotes
    };

    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(data?.message || "Falha ao criar pedido.");
        return;
      }

      setResult(data);
      setStatus("success");
      trackEvent("order_created", {
        orderNumber: data.orderNumber,
        paymentMethod: data.payment?.method,
        orderId: data.orderId
      });
      clearCart();

      if (data?.payment?.method === "card" && data?.payment?.initPoint) {
        window.location.href = data.payment.initPoint;
        return;
      }
    } catch {
      setStatus("error");
      setMessage("Nao consegui falar com a API da loja agora. Tente novamente em instantes.");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="premium-panel mb-6 grid gap-3 rounded-[32px] p-4 md:grid-cols-4">
        {[
          { icon: ShoppingStep, title: "1. Carrinho", text: "Itens e precos revisados" },
          { icon: MapPinHouse, title: "2. Seus dados", text: "Entrega e contato preenchidos com clareza" },
          { icon: WalletCards, title: "3. Pagamento", text: "Pix em destaque e cartao quando disponivel" },
          { icon: ShieldCheck, title: "4. Pedido confirmado", text: "Numero, acompanhamento e suporte prontos" }
        ].map((step) => (
          <div key={step.title} className="premium-card rounded-[24px] bg-black/20 p-4">
            <step.icon className="h-5 w-5 text-cyan-200" />
            <p className="mt-3 text-sm font-semibold text-white">{step.title}</p>
            <p className="mt-2 text-xs leading-6 text-white/55">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onSubmit} className="premium-panel rounded-[36px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Compra rapida e segura</p>
          <h1 className="mt-3 text-4xl font-black text-white">Finalizar pedido</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">
            Preencha seus dados, escolha a forma de pagamento e confirme seu pedido em poucos minutos, com tudo claro do primeiro campo ate a confirmacao.
          </p>

          <div className="premium-card mt-6 grid gap-3 rounded-[28px] bg-black/20 p-4 md:grid-cols-3">
            {[
              "Compra simples, sem senha e sem etapas desnecessarias.",
              "Numero do pedido criado na hora para acompanhamento.",
              "Pix com copia e cola e suporte rapido no WhatsApp."
            ].map((copy) => (
              <p key={copy} className="text-sm leading-6 text-white/68">
                {copy}
              </p>
            ))}
          </div>

          <div className="premium-card mt-8 rounded-[30px] bg-black/20 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Contato</p>
                <p className="mt-2 text-sm text-white/58">Esses dados ajudam a confirmar a entrega, agilizar o atendimento e deixar seu acompanhamento mais simples.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                  Compra simples
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Nome completo</span>
                <input
                  value={customerDraft.fullName}
                  onChange={(event) => {
                    clearFieldError("fullName");
                    setCustomerDraft({ fullName: event.target.value });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  placeholder="Ex.: Maria Souza"
                  className={`premium-input ${fieldErrors.fullName ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.fullName ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.fullName}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">WhatsApp</span>
                <input
                  value={customerDraft.whatsapp}
                  onChange={(event) => {
                    clearFieldError("whatsapp");
                    setCustomerDraft({ whatsapp: formatWhatsappInput(event.target.value) });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.whatsapp)}
                  inputMode="tel"
                  placeholder="(21) 99999-9999"
                  className={`premium-input ${fieldErrors.whatsapp ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.whatsapp ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.whatsapp}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Email</span>
                <input
                  value={customerDraft.email}
                  onChange={(event) => {
                    clearFieldError("email");
                    setCustomerDraft({ email: event.target.value });
                  }}
                  type="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  placeholder="voce@exemplo.com"
                  className={`premium-input ${fieldErrors.email ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.email ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.email}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Contato preferido</span>
                <select
                  value={customerDraft.contactPreference}
                  onChange={(event) => setCustomerDraft({ contactPreference: event.target.value as any })}
                  className="premium-select"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Ligacao</option>
                </select>
              </label>
            </div>
          </div>

          <div className="premium-card mt-6 rounded-[30px] bg-black/20 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Entrega</p>
                <p className="mt-2 text-sm text-white/58">Preencha seu endereco para receber uma estimativa clara de prazo e deixar o pedido pronto para entrega.</p>
              </div>
                <span className="premium-badge premium-badge-neutral text-[11px]">
                    Prazo estimado: {checkoutPromise}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm text-white/68">
                <span className="mb-2 block">CEP</span>
                <input
                  value={customerDraft.postalCode}
                  onChange={(event) => {
                    clearFieldError("postalCode");
                    setCustomerDraft({ postalCode: formatPostalCodeInput(event.target.value) });
                  }}
                  onBlur={(event) => void lookupPostalCode(event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.postalCode)}
                  inputMode="numeric"
                  placeholder="00000-000"
                  className={`premium-input ${fieldErrors.postalCode ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.postalCode ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.postalCode}</span> : null}
              </label>
              <label className="text-sm text-white/68 md:col-span-2">
                <span className="mb-2 block">Rua</span>
                <input
                  value={customerDraft.street}
                  onChange={(event) => {
                    clearFieldError("street");
                    setCustomerDraft({ street: event.target.value });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.street)}
                  placeholder="Rua, avenida ou travessa"
                  className={`premium-input ${fieldErrors.street ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.street ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.street}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Numero</span>
                <input
                  value={customerDraft.number}
                  onChange={(event) => {
                    clearFieldError("number");
                    setCustomerDraft({ number: event.target.value });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.number)}
                  className={`premium-input ${fieldErrors.number ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.number ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.number}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Complemento</span>
                <input value={customerDraft.complement} onChange={(event) => setCustomerDraft({ complement: event.target.value })} className="premium-input" />
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Referencia</span>
                <input value={customerDraft.reference} onChange={(event) => setCustomerDraft({ reference: event.target.value })} placeholder="Portaria, loja, bloco..." className="premium-input" />
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Bairro</span>
                <input
                  value={customerDraft.neighborhood}
                  onChange={(event) => {
                    clearFieldError("neighborhood");
                    setCustomerDraft({ neighborhood: event.target.value });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.neighborhood)}
                  className={`premium-input ${fieldErrors.neighborhood ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.neighborhood ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.neighborhood}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Cidade</span>
                <input
                  value={customerDraft.city}
                  onChange={(event) => {
                    clearFieldError("city");
                    setCustomerDraft({ city: event.target.value });
                  }}
                  required
                  aria-invalid={Boolean(fieldErrors.city)}
                  className={`premium-input ${fieldErrors.city ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.city ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.city}</span> : null}
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Estado</span>
                <input
                  value={customerDraft.state}
                  onChange={(event) => {
                    clearFieldError("state");
                    setCustomerDraft({ state: event.target.value.toUpperCase() });
                  }}
                  maxLength={2}
                  required
                  aria-invalid={Boolean(fieldErrors.state)}
                  className={`premium-input uppercase ${fieldErrors.state ? "border-rose-300/50" : ""}`}
                />
                {fieldErrors.state ? <span className="mt-2 block text-xs text-rose-200">{fieldErrors.state}</span> : null}
              </label>
            </div>
          </div>
          {postalCodeMessage ? (
            <p
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-[24px] border px-4 py-3 text-sm ${
                postalCodeState === "ready"
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100/90"
                  : postalCodeState === "loading"
                    ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100/90"
                    : "border-amber-300/20 bg-amber-300/10 text-amber-100/90"
              }`}
            >
              {postalCodeState === "loading" ? "Consultando CEP..." : postalCodeMessage}
            </p>
          ) : null}

          <div className="premium-card mt-6 rounded-[30px] bg-black/20 p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Pagamento</p>
                <p className="mt-2 text-sm text-white/58">Pix segue como o melhor caminho para fechar agora. Cartao aparece como opcao extra quando estiver disponivel.</p>
              </div>
                <span className="premium-badge premium-badge-success text-[11px]">
                  Pix prioritario
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Forma de pagamento</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as any)} className="premium-select">
                  <option value="pix">Pix</option>
                  <option value="card" disabled={!cardEnabled}>Cartao{cardEnabled ? "" : " (indisponivel agora)"}</option>
                  <option value="cash">Dinheiro</option>
                  <option value="other">Outro</option>
                </select>
              </label>
              <label className="text-sm text-white/68">
                <span className="mb-2 block">Frete</span>
                <input value={shippingAmount} onChange={(event) => setShippingAmount(event.target.value)} type="number" min={0} step="0.01" className="premium-input" />
              </label>
            </div>
          </div>
          {!cardEnabled ? (
            <p className="mt-4 rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100/85">
              Cartao esta temporariamente indisponivel. Voce ainda pode concluir sua compra com Pix e seguir com atendimento rapido pelo WhatsApp se precisar.
            </p>
          ) : null}

          <label className="mt-6 block text-sm text-white/68">
            <span className="mb-2 block">Observacoes</span>
            <textarea
              value={customerNotes}
              onChange={(event) => {
                setCustomerNotes(event.target.value);
                setCustomerDraft({ notes: event.target.value });
              }}
              placeholder="Cor desejada, ponto de referencia, urgencia ou observacao do presente..."
              className="premium-textarea"
            />
          </label>

          {message ? (
            <p
              role={status === "error" ? "alert" : "status"}
              aria-live={status === "error" ? "assertive" : "polite"}
              className={`mt-5 text-sm ${status === "error" ? "text-rose-200" : "text-emerald-200"}`}
            >
              {message}
            </p>
          ) : null}

          <button ref={submitButtonRef} type="submit" disabled={status === "loading"} className={`${buttonFamilies.primary} mt-6 w-full py-4 disabled:opacity-60`}>
            {status === "loading" ? "Criando pedido..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="premium-panel rounded-[36px] p-6 xl:sticky xl:top-36">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Resumo do pedido</p>
            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="premium-card flex items-center justify-between gap-3 rounded-[24px] bg-black/20 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ProductMediaImage
                      product={{
                        imagePath: item.snapshot.imagePath,
                        name: item.snapshot.name,
                        sku: item.snapshot.sku,
                        category: item.snapshot.category
                      }}
                      className="h-16 w-16 rounded-[18px] border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{item.snapshot.name}</p>
                      <p className="text-xs text-white/45">{item.quantity} unidade(s)</p>
                      <p className="text-xs text-white/45">{item.snapshot.productionWindow}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(item.snapshot.pricePix * item.quantity)}</p>
                    <p className="text-xs text-white/45">Pix</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="premium-card mt-6 space-y-3 rounded-[28px] bg-black/20 p-5">
              <div className="flex items-center justify-between text-sm text-white/65">
                <span>Subtotal Pix</span>
                <strong className="text-white">{formatCurrency(subtotalPix)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-white/65">
                <span>Subtotal Cartão</span>
                <strong className="text-white">{formatCurrency(subtotalCard)}</strong>
              </div>
              <div className="flex items-center justify-between text-sm text-white/65">
                <span>Frete</span>
                <strong className="text-white">{formatCurrency(Number(shippingAmount || 0))}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/65">
                <span>Total da compra</span>
                <strong className="text-xl text-white">{formatCurrency(totalAmount)}</strong>
              </div>
              <div className="text-xs text-white/45">Parcelamento estimado: {formatInstallment(subtotalCard)}</div>
                <div className="text-xs text-white/45">Prazo estimado para essa selecao: {checkoutPromise}</div>
            </div>

            <div className="premium-card mt-5 grid gap-3 rounded-[28px] bg-black/20 p-5">
              {[
                "Seus itens entram no pedido com nome, SKU e preco confirmados no momento da compra.",
                "O pedido pode ser acompanhado com numero + email ou WhatsApp.",
                "Se o cartao estiver indisponivel, voce continua comprando com Pix e atendimento."
              ].map((item) => (
                <p key={item} className="text-sm leading-6 text-white/62">
                  {item}
                </p>
              ))}
            </div>
          </div>

          {result ? (
            <div
              role="status"
              aria-live="polite"
              className="premium-panel rounded-[36px] border-emerald-400/20 bg-emerald-400/10 p-6"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100/80">Pedido criado</p>
              <h2 className="mt-3 text-3xl font-black text-white">{result.orderNumber}</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Seu pedido ja esta confirmado na loja, com resumo pronto para acompanhamento. Se quiser, continue o atendimento no WhatsApp com a mensagem organizada.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  `Pagamento: ${result.payment.method === "pix" ? "Pix" : result.payment.method === "card" ? "Cartao" : "Manual"}`,
                  `Contato: ${customerDraft.contactPreference}`,
                  `Entrega: ${customerDraft.city}/${customerDraft.state}`
                ].map((item) => (
                  <div key={item} className="premium-card rounded-[24px] bg-black/20 px-4 py-3 text-sm text-white/68">
                    {item}
                  </div>
                ))}
              </div>

              {result.payment.method === "pix" && result.payment.qrCodeDataUrl ? (
                <div className="premium-card mt-5 rounded-[28px] bg-black/20 p-5">
                  <img src={result.payment.qrCodeDataUrl} alt={`QR Code Pix do pedido ${result.orderNumber}`} className="mx-auto h-56 w-56 rounded-[24px] bg-white p-3" />
                  <textarea
                    readOnly
                    value={result.payment.pixPayload}
                    className="premium-textarea mt-4 min-h-24 bg-slate-950 text-xs text-white/75"
                  />
                </div>
              ) : null}

              <div className="mt-5 grid gap-3">
                {result.payment.method === "card" && result.payment.fallbackMessage ? (
                  <p className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100/85">
                    {result.payment.fallbackMessage}
                  </p>
                ) : null}
                <a
                  href={result.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackWhatsAppClick({ placement: "checkout_success", orderNumber: result.orderNumber })}
                  className={buttonFamilies.primaryPix}
                >
                  <MessageCircleMore className="h-4 w-4" />
                  Continuar no WhatsApp
                </a>
                <Link href={`/acompanhar-pedido?order=${result.orderNumber}`} className={buttonFamilies.secondary}>
                  Acompanhar pedido
                </Link>
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {!result ? (
        <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
          <div className="premium-floating-bar flex items-center justify-between gap-3 rounded-full px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Total selecionado</p>
              <p className="truncate text-sm font-semibold text-white">{formatCurrency(totalAmount)}</p>
            </div>
            <button
              type="button"
              onClick={() => submitButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className={buttonFamilies.primary}
            >
              Finalizar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ShoppingStep(props: React.ComponentProps<typeof CheckCircle2>) {
  return <CheckCircle2 {...props} />;
}
