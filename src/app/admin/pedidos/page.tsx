import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { buttonFamilies } from "@/components/ui/buttons";
import { requireAdminSession } from "@/lib/admin-auth";
import { listOrders } from "@/lib/order-service";
import {
  OPERATIONAL_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SOURCE_CHANNELS,
  operationalStatusLabels,
  paymentStatusLabels,
  sourceChannelLabels
} from "@/lib/commerce";
import { databaseUnavailableMessage } from "@/lib/database-status";
import { formatCurrency } from "@/lib/utils";

type OrdersPageProps = {
  searchParams: Promise<{
    q?: string;
    operationalStatus?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    sourceChannelId?: string;
    error?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAdminSession();
  const filters = await searchParams;
  let databaseWarning = filters.error === "db-unavailable" ? databaseUnavailableMessage : "";
  let orders: Awaited<ReturnType<typeof listOrders>> = [];

  try {
    orders = await listOrders({
      query: filters.q || "",
      operationalStatus: (filters.operationalStatus as any) || "",
      paymentStatus: (filters.paymentStatus as any) || "",
      paymentMethod: (filters.paymentMethod as any) || "",
      sourceChannelId: (filters.sourceChannelId as any) || ""
    });
  } catch {
    databaseWarning = databaseUnavailableMessage;
  }
  const activeFilterCount = [filters.q, filters.operationalStatus, filters.paymentStatus, filters.paymentMethod, filters.sourceChannelId].filter(Boolean).length;

  return (
    <AdminShell
      email={session.email}
      title="Fila de pedidos"
      description="Filtre por operação, pagamento, origem e busque por nome, WhatsApp, e-mail ou número do pedido."
    >
      {databaseWarning ? (
        <div className="mb-6 rounded-[28px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100/85">
          {databaseWarning}
        </div>
      ) : null}
      <form className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="text-sm text-white/68">
            <span className="mb-2 block">Busca</span>
            <input
              name="q"
              defaultValue={filters.q || ""}
              placeholder="Nome, WhatsApp, e-mail ou pedido"
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="text-sm text-white/68">
            <span className="mb-2 block">Operação</span>
            <select name="operationalStatus" defaultValue={filters.operationalStatus || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              <option value="">Todos</option>
              {OPERATIONAL_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/68">
            <span className="mb-2 block">Pagamento</span>
            <select name="paymentStatus" defaultValue={filters.paymentStatus || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              <option value="">Todos</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/68">
            <span className="mb-2 block">Forma</span>
            <select name="paymentMethod" defaultValue={filters.paymentMethod || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              <option value="">Todas</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-white/68">
            <span className="mb-2 block">Origem</span>
            <select name="sourceChannelId" defaultValue={filters.sourceChannelId || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
              <option value="">Todas</option>
              {SOURCE_CHANNELS.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className={buttonFamilies.secondary}>
            Filtrar
          </button>
          <Link href="/admin/pedidos" className={buttonFamilies.tertiary}>
            Limpar
          </Link>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
            {orders.length} pedido(s) na consulta • {activeFilterCount} filtro(s) ativo(s)
          </span>
        </div>
      </form>

      <div className="mt-6 grid gap-3 rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_48px_rgba(2,8,23,0.18)] lg:grid-cols-4">
        {[
          { title: "Pendentes", href: "/admin/pedidos?paymentStatus=pending" },
          { title: "Em producao", href: "/admin/pedidos?operationalStatus=in_production" },
          { title: "Site", href: "/admin/pedidos?sourceChannelId=site" },
          { title: "WhatsApp", href: "/admin/pedidos?sourceChannelId=whatsapp" }
        ].map((item) => (
          <Link key={item.title} href={item.href} className={`${buttonFamilies.tertiary} justify-start rounded-[24px] px-4 py-4 text-sm`}>
            {item.title}
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_48px_rgba(2,8,23,0.18)]">
        {orders.length ? (
          <div className="overflow-x-auto">
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
                {orders.map((row) => (
                  <tr key={row.order.id} className="border-t border-white/8">
                    <td className="py-4 pr-4 font-semibold text-white">{row.order.orderNumber}</td>
                    <td className="py-4 pr-4">
                      <div className="font-medium text-white">{row.customer.fullName}</div>
                      <div className="text-xs text-white/45">{row.customer.whatsapp}</div>
                      {row.customer.email ? <div className="text-xs text-white/45">{row.customer.email}</div> : null}
                      {row.order.reviewRequired ? (
                        <div className="mt-2 inline-flex rounded-full border border-amber-300/25 bg-amber-300/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                          Revisao manual
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">{sourceChannelLabels[row.order.sourceChannelId as keyof typeof sourceChannelLabels] || row.order.sourceChannelId}</td>
                    <td className="py-4 pr-4">
                      <div>{operationalStatusLabels[row.order.operationalStatus]}</div>
                      <div className="text-xs text-white/45">{new Date(row.order.placedAt).toLocaleDateString("pt-BR")}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div>{paymentStatusLabels[row.order.paymentStatus]}</div>
                      <div className="text-xs text-white/45">{row.latestPayment?.method || row.order.paymentMethod}</div>
                      {row.order.riskScore ? (
                        <div className="text-[11px] text-amber-100/80">Risco {row.order.riskScore}</div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-white">{formatCurrency(row.order.totalAmount)}</td>
                    <td className="py-4 pr-0 text-right">
                      <Link href={`/admin/pedidos/${row.order.id}`} className={buttonFamilies.tertiary}>
                        Detalhe
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-8 text-sm text-white/55">
            {databaseWarning
              ? "A fila não pôde ser carregada porque o banco principal ainda não está acessível."
              : "Nenhum pedido encontrado com os filtros atuais."}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
