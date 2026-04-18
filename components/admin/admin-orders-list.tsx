'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  grandTotal: number;
  status: string;
  paidAt?: string;
  createdAt: string;
  items: any[];
  payments: any[];
}

export function AdminOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/admin/orders?page=${page}`);
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  if (loading) {
    return <div className="text-center py-8">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pedidos ({total})</h2>
        <Link href="/admin/orders/new" className="btn-primary">
          Novo Pedido
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-white/10 rounded-lg">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-2 text-left">Pedido</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Pagamento</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-2 font-mono">{order.orderNumber}</td>
                <td className="px-4 py-2">
                  <div className="text-sm">{order.customerName}</div>
                  <div className="text-xs text-white/60">{order.customerEmail}</div>
                </td>
                <td className="px-4 py-2 text-right font-semibold">R$ {order.grandTotal.toFixed(2)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                    order.status === 'PENDING_PAYMENT' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center text-sm">
                  {order.paidAt ? '✅ Pago' : '⏳ Pendente'}
                </td>
                <td className="px-4 py-2 text-sm">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-2 text-center">
                  <Link href={`/admin/orders/${order.id}`} className="text-cyan-400 hover:underline">
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 text-white/60">Nenhum pedido encontrado</div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="px-4 py-2">Página {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page * 20 >= total}
          className="px-4 py-2 bg-white/10 rounded disabled:opacity-50"
        >
          Próxima →
        </button>
      </div>
    </div>
  );
}
