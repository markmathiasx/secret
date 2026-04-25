'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BadgeCheck, Mail, MessageCircleMore, PackageCheck, ReceiptText, Save, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderDetailProps {
  order: any;
}

function money(value: unknown) {
  return formatCurrency(Number(value || 0));
}

function getStatusTone(status: string) {
  if (status === 'PAID' || status === 'DELIVERED') return 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100';
  if (status === 'PENDING_PAYMENT') return 'border-amber-300/25 bg-amber-300/10 text-amber-100';
  if (status === 'CANCELED' || status === 'REFUNDED') return 'border-rose-300/25 bg-rose-300/10 text-rose-100';
  return 'border-cyan-300/20 bg-cyan-300/10 text-cyan-100';
}

export default function AdminOrderDetail({ order }: OrderDetailProps) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(order.invoice || {});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const payment = order.payments?.[0];
  const whatsappHref = useMemo(() => {
    const phone = String(order.customerPhone || '').replace(/\D/g, '');
    if (!phone) return null;
    const message = [
      `Oi, ${order.customerName || 'tudo bem'}! Aqui é a MDH 3D.`,
      `Estou falando sobre o pedido ${order.orderNumber}.`,
      `Status atual: ${status}.`,
    ].join('\n');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }, [order.customerName, order.customerPhone, order.orderNumber, status]);
  const emailHref = order.customerEmail
    ? `mailto:${order.customerEmail}?subject=${encodeURIComponent(`Pedido ${order.orderNumber} - MDH 3D`)}`
    : null;

  const handleUpdateOrder = async () => {
    setSaving(true);
    setStatusMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erro ao atualizar pedido.');
      setStatusMessage('Pedido atualizado com sucesso.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Erro ao atualizar pedido.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async () => {
    setSaving(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          ...invoiceData,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erro ao salvar nota fiscal.');
      setStatusMessage('Nota fiscal salva com sucesso.');
      setShowInvoice(false);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Erro ao salvar nota fiscal.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSaving(true);
    setStatusMessage('');
    try {
      const res = await fetch('/api/admin/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'PAID',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Erro ao confirmar pagamento.');
      setStatus('PAID');
      setStatusMessage('Pagamento confirmado.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Erro ao confirmar pagamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.13),rgba(2,8,23,0.34))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Pedido</p>
            <h1 className="mt-2 text-3xl font-black text-white"># {order.orderNumber}</h1>
            <p className="mt-2 text-sm text-white/60">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <span className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusTone(status)}`}>
            {status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Cliente</p>
            <p className="mt-2 truncate font-semibold text-white">{order.customerName || 'Cliente sem nome'}</p>
            <p className="mt-1 truncate text-xs text-white/55">{order.customerEmail || 'sem e-mail'}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Telefone</p>
            <p className="mt-2 font-semibold text-white">{order.customerPhone || '-'}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Total</p>
            <p className="mt-2 text-2xl font-black text-emerald-100">{money(order.grandTotal)}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Pagamento</p>
            <p className="mt-2 font-semibold text-white">{payment?.status || 'Sem registro'}</p>
            <p className="mt-1 text-xs text-white/50">{payment?.method || order.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {whatsappHref ? (
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-whatsapp gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Responder no WhatsApp
            </a>
          ) : null}
          {emailHref ? (
            <a href={emailHref} className="btn-secondary gap-2">
              <Mail className="h-4 w-4" />
              Enviar e-mail
            </a>
          ) : null}
          <Link href="/admin/inbox" className="btn-glass gap-2">
            <MessageCircleMore className="h-4 w-4" />
            Abrir inbox
          </Link>
        </div>
      </div>

      {statusMessage ? (
        <div className="rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-100">
              <PackageCheck className="h-5 w-5" />
              <h2 className="text-xl font-bold text-white">Itens</h2>
            </div>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-white/60">SKU: {item.sku} • Qtd: {item.quantity}</p>
                      {item.customizationNotes ? <p className="mt-2 text-sm text-cyan-100">Personalização: {item.customizationNotes}</p> : null}
                    </div>
                    <p className="font-black text-emerald-100">{money(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.shippingAddress ? (
            <div className="glass-panel p-6">
              <div className="mb-4 flex items-center gap-2 text-cyan-100">
                <Truck className="h-5 w-5" />
                <h2 className="text-xl font-bold text-white">Endereço de entrega</h2>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p className="font-semibold text-white">{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                <p>{order.shippingAddress.neighborhood}, {order.shippingAddress.city} - {order.shippingAddress.state}</p>
                <p>CEP: {order.shippingAddress.zipCode}</p>
              </div>
            </div>
          ) : null}

          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-100">
              <ReceiptText className="h-5 w-5" />
              <h2 className="text-xl font-bold text-white">Nota fiscal</h2>
            </div>
            {order.invoice ? (
              <div className="space-y-2 mb-4 text-sm text-white/70">
                <p><span className="text-white/45">Tipo:</span> {order.invoice.invoiceType}</p>
                <p><span className="text-white/45">Número:</span> {order.invoice.invoiceNumber}</p>
                <p><span className="text-white/45">Série:</span> {order.invoice.invoiceSeries}</p>
                {order.invoice.invoiceKey ? <p><span className="text-white/45">Chave:</span> {order.invoice.invoiceKey}</p> : null}
                {order.invoice.invoiceUrl ? (
                  <p><a href={order.invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">Ver NF-e</a></p>
                ) : null}
              </div>
            ) : (
              <p className="mb-4 text-sm text-white/60">Sem nota fiscal registrada.</p>
            )}
            <button onClick={() => setShowInvoice(!showInvoice)} className="btn-secondary">
              {showInvoice ? 'Cancelar' : 'Registrar NF-e'}
            </button>

            {showInvoice ? (
              <div className="mt-4 space-y-3 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <input type="text" placeholder="Número da NF-e" value={invoiceData.invoiceNumber || ''} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} className="field-base" />
                <input type="text" placeholder="Série" value={invoiceData.invoiceSeries || ''} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceSeries: e.target.value })} className="field-base" />
                <input type="text" placeholder="Chave da NF-e" value={invoiceData.invoiceKey || ''} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceKey: e.target.value })} className="field-base" />
                <input type="url" placeholder="URL da NF-e" value={invoiceData.invoiceUrl || ''} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceUrl: e.target.value })} className="field-base" />
                <textarea placeholder="Observações" value={invoiceData.issuerNotes || ''} onChange={(e) => setInvoiceData({ ...invoiceData, issuerNotes: e.target.value })} className="field-base min-h-[96px]" />
                <button onClick={handleSaveInvoice} disabled={saving} className="btn-primary w-full justify-center">
                  Salvar nota fiscal
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-emerald-100">
              <BadgeCheck className="h-5 w-5" />
              <h2 className="text-xl font-bold text-white">Totais</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
              {Number(order.discountTotal || 0) > 0 ? <div className="flex justify-between text-white/70"><span>Desconto</span><span>-{money(order.discountTotal)}</span></div> : null}
              <div className="flex justify-between text-white/70"><span>Frete</span><span>{money(order.shippingTotal)}</span></div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-emerald-100">{money(order.grandTotal)}</span></div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-100">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-xl font-bold text-white">Pagamento</h2>
            </div>
            {payment ? (
              <div className="mb-4 space-y-2 text-sm text-white/70">
                <p><span className="text-white/45">Método:</span> {payment.method}</p>
                <p><span className="text-white/45">Status:</span> {payment.status}</p>
                {payment.pixQrCode ? (
                  <div>
                    <p className="mb-2 text-white/45">PIX QR Code:</p>
                    <Image src={payment.pixQrCode} alt="QR Code PIX" className="h-32 w-32" width={128} height={128} unoptimized />
                    {payment.pixPayload ? <p className="mt-2 break-all text-xs text-white/60">{payment.pixPayload}</p> : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mb-4 text-sm text-white/60">Sem pagamento registrado.</p>
            )}
            <button onClick={handleConfirmPayment} disabled={saving || status === 'PAID'} className="btn-primary w-full justify-center">
              Confirmar pagamento
            </button>
          </div>

          <div className="glass-panel p-6">
            <div className="mb-4 flex items-center gap-2 text-cyan-100">
              <Save className="h-5 w-5" />
              <h2 className="text-xl font-bold text-white">Status e observações</h2>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">Status do pedido</span>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="field-base">
                  <option value="PENDING_PAYMENT">Pendente de pagamento</option>
                  <option value="PAID">Pago</option>
                  <option value="PRINTING">Em impressão</option>
                  <option value="READY_TO_SHIP">Pronto para envio</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregue</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">Observações internas</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-base min-h-[130px]" />
              </label>
              <button onClick={handleUpdateOrder} disabled={saving} className="btn-primary w-full justify-center">
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
