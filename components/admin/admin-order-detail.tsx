'use client';

import { useState } from 'react';

interface OrderDetailProps {
  order: any;
}

export default function AdminOrderDetail({ order }: OrderDetailProps) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(order.invoice || {});
  const [saving, setSaving] = useState(false);

  const handleUpdateOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        alert('Pedido atualizado com sucesso');
      }
    } catch (err) {
      alert('Erro ao atualizar pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          ...invoiceData,
        }),
      });
      if (res.ok) {
        alert('Nota fiscal salva com sucesso');
        setShowInvoice(false);
      }
    } catch (err) {
      alert('Erro ao salvar nota fiscal');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirm('Confirmar pagamento?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          status: 'PAID',
        }),
      });
      if (res.ok) {
        alert('Pagamento confirmado');
        setStatus('PAID');
      }
    } catch (err) {
      alert('Erro ao confirmar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const payment = order.payments?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold"># {order.orderNumber}</h1>
            <p className="text-white/60 mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          <span className={`px-4 py-2 rounded-lg font-semibold ${
            status === 'PAID' ? 'bg-green-500/20 text-green-300' :
            status === 'PENDING_PAYMENT' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/60 text-sm">Cliente</p>
            <p className="font-semibold">{order.customerName}</p>
            <p className="text-white/60 text-sm">{order.customerEmail}</p>
          </div>
          <div>
            <p className="text-white/60 text-sm">Telefone</p>
            <p className="font-semibold">{order.customerPhone || '-'}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Itens</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-white/10">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-white/60 text-sm">SKU: {item.sku} • Qtd: {item.quantity}</p>
              </div>
              <p className="font-semibold">R$ {item.totalPrice.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="glass-panel p-6">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R$ {order.subtotal.toFixed(2)}</span>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>-R$ {order.discountTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frete:</span>
            <span>R$ {order.shippingTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold">
            <span>Total:</span>
            <span>R$ {order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Pagamento</h2>
        {payment ? (
          <div className="space-y-2 mb-4">
            <p><span className="text-white/60">Método:</span> {payment.method}</p>
            <p><span className="text-white/60">Status:</span> {payment.status}</p>
            {payment.pixQrCode && (
              <div>
                <p className="text-white/60 mb-2">PIX QR Code:</p>
                <img src={payment.pixQrCode} alt="QR Code PIX" className="w-32 h-32" />
                {payment.pixPayload && (
                  <p className="text-xs text-white/60 mt-2 break-all">{payment.pixPayload}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/60">Sem pagamento registrado</p>
        )}
        <button
          onClick={handleConfirmPayment}
          disabled={saving || status === 'PAID'}
          className="btn-primary"
        >
          Confirmar Pagamento
        </button>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
          <div className="space-y-2 text-sm">
            <p>{order.shippingAddress.recipientName}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.neighborhood}, {order.shippingAddress.city} - {order.shippingAddress.state}</p>
            <p>CEP: {order.shippingAddress.zipCode}</p>
          </div>
        </div>
      )}

      {/* Invoice */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Nota Fiscal</h2>
        {order.invoice ? (
          <div className="space-y-2 mb-4 text-sm">
            <p><span className="text-white/60">Tipo:</span> {order.invoice.invoiceType}</p>
            <p><span className="text-white/60">Número:</span> {order.invoice.invoiceNumber}</p>
            <p><span className="text-white/60">Série:</span> {order.invoice.invoiceSeries}</p>
            {order.invoice.invoiceKey && <p><span className="text-white/60">Chave:</span> {order.invoice.invoiceKey}</p>}
            {order.invoice.invoiceUrl && (
              <p><a href={order.invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Ver NF-e →</a></p>
            )}
          </div>
        ) : (
          <p className="text-white/60 mb-4">Sem nota fiscal registrada</p>
        )}
        <button
          onClick={() => setShowInvoice(!showInvoice)}
          className="btn-secondary"
        >
          {showInvoice ? 'Cancelar' : 'Registrar NF-e'}
        </button>

        {showInvoice && (
          <div className="mt-4 space-y-3 bg-black/20 p-4 rounded-lg">
            <input
              type="text"
              placeholder="Número da NF-e"
              value={invoiceData.invoiceNumber || ''}
              onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
            />
            <input
              type="text"
              placeholder="Série"
              value={invoiceData.invoiceSeries || ''}
              onChange={(e) => setInvoiceData({...invoiceData, invoiceSeries: e.target.value})}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
            />
            <input
              type="text"
              placeholder="Chave da NF-e"
              value={invoiceData.invoiceKey || ''}
              onChange={(e) => setInvoiceData({...invoiceData, invoiceKey: e.target.value})}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
            />
            <input
              type="url"
              placeholder="URL da NF-e"
              value={invoiceData.invoiceUrl || ''}
              onChange={(e) => setInvoiceData({...invoiceData, invoiceUrl: e.target.value})}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
            />
            <textarea
              placeholder="Observações"
              value={invoiceData.issuerNotes || ''}
              onChange={(e) => setInvoiceData({...invoiceData, issuerNotes: e.target.value})}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
              rows={3}
            />
            <button
              onClick={handleSaveInvoice}
              disabled={saving}
              className="btn-primary w-full"
            >
              Salvar Nota Fiscal
            </button>
          </div>
        )}
      </div>

      {/* Status & Notes */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold mb-4">Status e Observações</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/60 mb-2">Status do Pedido</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
            >
              <option value="PENDING_PAYMENT">Pendente de Pagamento</option>
              <option value="PAID">Pago</option>
              <option value="PRINTING">Em Impressão</option>
              <option value="READY_TO_SHIP">Pronto para Envio</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregue</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white/10 px-3 py-2 rounded border border-white/20"
              rows={4}
            />
          </div>
          <button
            onClick={handleUpdateOrder}
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
