"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircleMore, ShieldCheck, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { CheckoutAddressStep } from "@/components/checkout/checkout-address-step";
import { CheckoutConfirmStep } from "@/components/checkout/checkout-confirm-step";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { CheckoutShippingStep } from "@/components/checkout/checkout-shipping-step";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import {
  CHECKOUT_DRAFT_KEY,
  PAYMENT_STATUS,
  PURPOSE_OPTIONS,
  type AddressBookItem,
  type CheckoutAddress,
  type CheckoutDraft,
  type PurchasePurpose,
  createEmptyAddress,
  readCheckoutDraft,
  normalizeCheckoutAddress,
} from "@/lib/checkout-client";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { useCustomerSession } from "@/lib/customer-session-client";
import { pix, whatsappNumber } from "@/lib/constants";
import { type ShippingOption } from "@/lib/shipping";
import { getProductImageCandidates } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";

export function CheckoutFlow() {
  const searchParams = useSearchParams();
  const session = useCustomerSession();
  const initialProduct = featuredCatalog[0] || catalog[0];
  const queryProductId = searchParams.get("product");
  const queryQty = searchParams.get("qty");
  const queryPurpose = searchParams.get("purpose");

  const [currentStep, setCurrentStep] = useState(0);
  const [productId, setProductId] = useState(initialProduct?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [purchasePurpose, setPurchasePurpose] = useState<PurchasePurpose>("Uso próprio");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [addressMode, setAddressMode] = useState<"saved" | "new">("new");
  const [savedAddresses, setSavedAddresses] = useState<AddressBookItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [address, setAddress] = useState<CheckoutAddress>(createEmptyAddress());
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<"standard" | "express">("standard");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao" | "boleto">("pix");
  const [cardCheckoutReady, setCardCheckoutReady] = useState(false);
  const [paymentsReadyLoaded, setPaymentsReadyLoaded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [pixPayment, setPixPayment] = useState<{
    payload?: string | null;
    qrCodeBase64?: string | null;
    expiresAt?: string | null;
    provider?: string | null;
  } | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const product = useMemo(() => catalog.find((item) => item.id === productId) || initialProduct, [initialProduct, productId]);
  const sortedCatalog = useMemo(
    () =>
      [...catalog].sort((a, b) => {
        const featuredDelta = Number(b.featured) - Number(a.featured);
        if (featuredDelta !== 0) return featuredDelta;
        return a.name.localeCompare(b.name);
      }),
    []
  );
  const selectedSavedAddress = useMemo(
    () => savedAddresses.find((item) => item.id === selectedAddressId) || null,
    [savedAddresses, selectedAddressId]
  );
  const activeAddress = useMemo(
    () => normalizeCheckoutAddress(addressMode === "saved" && selectedSavedAddress ? selectedSavedAddress : address, customerName, phone),
    [address, addressMode, customerName, phone, selectedSavedAddress]
  );
  const selectedShipping = useMemo(
    () => shippingOptions.find((option) => option.id === selectedShippingId) || shippingOptions[0] || null,
    [selectedShippingId, shippingOptions]
  );
  const subtotalPix = product ? Number((product.pricePix * quantity).toFixed(2)) : 0;
  const subtotalCard = product ? Number((product.priceCard * quantity).toFixed(2)) : 0;
  const shippingPrice = selectedShipping?.price || 0;
  const totalPix = Number((subtotalPix + shippingPrice).toFixed(2));
  const totalCard = Number((subtotalCard + shippingPrice).toFixed(2));
  const imageCandidates = useMemo(() => (product ? getProductImageCandidates(product) : []), [product]);
  const addressComplete = Boolean(
    product &&
      customerName.trim() &&
      email.trim() &&
      phone.trim() &&
      activeAddress.label &&
      activeAddress.recipientName &&
      activeAddress.zipCode.length === 8 &&
      activeAddress.line1 &&
      activeAddress.neighborhood &&
      activeAddress.city &&
      activeAddress.state
  );
  const orderChecklist = [
    { label: "Endereço pronto", ready: addressComplete },
    { label: "Envio escolhido", ready: Boolean(selectedShipping) },
    { label: "Pagamento definido", ready: Boolean(paymentMethod) },
    { label: "Pedido confirmado", ready: Boolean(orderCode) },
  ];
  const quantityPresets = [1, 2, 5, 10];
  const paymentTitle = orderCode && product ? `${product.name} • ${orderCode}` : product ? `${product.name} • MDH 3D` : "Pagamento MDH 3D";

  useEffect(() => {
    if (!session.ready || !session.user) return;
    setCustomerName((current) => current || session.user?.displayName || "");
    setEmail((current) => current || session.user?.email || "");
  }, [session.ready, session.user]);

  useEffect(() => {
    if (!session.ready || !session.loggedIn) {
      setSavedAddresses([]);
      setAddressMode("new");
      return;
    }

    let active = true;

    async function loadAddresses() {
      const response = await fetch("/api/account/addresses", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!active) return;

      const addresses = Array.isArray(data?.addresses) ? (data.addresses as AddressBookItem[]) : [];
      setSavedAddresses(addresses);

      if (addresses.length) {
        setSelectedAddressId((current) => current || addresses[0].id);
        setAddressMode((current) => (current === "saved" ? current : "saved"));
      }
    }

    void loadAddresses();
    return () => {
      active = false;
    };
  }, [session.loggedIn, session.ready]);

  useEffect(() => {
    const checkoutStatus = searchParams.get("status");
    const checkoutOrder = searchParams.get("order");
    if (!checkoutStatus) return;
    setStatus(PAYMENT_STATUS[checkoutStatus] || null);
    if (checkoutOrder) {
      setOrderCode(checkoutOrder);
      setPaymentMethod("cartao");
      setCurrentStep(3);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!queryProductId) return;
    const exists = catalog.some((item) => item.id === queryProductId);
    if (exists) setProductId(queryProductId);
  }, [queryProductId]);

  useEffect(() => {
    if (!queryQty) return;
    const parsed = Number(queryQty);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 20) setQuantity(parsed);
  }, [queryQty]);

  useEffect(() => {
    if (!queryPurpose) return;
    const matched = PURPOSE_OPTIONS.find((item) => item.toLowerCase() === queryPurpose.toLowerCase());
    if (matched) setPurchasePurpose(matched);
  }, [queryPurpose]);

  useEffect(() => {
    const draft = readCheckoutDraft();
    if (draft) {
      setDraftRestored(true);
      hydrateFromDraft(draft);
    }
    setDraftHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    async function loadPaymentsStatus() {
      try {
        const response = await fetch("/api/payments/status", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        setCardCheckoutReady(Boolean(data?.cardCheckoutReady));
      } catch {
        if (!active) return;
        setCardCheckoutReady(false);
      } finally {
        if (active) setPaymentsReadyLoaded(true);
      }
    }

    void loadPaymentsStatus();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cardCheckoutReady && paymentMethod === "cartao") setPaymentMethod("pix");
  }, [cardCheckoutReady, paymentMethod]);

  useEffect(() => {
    setShippingOptions([]);
    setShippingError("");
    setSelectedShippingId("standard");
    setOrderCode(null);
    setPixPayload(null);
    if (currentStep > 1) setCurrentStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, quantity, activeAddress.zipCode, activeAddress.line1, activeAddress.neighborhood, activeAddress.city, activeAddress.state]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftHydrated || !product) return;

    const hasMeaningfulDraft =
      quantity > 1 ||
      purchasePurpose !== "Uso próprio" ||
      paymentMethod !== "pix" ||
      selectedShippingId !== "standard" ||
      addressMode !== "new" ||
      productId !== (initialProduct?.id || "") ||
      Boolean(selectedAddressId) ||
      [customerName, email, phone, notes, address.label, address.recipientName, address.zipCode, address.line1, address.line2, address.neighborhood, address.city, address.state].some((item) => item.trim().length > 0);

    if (!hasMeaningfulDraft) {
      window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return;
    }

    const draft: CheckoutDraft = {
      productId,
      quantity,
      purchasePurpose,
      customerName,
      email,
      phone,
      notes,
      addressMode,
      selectedAddressId,
      saveAddress,
      address,
      paymentMethod,
      selectedShippingId,
    };
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [address, addressMode, customerName, draftHydrated, email, initialProduct?.id, notes, paymentMethod, phone, product, productId, purchasePurpose, quantity, saveAddress, selectedAddressId, selectedShippingId]);

  function hydrateFromDraft(draft: CheckoutDraft) {
    if (!queryProductId && draft.productId && catalog.some((item) => item.id === draft.productId)) setProductId(draft.productId);
    if (!queryQty && draft.quantity >= 1 && draft.quantity <= 20) setQuantity(draft.quantity);
    if (!queryPurpose) setPurchasePurpose(draft.purchasePurpose);
    setCustomerName((current) => current || draft.customerName);
    setEmail((current) => current || draft.email);
    setPhone((current) => current || draft.phone);
    setNotes((current) => current || draft.notes);
    setAddressMode(draft.addressMode);
    setSelectedAddressId(draft.selectedAddressId);
    setSaveAddress(draft.saveAddress);
    setAddress({ ...createEmptyAddress(), ...draft.address });
    setPaymentMethod(draft.paymentMethod);
    setSelectedShippingId(draft.selectedShippingId);
  }

  function updateAddress<K extends keyof CheckoutAddress>(field: K, value: CheckoutAddress[K]) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function clearDraft() {
    if (typeof window !== "undefined") window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    setCurrentStep(0);
    setProductId(initialProduct?.id || "");
    setQuantity(1);
    setPurchasePurpose("Uso próprio");
    setCustomerName(session.user?.displayName || "");
    setEmail(session.user?.email || "");
    setPhone("");
    setNotes("");
    setAddressMode(savedAddresses.length ? "saved" : "new");
    setSelectedAddressId(savedAddresses[0]?.id || "");
    setSaveAddress(true);
    setAddress(createEmptyAddress());
    setShippingOptions([]);
    setSelectedShippingId("standard");
    setShippingError("");
    setPaymentMethod("pix");
    setOrderCode(null);
    setPixPayload(null);
    setPixPayment(null);
    setStatus(null);
    setDraftRestored(false);
  }

  async function fetchShippingQuote() {
    if (!product) return false;
    setShippingLoading(true);
    setShippingError("");

    try {
      const response = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity, cep: activeAddress.zipCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.quote) {
        setShippingError(data?.error || "Não foi possível cotar o envio agora.");
        return false;
      }

      const options = Array.isArray(data.quote.options) ? (data.quote.options as ShippingOption[]) : [];
      setShippingOptions(options);
      setSelectedShippingId((current) => (options.some((item) => item.id === current) ? current : "standard"));
      return true;
    } catch {
      setShippingError("Falha de rede ao calcular o envio.");
      return false;
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleContinueToShipping() {
    setStatus(null);
    if (!addressComplete) {
      setStatus("Preencha produto, contato e endereço antes de continuar.");
      return;
    }

    const ok = await fetchShippingQuote();
    if (ok) setCurrentStep(1);
  }

  async function handleSubmitOrder() {
    if (!product || !selectedShipping) return;
    setLoading(true);
    setStatus(null);
    setPixPayload(null);
    setPixPayment(null);
    setOrderCode(null);

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          customerName,
          email,
          phone,
          notes,
          purpose: purchasePurpose,
          paymentMethod,
          saveAddress: session.loggedIn ? saveAddress : false,
          addressId: addressMode === "saved" ? selectedAddressId : undefined,
          shippingOptionId: selectedShipping.id,
          address: {
            ...activeAddress,
            phone: activeAddress.phone || phone,
            recipientName: activeAddress.recipientName || customerName,
          },
        }),
      });
      const orderData = await orderResponse.json().catch(() => ({}));
      if (!orderResponse.ok) {
        setStatus(orderData?.message || "Não foi possível criar o pedido agora.");
        return;
      }

      setOrderCode(orderData.orderCode || null);

      if (paymentMethod === "cartao") {
        const cardResponse = await fetch("/api/checkout/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity,
            email,
            orderCode: orderData.orderCode || undefined,
            amount: totalCard,
          }),
        });
        const cardData = await cardResponse.json().catch(() => ({}));
        if (!cardResponse.ok || !cardData?.initPoint) {
          setStatus(cardData?.fallbackMessage || cardData?.message || "Não foi possível abrir o checkout do cartão agora.");
          return;
        }
        window.location.href = cardData.initPoint;
        return;
      }

      if (paymentMethod === "pix") {
        const pixResponse = await fetch("/api/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${product.name} • ${orderData.orderCode}`,
            amount: totalPix,
            orderCode: orderData.orderCode || undefined,
            email,
            customerName,
          }),
        });
        const pixData = await pixResponse.json().catch(() => ({}));
        if (pixResponse.ok) {
          setPixPayload(pixData.payload || null);
          setPixPayment({
            payload: pixData.payload || null,
            qrCodeBase64: pixData.qrCodeBase64 || null,
            expiresAt: pixData.expiresAt || null,
            provider: pixData.provider === "mercado-pago" ? "Mercado Pago" : "Pix manual",
          });
        }
        setStatus(
          pixData.provider === "mercado-pago"
            ? `Pedido ${orderData.orderCode} criado. O QR dinâmico do Mercado Pago já está pronto abaixo para pagamento imediato.`
            : `Pedido ${orderData.orderCode} criado. O Pix fallback está pronto abaixo. Se preferir, você também pode pagar pela chave ${pix.key}.`
        );
        return;
      }

      setStatus(`Pedido ${orderData.orderCode} criado. Finalize o boleto com a equipe para concluir o pagamento.`);
    } catch {
      setStatus("Falha de rede ao criar o pedido. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  const suggestedRoute = useMemo(() => {
    if (!product) return "Escolha um item para o checkout sugerir a melhor rota.";
    if (purchasePurpose === "Lote" || purchasePurpose === "Revenda" || quantity >= 5) {
      return "Seu cenário pede validação comercial. Vale seguir com o pedido e alinhar condição, repetição e prazo no atendimento.";
    }
    if (purchasePurpose === "Presente") return "Pix costuma ser a rota mais direta quando o foco é garantir prazo e confirmar acabamento com menos atrito.";
    if (cardCheckoutReady && paymentMethod === "cartao") return "O cartão está pronto para seguir no parceiro seguro. Essa rota faz sentido se você quer parcelar e manter o fechamento online.";
    return "Fluxo mais enxuto: endereço válido, envio padrão e Pix para liberar a produção mais rápido.";
  }, [cardCheckoutReady, paymentMethod, product, purchasePurpose, quantity]);

  const whatsappHref = useMemo(() => {
    if (!product) return `https://wa.me/${whatsappNumber}`;
    const message = [
      `Oi! Quero continuar meu pedido ${orderCode || "em aberto"}.`,
      "",
      `Produto: ${product.name}`,
      `Quantidade: ${quantity}`,
      `Objetivo: ${purchasePurpose}`,
      `Cliente: ${customerName || "não informado"}`,
      `WhatsApp: ${phone || "não informado"}`,
      `Email: ${email || "não informado"}`,
      `Endereço: ${activeAddress.line1 || "não informado"}${activeAddress.neighborhood ? `, ${activeAddress.neighborhood}` : ""}`,
      `CEP: ${activeAddress.zipCode || "não informado"}`,
      `Envio: ${selectedShipping ? `${selectedShipping.title} (${selectedShipping.eta})` : "não selecionado"}`,
      `Pagamento escolhido: ${paymentMethod === "pix" ? "Pix" : paymentMethod === "cartao" ? "Cartão de crédito" : "Boleto"}`,
      `Total no Pix: ${formatCurrency(totalPix)}`,
      `Total no cartão: ${formatCurrency(totalCard)}`,
      `Observações: ${notes || "sem observações"}`,
    ].join("\n");
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [activeAddress.line1, activeAddress.neighborhood, activeAddress.zipCode, customerName, email, notes, orderCode, paymentMethod, phone, product, purchasePurpose, quantity, selectedShipping, totalCard, totalPix]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <CheckoutSummary
          product={product}
          imageCandidates={imageCandidates}
          purchasePurpose={purchasePurpose}
          quantity={quantity}
          activeAddress={activeAddress}
          selectedShipping={selectedShipping}
          subtotalPix={subtotalPix}
          subtotalCard={subtotalCard}
          shippingPrice={shippingPrice}
          totalPix={totalPix}
          totalCard={totalCard}
          suggestedRoute={suggestedRoute}
          paymentMethod={paymentMethod}
          paymentTitle={paymentTitle}
          pixPayment={pixPayment}
          orderChecklist={orderChecklist}
          draftRestored={draftRestored}
        />

        <div className="glass-panel p-6 md:p-7">
          <CheckoutStepper currentStep={currentStep} orderCreated={Boolean(orderCode)} onSelect={setCurrentStep} />

          {currentStep === 0 ? (
            <CheckoutAddressStep
              sortedCatalog={sortedCatalog}
              productId={productId}
              quantity={quantity}
              purchasePurpose={purchasePurpose}
              customerName={customerName}
              email={email}
              phone={phone}
              addressMode={addressMode}
              savedAddresses={savedAddresses}
              selectedAddressId={selectedAddressId}
              saveAddress={saveAddress}
              address={address}
              sessionLoggedIn={session.loggedIn}
              quantityPresets={quantityPresets}
              onProductIdChange={setProductId}
              onQuantityChange={setQuantity}
              onPurchasePurposeChange={setPurchasePurpose}
              onCustomerNameChange={setCustomerName}
              onEmailChange={setEmail}
              onPhoneChange={setPhone}
              onAddressModeChange={setAddressMode}
              onSelectedAddressIdChange={setSelectedAddressId}
              onSaveAddressChange={setSaveAddress}
              onAddressChange={updateAddress}
              onContinue={() => void handleContinueToShipping()}
              onClearDraft={clearDraft}
            />
          ) : null}

          {currentStep === 1 ? (
            <CheckoutShippingStep
              activeAddress={activeAddress}
              shippingOptions={shippingOptions}
              selectedShippingId={selectedShippingId}
              shippingLoading={shippingLoading}
              shippingError={shippingError}
              onRecalculate={() => void fetchShippingQuote()}
              onSelectShipping={setSelectedShippingId}
              onBack={() => setCurrentStep(0)}
              onContinue={() => setCurrentStep(2)}
            />
          ) : null}

          {currentStep === 2 ? (
            <CheckoutPaymentStep
              paymentMethod={paymentMethod}
              cardCheckoutReady={cardCheckoutReady}
              paymentsReadyLoaded={paymentsReadyLoaded}
              notes={notes}
              totalPix={totalPix}
              totalCard={totalCard}
              onPaymentMethodChange={setPaymentMethod}
              onNotesChange={setNotes}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
            />
          ) : null}

          {currentStep === 3 ? (
            <CheckoutConfirmStep
              activeAddress={activeAddress}
              selectedShipping={selectedShipping}
              paymentMethod={paymentMethod}
              totalPix={totalPix}
              totalCard={totalCard}
              orderCode={orderCode}
              status={status}
              loading={loading}
              whatsappHref={whatsappHref}
              onBack={() => setCurrentStep(2)}
              onSubmit={() => void handleSubmitOrder()}
              onClearDraft={clearDraft}
            />
          ) : null}

          {status ? <p className="mt-5 text-sm text-amber-200">{status}</p> : null}

          <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
            <p>Seus dados são usados apenas para identificar o pedido, facilitar o pagamento, calcular o envio e permitir o contato sobre produção, entrega e suporte.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel p-6 md:p-7">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-100" />
            <p className="text-sm font-semibold text-cyan-100">Estimativa de entrega</p>
          </div>
          <h2 className="mt-3 text-3xl font-black text-white">Confira frete local antes de fechar.</h2>
          <p className="mt-3 text-sm leading-7 text-white/68">O cálculo abaixo continua disponível como apoio rápido, mesmo com a nova etapa de envio dentro do checkout.</p>
          <div className="mt-6">
            <DeliveryCalculator />
          </div>
        </div>

        <div className="glass-panel p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Boas práticas de fechamento</p>
          <div className="mt-4 grid gap-4">
            {[
              "Se for presente, avise na observação para priorizar acabamento e prazo.",
              "Se for lote, ajuste a quantidade primeiro e continue no WhatsApp para condição comercial.",
              "Use um endereço salvo quando já souber o destino final para reduzir atrito nas próximas compras.",
              "Quando o Pix for a melhor rota, gere o pedido, copie o código e confirme com o código do pedido.",
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/68">
                {item}
              </div>
            ))}
          </div>

          {pixPayload ? (
            <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-semibold text-cyan-50">Pix copia e cola do pedido</p>
              <textarea readOnly value={pixPayload} className="field-base mt-3 min-h-32 resize-none text-xs leading-6" />
            </div>
          ) : null}

          <div className="mt-6">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Falar com a equipe
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
