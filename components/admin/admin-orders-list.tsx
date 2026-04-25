'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircleMore, RefreshCcw, Search, ShoppingBag, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (search.trim()) params.set('search', search.trim());
        if (status) params.set('status', status);
        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Falha ao buscar pedidos.');
        setOrders(data.orders || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar pedidos.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, search, status]);

  const visibleRevenue = orders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);
  const paidOrders = orders.filter((order) => order.paidAt || order.status === 'PAID').length;

  if (loading) {
    return <div className="glass-panel p-8 text-center text-white/70">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),rgba(2,8,23,0.34))] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Administração comercial</p>
            <h2 className="mt-2 text-3xl font-black text-white">Pedidos ({total})</h2>
            <p className="mt-2 text-sm text-white/60">Filtre, abra detalhes, confirme pagamento e responda o cliente sem sair do painel.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/inbox" className="btn-secondary gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Inbox
            </Link>
            <button type="button" onClick={() => setPage(1)} className="btn-glass gap-2">
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Valor da página</p>
            <p className="mt-2 text-2xl font-black text-emerald-100">{formatCurrency(visibleRevenue)}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Pagos na página</p>
            <p className="mt-2 text-2xl font-black text-white">{paidOrders}</p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Ticket médio visível</p>
            <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(orders.length ? visibleRevenue / orders.length : 0)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar pedido, cliente ou e-mail"
              className="field-base pl-11"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="field-base"
          >
            <option value="">Todos os status</option>
            <option value="PENDING_PAYMENT">Pendente de pagamento</option>
            <option value="PAID">Pago</option>
            <option value="PRINTING">Em impressão</option>
            <option value="READY_TO_SHIP">Pronto para envio</option>
            <option value="SHIPPED">Enviado</option>
            <option value="DELIVERED">Entregue</option>
            <option value="CANCELED">Cancelado</option>
          </select>
        </div>
      </div>

      {error ? <div className="rounded-[18px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{error}</div> : null}

      <div className="overflow-x-auto rounded-[26px] border border-white/10 bg-black/20">
        <table className="w-full min-w-[940px]">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-white/45">Pedido</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-white/45">Cliente</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.16em] text-white/45">Total</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-white/45">Status</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-white/45">Pagamento</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] text-white/45">Data</th>
              <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-white/45">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-sm text-white">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-white">{order.customerName || 'Cliente sem nome'}</div>
                  <div className="text-xs text-white/60">{order.customerEmail}</div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-emerald-100">{formatCurrency(Number(order.grandTotal || 0))}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    order.status === 'PAID' ? 'bg-green-500/20 text-green-300' :
                    order.status === 'PENDING_PAYMENT' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm">
                  {order.paidAt || order.status === 'PAID' ? 'Pago' : 'Pendente'}
                </td>
                <td className="px-4 py-3 text-sm text-white/70">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/orders/${order.id}`} className="btn-glass inline-flex px-3 py-2 text-xs">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 py-8 text-center text-white/60">
          <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-white/25" />
          Nenhum pedido encontrado
        </div>
      )}

      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn-glass px-4 py-2 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          <TrendingUp className="h-4 w-4" />
          Página {page}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page * 20 >= total}
          className="btn-glass px-4 py-2 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
