import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Landmark, ReceiptText, WalletCards } from "lucide-react";
import { getAdminFinanceSnapshot } from "@/lib/server-store";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function paymentLabel(value: string) {
  if (value === "pix") return "Pix";
  if (value === "card") return "Cartão";
  if (value === "boleto") return "Boleto";
  return value;
}

function orderStatusLabel(value: string) {
  if (value === "pending_payment") return "Aguardando pagamento";
  if (value === "paid") return "Pago";
  if (value === "printing") return "Imprimindo";
  if (value === "ready_to_ship") return "Pronto";
  if (value === "shipped") return "Enviado";
  if (value === "delivered") return "Entregue";
  if (value === "refunded") return "Estornado";
  if (value === "canceled") return "Cancelado";
  return value;
}

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const user = await getServerSessionUser();

  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  const snapshot = await getAdminFinanceSnapshot();
  const metrics = snapshot.metrics;

  return (
    <section className="space-y-8">
      <div className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),rgba(15,23,42,0.98))] p-8 shadow-[0_28px_120px_rgba(2,8,23,0.42)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/80">Financeiro MDH 3D</p>
            <h1 className="mt-3 text-4xl font-black text-white">Receita real, recebíveis e lucro estimado da operação.</h1>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Este painel usa os pedidos criados no checkout para mostrar o pulso comercial da loja, com foco em Pix, cartão, pedidos pagos e caixa ainda pendente.
            </p>
          </div>

          <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/75">20% lucro alvo</p>
            <p className="mt-2 text-lg font-black text-white">Produção local RJ</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Faturamento aprovado",
              value: formatCurrency(metrics.approvedRevenue),
              icon: ArrowUpRight,
              tone: "text-emerald-100",
            },
            {
              label: "Recebível pendente",
              value: formatCurrency(metrics.pendingRevenue),
              icon: ArrowDownRight,
              tone: "text-amber-100",
            },
            {
              label: "Lucro estimado",
              value: formatCurrency(metrics.estimatedProfit),
              icon: Landmark,
              tone: "text-cyan-100",
            },
            {
              label: "Ticket médio",
              value: formatCurrency(metrics.averageTicket),
              icon: WalletCards,
              tone: "text-white",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/48">{item.label}</p>
                    <p className={`mt-3 text-3xl font-black ${item.tone}`}>{item.value}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center gap-2 text-cyan-100">
            <WalletCards className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Mix de pagamento</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Pix aprovado</p>
              <p className="mt-3 text-3xl font-black text-white">{formatCurrency(metrics.pixRevenue)}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Cartão aprovado</p>
              <p className="mt-3 text-3xl font-black text-white">{formatCurrency(metrics.cardRevenue)}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Pedidos pagos</p>
              <p className="mt-3 text-3xl font-black text-white">{metrics.paidOrders}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Pedidos pendentes</p>
              <p className="mt-3 text-3xl font-black text-white">{metrics.pendingOrders}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center gap-2 text-cyan-100">
            <ReceiptText className="h-5 w-5" />
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Leitura operacional</p>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              "O faturamento aprovado reflete pedidos já liberados pelo pagamento ou etapas posteriores da produção.",
              "O recebível pendente mostra quanto ainda está em espera de Pix, cartão em análise ou confirmação manual.",
              "O lucro estimado usa custo técnico do catálogo quando disponível; se faltar esse dado, assume a regra-base de 40%.",
            ].map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-white/72">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/78">Pedidos recentes</p>
            <h2 className="mt-2 text-2xl font-black text-white">Últimos movimentos financeiros da loja</h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-white/50">
              <tr>
                <th className="py-3 pr-4">Pedido</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Pagamento</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Lucro estimado</th>
                <th className="py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/10 text-white/80">
                  <td className="py-4 pr-4 font-semibold text-white">{order.order_code}</td>
                  <td className="py-4 pr-4">{order.customer_name}</td>
                  <td className="py-4 pr-4">
                    {paymentLabel(order.payment_method)}
                    <span className="ml-2 text-xs text-white/45">{order.payment_status || "sem retorno"}</span>
                  </td>
                  <td className="py-4 pr-4">{orderStatusLabel(order.order_status)}</td>
                  <td className="py-4 pr-4 text-white">{formatCurrency(order.total)}</td>
                  <td className="py-4 pr-4 text-emerald-100">{formatCurrency(order.estimated_profit)}</td>
                  <td className="py-4">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
