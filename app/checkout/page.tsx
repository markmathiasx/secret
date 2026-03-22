'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageCircleMore,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { DeliveryCalculator } from '@/components/delivery-calculator';
import { PixPaymentCard } from '@/components/pix-payment-card';
import { SafeProductImage } from '@/components/safe-product-image';
import { ProductVisualBadge } from '@/components/product-visual-authenticity';
import { catalog, featuredCatalog } from '@/lib/catalog';
import { useCustomerSession } from '@/lib/customer-session-client';
import { pix, whatsappNumber } from '@/lib/constants';
import { getProductImageCandidates } from '@/lib/product-images';
import { isProductVisualVerified } from '@/lib/product-visuals';
import { formatCurrency } from '@/lib/utils';

const PAYMENT_STATUS: Record<string, string> = {
  success: 'Pagamento aprovado. Assim que a confirmação chegar, o pedido entra na fila de produção.',
  pending: 'Pagamento em análise. Se estiver no cartão, o parceiro ainda está processando a autorização.',
  failure: 'O pagamento não foi concluído. Você pode tentar novamente ou finalizar direto no Pix.',
};
const CHECKOUT_DRAFT_KEY = 'mdh_checkout_draft_v1';
const PURPOSE_OPTIONS = ['Uso próprio', 'Presente', 'Lote', 'Revenda'] as const;
type PurchasePurpose = (typeof PURPOSE_OPTIONS)[number];
type CheckoutDraft = {
  productId: string;
  quantity: number;
  customerName: string;
  email: string;
  phone: string;
  cep: string;
  neighborhood: string;
  notes: string;
  paymentMethod: 'pix' | 'cartao';
  purpose: PurchasePurpose;
};

