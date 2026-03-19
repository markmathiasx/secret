'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Clock3, CreditCard, MessageCircleMore, PackageCheck, QrCode, ShieldCheck } from 'lucide-react';
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

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const session = useCustomerSession();
  const initial = featuredCatalog[0] || catalog[0];
  const queryProductId = searchParams.get('product');

  const [productId, setProductId] = useState(initial?.id || '');
  const [quantity, setQuantity] = useState(1);
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

  const whatsappHref = useMemo(() => {
    if (!product) return `https://wa.me/${whatsappNumber}`;

    const message = [
      `Oi! Quero continuar meu pedido ${orderCode || 'em aberto'}.`,
      '',
      `Produto: ${product.name}`,
      `Quantidade: ${quantity}`,
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
  }, [customerName, email, neighborhood, notes, orderCode, paymentMethod, phone, product, quantity, totalCard, totalPix]);

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

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar pedido e Pix' : 'Ir para o checkout no cartão'}
            </button>
            <a href={whatsappHref} className="btn-secondary inline-flex items-center gap-2">
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
    </section>
  );
}
