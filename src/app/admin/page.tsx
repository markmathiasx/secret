import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDashboardStats, listOrders } from "@/lib/order-service";
import { formatCurrency } from "@/lib/utils";
import { operationalStatusLabels, paymentStatusLabels, sourceChannelLabels } from "@/lib/commerce";
import { databaseUnavailableMessage } from "@/lib/database-status";

export default async function AdminHome() {
  const session = await requireAdminSession();
  let databaseWarning = "";
  let stats = {
    totalOrders: 0,
    totalSold: 0,
    ordersToday: 0,
    pendingOrders: 0,
    waitingPayment: 0,
    inProduction: 0,
    completed: 0,
    delivered: 0,
    canceled: 0
  };
  let orders: Awaited<ReturnType<typeof listOrders>> = [];

  try {
    [stats, orders] = await Promise.all([getDashboardStats(), listOrders()]);
  } catch {
    databaseWarning = databaseUnavailableMessage;
  }
  const recentOrders = orders.slice(0, 8);

  return (
    <AdminShell
      email={session.email}
      title="Painel operacional"
      description="Acompanhe produção, pagamento, entrega e pedidos novos em um único lugar."
    >
      {databaseWarning ? (
        <div className="mb-6 rounded-[28px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100/85">
          {databaseWarning}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pedidos totais", value: String(stats.totalOrders).padStart(2, "0"), href: "/admin/pedidos" },
          { label: "Vendido", value: formatCurrency(stats.totalSold), href: "/admin/pedidos" },
          { label: "Pedidos hoje", value: String(stats.ordersToday).padStart(2, "0"), href: "/admin/pedidos" },
          { label: "Pedidos pendentes", value: String(stats.pendingOrders).padStart(2, "0"), href: "/admin/pedidos?operationalStatus=waiting_payment" },
          { label: "Aguardando pagamento", value: String(stats.waitingPayment).padStart(2, "0"), href: "/admin/pedidos?paymentStatus=pending" },
          { label: "Em produção", value: String(stats.inProduction).padStart(2, "0"), href: "/admin/pedidos?operationalStatus=in_production" },
          { label: "Finalizados", value: String(stats.completed).padStart(2, "0"), href: "/admin/pedidos?operationalStatus=completed" },
          { label: "Entregues", value: String(stats.delivered).padStart(2, "0"), href: "/admin/pedidos?operationalStatus=delivered" },
          { label: "Cancelados", value: String(stats.canceled).padStart(2, "0"), href: "/admin/pedidos?operationalStatus=canceled" }
        ].map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(2,8,23,0.18)] transition hover:border-cyan-300/35 hover:-translate-y-0.5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">{card.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(2,8,23,0.18)] lg:grid-cols-4">
        {[
          { title: "Fila completa", href: "/admin/pedidos", copy: "Busca, filtros por origem, pagamento e operação." },
          { title: "Criar pedido externo", href: "/admin/novo-pedido", copy: "Cadastre vendas de WhatsApp, Instagram ou marketplace." },
          { title: "Saúde do stack", href: "/api/health", copy: "Cheque banco, imagens e prontidão operacional.", external: true },
          { title: "Acompanhar pedido", href: "/acompanhar-pedido", copy: "Valide a experiência pública de consulta.", external: true }
        ].map((item) =>
          item.external ? (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-white/20"
            >
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{item.copy}</p>
            </a>
          ) : (
            <Link key={item.title} href={item.href} className="rounded-[24px] border border-white/10 bg-black/20 p-4 transition hover:border-white/20">
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{item.copy}</p>
            </Link>
          )
        )}
      </div>

      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Fila recente</p>
            <h2 className="mt-2 text-2xl font-black text-white">Pedidos mais recentes</h2>
          </div>
          <Link href="/admin/pedidos" className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-100">
            Ver fila completa
          </Link>
        </div>

        {recentOrders.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/72">
              <thead className="text-xs uppercase tracking-[0.18em] text-white/40">
                <tr>
                  <th className="pb-3 pr-4">Pedido</th>
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Origem</th>
                  <th className="pb-3 pr-4">Operação</th>
                  <th className="pb-3 pr-4">Pagamento</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-0" />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((row) => (
                  <tr key={row.order.id} className="border-t border-white/8">
                    <td className="py-4 pr-4 font-semibold text-white">{row.order.orderNumber}</td>
                    <td className="py-4 pr-4">
                      <div className="font-medium text-white">{row.customer.fullName}</div>
                      <div className="text-xs text-white/45">{row.customer.whatsapp}</div>
                    </td>
                    <td className="py-4 pr-4">{sourceChannelLabels[row.order.sourceChannelId as keyof typeof sourceChannelLabels] || row.order.sourceChannelId}</td>
                    <td className="py-4 pr-4">{operationalStatusLabels[row.order.operationalStatus]}</td>
                    <td className="py-4 pr-4">
                      <div>{paymentStatusLabels[row.order.paymentStatus]}</div>
                      <div className="text-xs text-white/45">{row.latestPayment?.method || row.order.paymentMethod}</div>
                    </td>
                    <td className="py-4 pr-4 font-semibold text-white">{formatCurrency(row.order.totalAmount)}</td>
                    <td className="py-4 pr-0 text-right">
                      <Link href={`/admin/pedidos/${row.order.id}`} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold text-white/80">
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-8 text-sm text-white/55">
            {databaseWarning
              ? "O painel abriu com fallback de sessão, mas o banco ainda não está acessível para carregar a fila."
              : "Nenhum pedido encontrado ainda. Depois de rodar migrations e seed, o checkout real passa a alimentar esta fila."}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