function readCheckoutDraft() {
  if (typeof window === 'undefined') return null as CheckoutDraft | null;
  try {
    const raw = window.localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutDraft>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      productId: typeof parsed.productId === 'string' ? parsed.productId : '',
      quantity: Number(parsed.quantity) || 1,
      customerName: typeof parsed.customerName === 'string' ? parsed.customerName : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
      cep: typeof parsed.cep === 'string' ? parsed.cep : '',
      neighborhood: typeof parsed.neighborhood === 'string' ? parsed.neighborhood : '',
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
      paymentMethod: parsed.paymentMethod === 'cartao' ? 'cartao' : 'pix',
      purpose: PURPOSE_OPTIONS.includes(parsed.purpose as PurchasePurpose) ? (parsed.purpose as PurchasePurpose) : 'Uso próprio',
    };
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const session = useCustomerSession();
  const initial = featuredCatalog[0] || catalog[0];
  const queryProductId = searchParams.get('product');
  const queryQty = searchParams.get('qty');
  const queryPurpose = searchParams.get('purpose');

  const [productId, setProductId] = useState(initial?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [purchasePurpose, setPurchasePurpose] = useState<PurchasePurpose>('Uso próprio');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [cardCheckoutReady, setCardCheckoutReady] = useState(false);
  const [paymentsReadyLoaded, setPaymentsReadyLoaded] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const product = useMemo(() => catalog.find((item) => item.id === productId) || initial, [initial, productId]);
  const sortedCatalog = useMemo(
    () =>
      [...catalog].sort((a, b) => {
        const verifiedDelta = Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a));
        if (verifiedDelta !== 0) return verifiedDelta;
        const featuredDelta = Number(b.featured) - Number(a.featured);
        if (featuredDelta !== 0) return featuredDelta;
        return a.name.localeCompare(b.name);
      }),
    []
  );

  const totalPix = product ? product.pricePix * quantity : 0;
  const totalCard = product ? product.priceCard * quantity : 0;
  const contactReadiness = [
    Boolean(customerName.trim()),
    Boolean(email.trim()),
    Boolean(phone.trim()),
    Boolean(neighborhood.trim()),
  ].filter(Boolean).length;
  const readinessPercent = Math.round((contactReadiness / 4) * 100);
  const orderChecklist = [
    { label: 'Produto selecionado', ready: Boolean(product) },
    { label: 'Contato preenchido', ready: contactReadiness >= 3 },
    { label: 'Pagamento definido', ready: Boolean(paymentMethod) },
    { label: 'Pedido pronto', ready: Boolean(product) && contactReadiness >= 3 },
  ];
  const quickNotes = [
    'É para presente e tenho urgência.',
    'Quero confirmar cor e acabamento antes de pagar.',
    'Preciso de mais de uma unidade e quero melhor condição.',
    'Quero validar frete e prazo para o meu bairro.',
  ];
  const quantityPresets = [1, 2, 5, 10];
  const paymentTitle = orderCode && product ? `${product.name} • ${orderCode}` : product ? `${product.name} • MDH 3D` : 'Pagamento MDH 3D';
  const imageCandidates = useMemo(() => (product ? getProductImageCandidates(product) : []), [product]);

  useEffect(() => {
    if (!session.ready || !session.user) return;
    setCustomerName((current) => current || session.user?.displayName || '');
    setEmail((current) => current || session.user?.email || '');
  }, [session.ready, session.user]);

  useEffect(() => {
    const checkoutStatus = searchParams.get('status');
    if (!checkoutStatus) return;
    setStatus(PAYMENT_STATUS[checkoutStatus] || null);
  }, [searchParams]);

  useEffect(() => {
    if (!queryProductId) return;
    const exists = catalog.some((item) => item.id === queryProductId);
    if (exists) {
      setProductId(queryProductId);
    }
  }, [queryProductId]);

  useEffect(() => {
    if (!queryQty) return;
    const parsed = Number(queryQty);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 20) {
      setQuantity(parsed);
    }
  }, [queryQty]);

  useEffect(() => {
    if (!queryPurpose) return;
    const matched = PURPOSE_OPTIONS.find((item) => item.toLowerCase() === queryPurpose.toLowerCase());
    if (matched) {
      setPurchasePurpose(matched);
    }
  }, [queryPurpose]);

  useEffect(() => {
    const draft = readCheckoutDraft();
    if (draft) {
      setDraftRestored(true);

      if (!queryProductId && draft.productId && catalog.some((item) => item.id === draft.productId)) {
        setProductId(draft.productId);
      }
      if (!queryQty && draft.quantity >= 1 && draft.quantity <= 20) {
        setQuantity(draft.quantity);
      }
      if (!queryPurpose && draft.purpose) {
        setPurchasePurpose(draft.purpose);
      }
      setCustomerName((current) => current || draft.customerName);
      setEmail((current) => current || draft.email);
      setPhone((current) => current || draft.phone);
      setCep((current) => current || draft.cep);
      setNeighborhood((current) => current || draft.neighborhood);
      setNotes((current) => current || draft.notes);
      setPaymentMethod((current) => (draft.paymentMethod === 'cartao' && current === 'pix' ? 'cartao' : current));
    }
    setDraftHydrated(true);
  }, [queryProductId, queryPurpose, queryQty]);

  useEffect(() => {
    let active = true;

    async function loadPaymentsStatus() {
      try {
        const response = await fetch('/api/payments/status', { cache: 'no-store', credentials: 'same-origin' });
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
    if (!cardCheckoutReady && paymentMethod === 'cartao') {
      setPaymentMethod('pix');
    }
  }, [cardCheckoutReady, paymentMethod]);

  useEffect(() => {
    if (typeof window === 'undefined' || !product || !draftHydrated) return;
    const hasMeaningfulDraft =
      quantity > 1 ||
      purchasePurpose !== 'Uso próprio' ||
      paymentMethod !== 'pix' ||
      productId !== (initial?.id || '') ||
      [customerName, email, phone, cep, neighborhood, notes].some((item) => item.trim().length > 0);

    if (!hasMeaningfulDraft) {
      window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return;
    }

    const draft: CheckoutDraft = {
      productId,
      quantity,
      customerName,
      email,
      phone,
      cep,
      neighborhood,
      notes,
      paymentMethod,
      purpose: purchasePurpose,
    };
    window.localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  }, [customerName, draftHydrated, email, initial?.id, neighborhood, notes, paymentMethod, phone, product, productId, purchasePurpose, quantity, cep]);

  const suggestedRoute = useMemo(() => {
    if (!product) return 'Escolha um item para o checkout sugerir a melhor rota.';
    if (purchasePurpose === 'Lote' || purchasePurpose === 'Revenda' || quantity >= 5) {
      return 'Seu cenário pede validação comercial. Vale gerar o pedido e seguir no WhatsApp para revisar condição, repetição e prazo.';
    }
    if (purchasePurpose === 'Presente') {
      return 'Pix costuma ser a rota mais direta quando o foco é garantir prazo e confirmar acabamento com menos atrito na etapa de pagamento.';
    }
    if (cardCheckoutReady && paymentMethod === 'cartao') {
      return 'O cartão está pronto para seguir no parceiro seguro. Essa rota faz sentido se você quer parcelar e manter o fechamento online.';
    }
    return 'Fluxo mais enxuto: preencher contato, gerar o código do pedido e concluir no Pix para liberar a produção mais rápido.';
  }, [cardCheckoutReady, paymentMethod, product, purchasePurpose, quantity]);

  function clearDraft() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CHECKOUT_DRAFT_KEY);
    }
    setProductId(initial?.id || '');
    setQuantity(1);
    setPurchasePurpose('Uso próprio');
    setCustomerName(session.user?.displayName || '');
    setEmail(session.user?.email || '');
    setPhone('');
    setCep('');
    setNeighborhood('');
    setNotes('');
    setPaymentMethod('pix');
    setDraftRestored(false);
  }

  const whatsappHref = useMemo(() => {
    if (!product) return `https://wa.me/${whatsappNumber}`;

    const message = [
      `Oi! Quero continuar meu pedido ${orderCode || 'em aberto'}.`,
      '',
      `Produto: ${product.name}`,
      `Quantidade: ${quantity}`,
      `Objetivo: ${purchasePurpose}`,
      `Cliente: ${customerName || 'não informado'}`,
      `WhatsApp: ${phone || 'não informado'}`,
      `Email: ${email || 'não informado'}`,
      `Bairro: ${neighborhood || 'não informado'}`,
      `Pagamento escolhido: ${paymentMethod === 'pix' ? 'Pix' : 'Cartão de crédito'}`,
      `Total no Pix: ${formatCurrency(totalPix)}`,
      `Total no cartão: ${formatCurrency(totalCard)}`,
      `Observações: ${notes || 'sem observações'}`,
    ].join('\n');

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [customerName, email, neighborhood, notes, orderCode, paymentMethod, phone, product, purchasePurpose, quantity, totalCard, totalPix]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;

    if (paymentMethod === 'cartao' && !cardCheckoutReady) {
      setStatus('O cartão está sendo tratado pela equipe neste momento. Continue pelo WhatsApp para fechar com suporte humano.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setPixPayload(null);
    setOrderCode(null);

    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
          customerName,
          email,
          phone,
          cep,
          neighborhood,
          notes,
          paymentMethod,
        }),
      });

      const orderData = await orderResponse.json().catch(() => ({}));

      if (!orderResponse.ok) {
        setStatus(orderData?.message || 'Não foi possível criar o pedido agora.');
        return;
      }

      setOrderCode(orderData.orderCode || null);

      if (paymentMethod === 'cartao') {
        const cardResponse = await fetch('/api/checkout/mercadopago', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            quantity,
            email,
            orderCode: orderData.orderCode || undefined,
          }),
        });

        const cardData = await cardResponse.json().catch(() => ({}));

        if (!cardResponse.ok || !cardData?.initPoint) {
          setStatus(cardData?.fallbackMessage || cardData?.message || 'Não foi possível abrir o checkout do cartão agora.');
          return;
        }

        window.location.href = cardData.initPoint;
        return;
      }

      const pixResponse = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${product.name} • ${orderData.orderCode}`, amount: totalPix }),
      });
      const pixData = await pixResponse.json().catch(() => ({}));

      if (pixResponse.ok) {
        setPixPayload(pixData.payload || null);
      }

      setStatus(`Pedido ${orderData.orderCode} criado. Pague no Pix pela chave ${pix.key} ou pelo QR Code abaixo e depois confirme no WhatsApp.`);
    } catch {
      setStatus('Falha de rede ao criar o pedido. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="glass-panel p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Checkout MDH 3D</p>
            <h1 className="mt-3 text-4xl font-black text-white">Resumo claro do pedido e pagamento sem ruído.</h1>
            <p className="mt-4 text-sm leading-7 text-white/65">
              Seu pedido recebe um código antes do pagamento. O Pix fica visível no checkout e o atendimento continua disponível para confirmar qualquer detalhe de material, prazo ou personalização.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {orderChecklist.map((item) => (
                <div key={item.label} className="surface-stat rounded-[18px] px-4 py-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${item.ready ? 'text-emerald-200' : 'text-white/35'}`} />
                    <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {draftRestored ? (
              <div className="mt-6 rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
                Encontramos um checkout salvo neste dispositivo. Você pode continuar de onde parou ou limpar esse rascunho quando concluir o pedido.
              </div>
            ) : null}

            {product ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                  <SafeProductImage candidates={imageCandidates} alt={product.name} className="aspect-square w-full object-cover" />
                </div>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-[80%]">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="glass-chip">{product.category}</span>
                      <ProductVisualBadge product={product} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/65">{product.description}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/65">
                    Quantidade {quantity}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    {purchasePurpose}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Total no Pix</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalPix)}</p>
                    <p className="mt-2 text-xs text-white/55">Pagamento imediato na chave {pix.key}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">Total no cartão</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalCard)}</p>
                    <p className="mt-2 text-xs text-white/55">
                      {cardCheckoutReady ? 'Parcelamento online disponível' : 'Parcelamento com confirmação da equipe'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {quantityPresets.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQuantity(value)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                        quantity === value
                          ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                          : 'border-white/10 bg-white/5 text-white/75'
                      }`}
                    >
                      {value} un.
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-emerald-100">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Pix</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">Chave visível, QR Code e copia e cola no próprio checkout.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Prazo</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">{product?.productionWindow || 'Confirmação em horário comercial'}.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <PackageCheck className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Código</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">O pedido nasce com código para facilitar suporte e confirmação.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Prontidão do pedido</p>
                <span className="text-sm font-semibold text-cyan-100">{readinessPercent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${readinessPercent}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">
                Quanto mais completo estiver nome, contato, bairro e intenção de pagamento, mais rápido a equipe consegue confirmar o pedido.
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-50">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/75">Rota sugerida</p>
              <p className="mt-2">{suggestedRoute}</p>
            </div>
          </div>

          {paymentMethod === 'pix' && product ? (
            <PixPaymentCard title={paymentTitle} amount={totalPix} />
          ) : (
            <div className="glass-panel p-6 md:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Cartão de crédito</p>
              <h2 className="mt-3 text-2xl font-black text-white">
                {cardCheckoutReady ? 'Checkout online em ambiente seguro.' : 'Parcelamento tratado no atendimento humano.'}
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                {cardCheckoutReady
                  ? 'Ao confirmar o pedido, você será direcionado para o ambiente seguro do parceiro de cobrança e depois retorna com o status.'
                  : 'Se você precisar parcelar, a equipe confirma a melhor opção disponível e segue com o fechamento do pedido pelo atendimento.'}
              </p>
            </div>
          )}

          {pixPayload ? (
            <div className="glass-panel p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Pix copia e cola do pedido</p>
              <textarea readOnly value={pixPayload} className="field-base mt-3 min-h-36 resize-none text-xs leading-6" />
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6 md:p-7">
          {draftRestored ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>Seu último rascunho foi restaurado para acelerar a retomada.</p>
                <button type="button" onClick={clearDraft} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100">
                  Limpar rascunho
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Fluxo do checkout</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-white/68">
                <p className="font-semibold text-white">1. Monte o pedido</p>
                <p className="mt-1">Escolha produto, quantidade e contexto de entrega.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-white/68">
                <p className="font-semibold text-white">2. Defina pagamento</p>
                <p className="mt-1">Pix segue visível. Cartão entra quando o parceiro estiver disponível.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-3 text-sm text-white/68">
                <p className="font-semibold text-white">3. Confirme com código</p>
                <p className="mt-1">O atendimento usa o código do pedido para acelerar tudo no suporte.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-white/70">Produto</span>
              <select value={productId} onChange={(event) => setProductId(event.target.value)} className="field-base">
                {sortedCatalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Quantidade</span>
              <input
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value || 1))}
                className="field-base"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {quantityPresets.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuantity(value)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  quantity === value
                    ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                    : 'border-white/10 bg-white/5 text-white/75'
                }`}
              >
                {value} unidade{value > 1 ? 's' : ''}
              </button>
            ))}
          </div>

          <div>
            <span className="mb-2 block text-sm text-white/70">Objetivo da compra</span>
            <div className="flex flex-wrap gap-2">
              {PURPOSE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPurchasePurpose(item)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    purchasePurpose === item
                      ? 'border-cyan-300/35 bg-cyan-300/12 text-cyan-50'
                      : 'border-white/10 bg-white/5 text-white/75'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-white/70">Nome completo</span>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="field-base" autoComplete="name" required />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-base" autoComplete="email" inputMode="email" required />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-white/70">WhatsApp</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="field-base" autoComplete="tel" inputMode="tel" required />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">CEP</span>
              <input value={cep} onChange={(event) => setCep(event.target.value)} className="field-base" autoComplete="postal-code" inputMode="numeric" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Bairro</span>
              <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="field-base" autoComplete="address-level3" required />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('pix')}
              className={`rounded-[24px] border p-4 text-left transition ${paymentMethod === 'pix' ? 'border-emerald-300/35 bg-emerald-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-2 text-emerald-100">
                <QrCode className="h-4 w-4" />
                <span className="text-sm font-semibold">Pix direto</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">Mostra QR Code, copia e cola e a chave {pix.key} já no checkout.</p>
            </button>
            <button
              type="button"
              onClick={() => cardCheckoutReady && setPaymentMethod('cartao')}
              disabled={!cardCheckoutReady}
              className={`rounded-[24px] border p-4 text-left transition ${
                paymentMethod === 'cartao'
                  ? 'border-cyan-300/35 bg-cyan-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              } ${!cardCheckoutReady ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="flex items-center gap-2 text-cyan-100">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-semibold">Cartão de crédito</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {cardCheckoutReady
                  ? 'Abre o checkout seguro do parceiro de cobrança para aprovação online.'
                  : 'Parcelamento tratado pela equipe no atendimento neste momento.'}
              </p>
            </button>
          </div>

          {!cardCheckoutReady && paymentsReadyLoaded ? (
            <div className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
              O Pix segue ativo no site. Se você precisar parcelar, use o WhatsApp para receber orientação da equipe e concluir o pedido com suporte humano.
            </div>
          ) : null}

          <label>
            <span className="mb-2 block text-sm text-white/70">Observações do pedido</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="field-base min-h-28 resize-y" />
          </label>

          <div className="flex flex-wrap gap-2">
            {quickNotes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setNotes((current) => (current ? `${current}\n${item}` : item))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-cyan-300/25 hover:text-cyan-100"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
            <p className="font-semibold text-white">O que acontece depois</p>
            <p className="mt-2 leading-6">
              1. O pedido recebe um código.
              <br />
              2. Você escolhe Pix ou cartão, conforme disponibilidade.
              <br />
              3. A produção começa após confirmação do pagamento.
            </p>
          </div>

          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-50">
            <p className="font-semibold">Atalho útil:</p>
            <p className="mt-1">
              Se você preferir concluir com apoio humano, o WhatsApp já recebe produto, quantidade, bairro e método de pagamento para continuar sem perder o contexto.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar pedido e Pix' : 'Ir para o checkout no cartão'}
            </button>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" /> Falar com a equipe
            </a>
          </div>

          {orderCode ? (
            <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
              Código do pedido: <strong>{orderCode}</strong>
            </div>
          ) : null}

          {status ? <p className="text-sm text-amber-200">{status}</p> : null}

          <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
            <p>
              Seus dados são usados apenas para identificar o pedido, facilitar o pagamento e permitir o contato sobre produção, entrega e suporte.
            </p>
          </div>
        </form>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <div className="glass-panel p-6 md:p-7">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-100" />
            <p className="text-sm font-semibold text-cyan-100">Estimativa de entrega</p>
          </div>
          <h2 className="mt-3 text-3xl font-black text-white">Confira frete local antes de fechar.</h2>
          <p className="mt-3 text-sm leading-7 text-white/68">
            O cálculo abaixo ajuda a reduzir dúvida de região, faixa de frete e prazo base ainda dentro do checkout.
          </p>
          <div className="mt-6">
            <DeliveryCalculator />
          </div>
        </div>

        <div className="glass-panel p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Boas práticas de fechamento</p>
          <div className="mt-4 grid gap-4">
            {[
              'Use o nome do produto e o bairro para o suporte responder sem retrabalho.',
              'Se for presente, avise no campo de observações para priorizar acabamento e prazo.',
              'Se for lote, ajuste a quantidade primeiro e continue no WhatsApp para condição comercial.',
              'Quando o Pix for a melhor rota, copie o código e confirme o pagamento com o código do pedido.',
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/68">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
