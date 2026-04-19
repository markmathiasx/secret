import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { canConnectToDatabase, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const connected = await canConnectToDatabase();

  const [orderCount, userCount, totalRevenue] = connected
    ? await Promise.all([
        prisma.order.count(),
        prisma.user.count(),
        prisma.order
          .aggregate({ _sum: { grandTotal: true }, where: { status: { in: ["PAID", "PRINTING", "READY_TO_SHIP", "SHIPPED", "DELIVERED"] } } })
          .then((r: unknown) => Number((r as { _sum: { grandTotal: unknown } })._sum.grandTotal ?? 0)),
      ])
    : [0, 0, 0];

  const recentOrders: { orderNumber: string; status: string; grandTotal: unknown; createdAt: Date; customerName: string | null }[] = connected
    ? await prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { orderNumber: true, status: true, grandTotal: true, createdAt: true, customerName: true },
      })
    : [];

  const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  const STATUS_LABELS: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    PAID: "Pago",
    PRINTING: "Em produção",
    READY_TO_SHIP: "Pronto p/ envio",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Métricas</p>
        <h2 className="section-title">Analytics</h2>
        <p className="section-copy">Visão geral dos pedidos e receita.</p>
      </div>

      {!connected && (
        <div className="mb-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
          Banco de dados indisponível — métricas zeradas.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total de pedidos", value: String(orderCount), color: "text-cyan-200" },
          { label: "Usuários cadastrados", value: String(userCount), color: "text-violet-200" },
          { label: "Receita confirmada", value: fmt(totalRevenue), color: "text-emerald-200" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
            <p className={`mt-2 text-3xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card">
        <p className="mb-4 text-sm font-semibold text-white">Últimos 10 pedidos</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Pedido</th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Cliente</th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Status</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Total</th>
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/40">Nenhum pedido.</td>
                </tr>
              )}
              {recentOrders.map((order) => (
                <tr key={order.orderNumber} className="hover:bg-white/5">
                  <td className="py-2 font-mono text-xs text-cyan-200">{order.orderNumber}</td>
                  <td className="py-2 text-white/70">{order.customerName || "—"}</td>
                  <td className="py-2 text-white/60 text-xs">{STATUS_LABELS[order.status] || order.status}</td>
                  <td className="py-2 text-right text-emerald-200">{fmt(Number(order.grandTotal))}</td>
                  <td className="py-2 text-white/40 text-xs">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
