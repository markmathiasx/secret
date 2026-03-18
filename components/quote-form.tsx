'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircleMore } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { catalog, featuredCatalog, findProduct } from '@/lib/catalog';
import { useCustomerSession } from '@/lib/customer-session-client';
import { getMemberKey, saveQuote } from '@/lib/member-store';
import { formatCurrency } from '@/lib/utils';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

type Props = {
  initialProduct?: Product;
  product?: Product;
  products?: Product[];
  title?: string;
  description?: string;
};

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function QuoteForm({
  initialProduct,
  product,
  products,
  title = 'Solicite um orçamento com briefing claro',
  description = 'Receba retorno com validação de material, prazo, frete e acabamento sem bloquear a navegação pública.'
}: Props) {
  const session = useCustomerSession();
  const availableProducts = useMemo(() => {
    if (products?.length) return products;
    if (initialProduct) return [initialProduct];
    if (product) return [product];
    return featuredCatalog.slice(0, 18);
  }, [initialProduct, product, products]);

  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id || product?.id || availableProducts[0]?.id || catalog[0]?.id || ''
  );
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [colorPreference, setColorPreference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto'>('pix');
  const [notes, setNotes] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' });

  const selectedProduct = useMemo(
    () => initialProduct || product || findProduct(selectedProductId) || availableProducts[0] || null,
    [availableProducts, initialProduct, product, selectedProductId]
  );

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (!session.loggedIn) return;
    setCustomerName(session.user?.displayName || '');
    setCustomerEmail(session.user?.email || '');
  }, [session.loggedIn, session.user?.displayName, session.user?.email]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct) {
      setSubmitState({ kind: 'error', message: 'Selecione um produto antes de enviar o pedido.' });
      return;
    }

    setSubmitState({ kind: 'loading' });

    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.id,
        customerName,
        customerEmail,
        phone,
        cep,
        neighborhood,
        distanceKm: distanceKm ? Number(distanceKm) : 0,
        colorPreference,
        paymentMethod,
        notes
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSubmitState({
        kind: 'error',
        message: data?.message || 'Não foi possível enviar o orçamento agora.'
      });
      return;
    }

    const message =
      data?.storage === 'supabase'
        ? `Orçamento ${data.quoteId} registrado com sucesso.`
        : `Orçamento ${data.quoteId} recebido em modo vitrine. Continue o fechamento pelo WhatsApp.`;

    const memberKey = getMemberKey({ id: session.user?.id, email: session.user?.email });
    saveQuote(memberKey, {
      quoteId: String(data.quoteId),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      pricePix: selectedProduct.pricePix,
      estimatedDeliveryFee: 0,
      totalPix: selectedProduct.pricePix,
      paymentMethod,
      createdAt: new Date().toISOString()
    });

    setSubmitState({ kind: 'success', message });
    setCustomerName(session.user?.displayName || '');
    setCustomerEmail(session.user?.email || '');
    setPhone('');
    setCep('');
    setNeighborhood('');
    setDistanceKm('');
    setColorPreference('');
    setPaymentMethod('pix');
    setNotes('');
  }

  if (!selectedProduct) return null;

  return (
    <section id="orcamento" className="glass-panel p-6 md:p-7">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Orçamento</p>
          <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-white/65">{description}</p>
        </div>
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
          <MessageCircleMore className="h-4 w-4" />
          Falar no WhatsApp
        </a>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Produto em destaque</p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{selectedProduct.name}</h3>
            <p className="mt-1 text-sm text-white/60">
              {selectedProduct.category} • {selectedProduct.collection}
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Preço base no Pix</p>
            <p className="mt-1 text-2xl font-black text-cyan-100">{formatCurrency(selectedProduct.pricePix)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {!initialProduct && !product ? (
          <label className="block">
            <span className="mb-2 block text-sm text-white/70">Produto</span>
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="field-base">
              {availableProducts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/70">Seu nome</span>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="field-base" autoComplete="name" required />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">Email</span>
            <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" className="field-base" autoComplete="email" inputMode="email" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/70">WhatsApp</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field-base" autoComplete="tel" inputMode="tel" required />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">CEP</span>
            <input value={cep} onChange={(e) => setCep(e.target.value)} className="field-base" autoComplete="postal-code" inputMode="numeric" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/70">Bairro</span>
            <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="field-base" autoComplete="address-level3" required />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">Distância em km</span>
            <input value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className="field-base" inputMode="decimal" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm text-white/70">Cor desejada</span>
            <input value={colorPreference} onChange={(e) => setColorPreference(e.target.value)} className="field-base" required />
          </label>
          <label>
            <span className="mb-2 block text-sm text-white/70">Pagamento</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cartao' | 'boleto')} className="field-base">
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-white/70">Observações</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-base min-h-28 resize-y" />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={submitState.kind === 'loading'}>
            {submitState.kind === 'loading' ? 'Enviando...' : 'Enviar orçamento'}
          </button>
          {submitState.kind === 'success' ? <p className="text-sm text-emerald-200">{submitState.message}</p> : null}
          {submitState.kind === 'error' ? <p className="text-sm text-amber-200">{submitState.message}</p> : null}
        </div>
      </form>
    </section>
  );
}
