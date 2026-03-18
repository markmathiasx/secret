'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CreditCard, MessageCircleMore, QrCode, ShieldCheck } from 'lucide-react';
import { PixPaymentCard } from '@/components/pix-payment-card';
import { catalog, featuredCatalog } from '@/lib/catalog';
import { useCustomerSession } from '@/lib/customer-session-client';
import { formatCurrency } from '@/lib/utils';

const PIX_KEY = '21974137662';
const PAYMENT_STATUS: Record<string, string> = {
  success: 'Pagamento aprovado. Assim que a confirmação chegar, o pedido entra na fila de produção.',
  pending: 'Pagamento pendente. Se estiver no cartão, o provedor ainda está processando a autorização.',
  failure: 'O pagamento não foi concluído. Você pode tentar novamente no cartão ou fechar direto no Pix.'
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const session = useCustomerSession();
  const initial = featuredCatalog[0] || catalog[0];

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

  const product = useMemo(() => catalog.find((item) => item.id === productId) || initial, [initial, productId]);
  const totalPix = product ? product.pricePix * quantity : 0;
  const totalCard = product ? product.priceCard * quantity : 0;
  const paymentTitle = orderCode && product ? `${product.name} • ${orderCode}` : product ? `${product.name} • MDH 3D` : 'Pagamento MDH 3D';

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

  const whatsappHref = useMemo(() => {
    if (!product) return 'https://wa.me/5521920137249';

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
      `Observações: ${notes || 'sem observações'}`
    ].join('\n');

    return `https://wa.me/5521920137249?text=${encodeURIComponent(message)}`;
  }, [customerName, email, neighborhood, notes, orderCode, paymentMethod, phone, product, quantity, totalCard, totalPix]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;

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
          paymentMethod
        })
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
            email
          })
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
        body: JSON.stringify({ title: `${product.name} • ${orderData.orderCode}`, amount: totalPix })
      });
      const pixData = await pixResponse.json().catch(() => ({}));

      if (pixResponse.ok) {
        setPixPayload(pixData.payload || null);
      }

      setStatus(`Pedido ${orderData.orderCode} criado. Pague no Pix pela chave ${PIX_KEY} ou pelo QR Code abaixo e depois confirme no WhatsApp.`);
    } catch {
      setStatus('Falha de rede ao criar o pedido. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-7">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Checkout MDH</p>
            <h1 className="mt-3 text-4xl font-black text-white">Fechamento direto, com Pix visível e cartão seguro.</h1>
            <p className="mt-4 text-sm leading-7 text-white/65">
              O pedido é registrado primeiro e depois segue para a forma de pagamento escolhida. Pix mostra chave, QR Code e copia e cola. Cartão abre no checkout hospedado do Mercado Pago.
            </p>

            {product ? (
              <div className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="relative aspect-square w-full overflow-hidden rounded-[24px]">
                  <Image
                    src={`/catalog-assets/${product.id}.webp`}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                    <p className="mt-2 text-sm text-white/65">{product.description}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/65">
                    Quantidade {quantity}
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Total no Pix</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalPix)}</p>
                    <p className="mt-2 text-xs text-white/55">Chave Pix direta: {PIX_KEY}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/50">Total no cartão</p>
                    <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalCard)}</p>
                    <p className="mt-2 text-xs text-white/55">Checkout hospedado pelo Mercado Pago</p>
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
                <p className="mt-3 text-sm leading-6 text-white/68">Pagamento instantâneo na chave 21974137662 com visualização do QR Code no próprio checkout.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Cartão</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">Cartão de crédito com redirecionamento para o ambiente seguro do Mercado Pago, sem expor dados sensíveis no site.</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-cyan-100">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Pedido</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/68">Seu pedido recebe código antes do pagamento, o que facilita suporte, confirmação e acompanhamento pelo WhatsApp.</p>
              </div>
            </div>
          </div>

          {paymentMethod === 'pix' && product ? (
            <PixPaymentCard title={paymentTitle} amount={totalPix} />
          ) : (
            <div className="glass-panel p-6 md:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Cartão de crédito</p>
              <h2 className="mt-3 text-2xl font-black text-white">Checkout hospedado para aprovação segura.</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Ao confirmar o pedido, você será direcionado para o Mercado Pago. O provedor cuida da tela de pagamento e devolve o cliente para este checkout com o status da operação.
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
                {featuredCatalog.slice(0, 24).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
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
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="field-base" required />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field-base" required />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm text-white/70">WhatsApp</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} className="field-base" required />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">CEP</span>
              <input value={cep} onChange={(event) => setCep(event.target.value)} className="field-base" />
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Bairro</span>
              <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} className="field-base" required />
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
              <p className="mt-3 text-sm leading-6 text-white/68">Mostra QR Code, copia e cola e a chave 21974137662 já no checkout.</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cartao')}
              className={`rounded-[24px] border p-4 text-left transition ${paymentMethod === 'cartao' ? 'border-cyan-300/35 bg-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-2 text-cyan-100">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-semibold">Cartão de crédito</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">Abre o checkout seguro do Mercado Pago para aprovação online.</p>
            </button>
          </div>

          <label>
            <span className="mb-2 block text-sm text-white/70">Observações</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="field-base min-h-28 resize-y" />
          </label>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/68">
            <p className="font-semibold text-white">Como funciona agora</p>
            <p className="mt-2 leading-6">
              1. O pedido recebe um código.
              <br />
              2. Se for Pix, você já pode pagar com a chave {PIX_KEY}.
              <br />
              3. Se for cartão, o site abre o checkout do Mercado Pago.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processando...' : paymentMethod === 'pix' ? 'Gerar pedido e Pix' : 'Ir para o checkout no cartão'}
            </button>
            <a href={whatsappHref} className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {status ? <p className="text-sm text-amber-200">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
