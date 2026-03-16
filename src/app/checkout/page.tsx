'use client';

import { useMemo, useState } from 'react';
import { MessageCircleMore } from 'lucide-react';
import { catalog, featuredCatalog } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

export default function CheckoutPage() {
  const initial = featuredCatalog[0] || catalog[0];
  const [productId, setProductId] = useState(initial?.id || '');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'boleto'>('pix');
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const product = useMemo(() => catalog.find((item) => item.id === productId) || initial, [initial, productId]);
  const totalPix = product ? product.pricePix * quantity : 0;
  const totalCard = product ? product.priceCard * quantity : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;

    setLoading(true);
    setStatus(null);
    setPixPayload(null);

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
      setLoading(false);
      return;
    }

    if (paymentMethod === 'pix') {
      const pixResponse = await fetch('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `${product.name} • ${orderData.orderCode}`, amount: totalPix })
      });
      const pixData = await pixResponse.json().catch(() => ({}));
      if (pixResponse.ok) {
        setPixPayload(pixData.payload || null);
      }
    }

    const whatsappText = encodeURIComponent(
      `Oi! Quero continuar o pedido ${orderData.orderCode}.\n\nProduto: ${product.name}\nQuantidade: ${quantity}\nCliente: ${customerName}\nWhatsApp: ${phone}\nEmail: ${email}\nBairro: ${neighborhood}\nPagamento: ${paymentMethod}\nTotal Pix: ${formatCurrency(totalPix)}\nTotal Cartão: ${formatCurrency(totalCard)}\nObservações: ${notes || 'sem observações'}`
    );

    setStatus(`Pedido ${orderData.orderCode} criado com sucesso. Continue no WhatsApp: https://wa.me/5521920137249?text=${whatsappText}`);
    setLoading(false);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel p-6 md:p-7">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Resumo do pedido</p>
          <h1 className="mt-3 text-4xl font-black text-white">Checkout leve para fechar rápido</h1>
          <p className="mt-4 text-sm leading-7 text-white/65">Esta versão cria o pedido, registra os dados principais e te leva para a confirmação final no WhatsApp.</p>

          {product ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
              <img src={`/catalog-assets/${product.id}.webp`} alt={product.name} className="aspect-square w-full rounded-[20px] object-cover" />
              <h2 className="mt-4 text-2xl font-bold text-white">{product.name}</h2>
              <p className="mt-2 text-sm text-white/65">{product.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Total no Pix</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalPix)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Total no cartão</p>
                  <p className="mt-2 text-2xl font-black text-white">{formatCurrency(totalCard)}</p>
                </div>
              </div>
            </div>
          ) : null}

          {pixPayload ? (
            <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-cyan-400/10 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Pix copia e cola</p>
              <textarea readOnly value={pixPayload} className="field-base mt-3 min-h-36 resize-none text-xs leading-6" />
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="glass-panel space-y-5 p-6 md:p-7">
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-white/70">Produto</span>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="field-base">
                {featuredCatalog.slice(0, 24).map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm text-white/70">Quantidade</span>
              <input type="number" min={1} max={20} value={quantity} onChange={(e) => setQuantity(Number(e.target.value || 1))} className="field-base" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="mb-2 block text-sm text-white/70">Nome completo</span><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="field-base" required /></label>
            <label><span className="mb-2 block text-sm text-white/70">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field-base" required /></label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label><span className="mb-2 block text-sm text-white/70">WhatsApp</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="field-base" required /></label>
            <label><span className="mb-2 block text-sm text-white/70">CEP</span><input value={cep} onChange={(e) => setCep(e.target.value)} className="field-base" /></label>
            <label><span className="mb-2 block text-sm text-white/70">Bairro</span><input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="field-base" required /></label>
          </div>

          <label>
            <span className="mb-2 block text-sm text-white/70">Forma de pagamento</span>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as 'pix' | 'cartao' | 'boleto')} className="field-base">
              <option value="pix">Pix</option>
              <option value="cartao">Cartão</option>
              <option value="boleto">Boleto</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-white/70">Observações</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-base min-h-28 resize-y" />
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando pedido...' : 'Criar pedido'}
            </button>
            <a href="https://wa.me/5521920137249" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {status ? <p className="text-sm text-amber-200">{status}</p> : null}
        </form>
      </div>
    </section>
  );
}
