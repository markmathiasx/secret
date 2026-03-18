import { Factory, FileText, MessageCircleMore, Package, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAdminDashboardSnapshot } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const metricMeta = [
  { key: "totalOrders", label: "Pedidos recentes", icon: Package },
  { key: "totalQuotes", label: "Orcamentos recentes", icon: FileText },
  { key: "openRequests", label: "Leads em aberto", icon: MessageCircleMore },
  { key: "totalRevenuePix", label: "Receita Pix observada", icon: Wallet },
  { key: "totalRevenueCard", label: "Receita cartao observada", icon: Factory }
] as const;

export default async function AdminHome() {
  const snapshot = await getAdminDashboardSnapshot();

  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.26)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Painel operacional</p>
        <h1 className="mt-3 text-4xl font-black text-white">Admin MDH 3D</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
          Visao central de pedidos, orcamentos e entradas do site. Os numeros abaixo leem os registros mais recentes gravados no Supabase.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metricMeta.map((item) => {
            const Icon = item.icon;
            const rawValue = snapshot.metrics[item.key];
            const value = item.key.startsWith("totalRevenue") ? formatCurrency(Number(rawValue)) : String(rawValue);

            return (
              <article key={item.key} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                    <p className="mt-3 text-2xl font-black text-white">{value}</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 xl:col-span-2">
            <p className="text-sm font-semibold text-white">Pedidos recentes</p>
            <div className="mt-4 grid gap-3">
              {snapshot.recentOrders.length ? snapshot.recentOrders.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-white/76">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{item.product_name}</p>
                      <p className="mt-1 text-white/55">{item.customer_name} • {item.email}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/55">{item.status}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/55">
                    <span>{item.order_code}</span>
                    <span>{item.payment_method}</span>
                    <span>{item.payment_status || "sem status"}</span>
                    <span>Qtd {item.quantity}</span>
                    <span>{formatCurrency(Number(item.payment_method === "cartao" ? item.total_card || 0 : item.total_pix || 0))}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-white/60">Nenhum pedido recente encontrado.</p>}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-sm font-semibold text-white">Orcamentos recentes</p>
              <div className="mt-4 grid gap-3">
                {snapshot.recentQuotes.length ? snapshot.recentQuotes.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-white/76">
                    <p className="font-semibold text-white">{item.product_name}</p>
                    <p className="mt-1 text-white/55">{item.customername}</p>
                    <p className="mt-2 text-xs text-white/50">{item.quote_id} • {item.paymentmethod}</p>
                  </div>
                )) : <p className="text-sm text-white/60">Nenhum orcamento recente encontrado.</p>}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
              <p className="text-sm font-semibold text-white">Leads de imagem para 3D</p>
              <div className="mt-4 grid gap-3">
                {snapshot.recentQuoteRequests.length ? snapshot.recentQuoteRequests.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4 text-sm text-white/76">
                    <p className="font-semibold text-white">{item.customer_name || "Lead sem nome"}</p>
                    <p className="mt-1 text-white/55">{item.request_type || "image-to-3d"} • {item.source || "site"}</p>
                    <p className="mt-2 text-xs text-white/50">{item.quote_id || "sem codigo"} • {item.email || item.phone || "sem contato"}</p>
                  </div>
                )) : <p className="text-sm text-white/60">Nenhum lead recente encontrado.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
