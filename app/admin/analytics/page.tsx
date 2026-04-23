import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import {
  buildWeeklyGrowthDashboard,
  readStoredWeeklyGrowthDashboard,
} from "@/lib/weekly-growth-dashboard";
import { formatCurrency } from "@/lib/utils";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const stored = await readStoredWeeklyGrowthDashboard();
  const dashboard = stored || (await buildWeeklyGrowthDashboard());

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] p-6 shadow-[0_28px_80px_rgba(2,8,23,0.32)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
        <h1 className="mt-2 text-3xl font-black text-white">Dashboard semanal de aquisição e conversão</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
          Esta visão junta Search Console e métricas internas para orientar título, CTA, prova visual, páginas comerciais e pipeline de conteúdo em uma única leitura operacional.
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/45">
          Janela analisada: {dashboard.window.label} • gerado em{" "}
          {new Date(dashboard.generatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Search Console</p>
              <h2 className="mt-2 text-2xl font-black text-white">Saúde orgânica da semana</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              {dashboard.searchConsole.available ? "Conectado" : "Aguardando conexão"}
            </span>
          </div>

          {!dashboard.searchConsole.available ? (
            <div className="mt-5 rounded-[20px] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-7 text-amber-50">
              {dashboard.searchConsole.note || "Search Console ainda não configurado."}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {[
              { label: "Cliques", value: String(dashboard.searchConsole.clicks) },
              { label: "Impressões", value: String(dashboard.searchConsole.impressions) },
              { label: "CTR", value: formatPercent(dashboard.searchConsole.ctr) },
              { label: "Posição média", value: dashboard.searchConsole.avgPosition.toFixed(1) },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Top queries</p>
              <div className="mt-4 grid gap-3">
                {dashboard.searchConsole.topQueries.length ? (
                  dashboard.searchConsole.topQueries.map((item) => (
                    <div key={item.label} className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-2 text-xs text-white/55">
                        {item.clicks} cliques • {item.impressions} impressões • CTR {formatPercent(item.ctr)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/45">Sem dados de consultas no período.</p>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Top páginas</p>
              <div className="mt-4 grid gap-3">
                {dashboard.searchConsole.topPages.length ? (
                  dashboard.searchConsole.topPages.map((item) => (
                    <div key={item.label} className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                      <p className="break-all text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-2 text-xs text-white/55">
                        {item.clicks} cliques • {item.impressions} impressões • posição {item.position.toFixed(1)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/45">Sem dados de páginas no período.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Métricas internas</p>
          <h2 className="mt-2 text-2xl font-black text-white">O que o site está transformando em ação comercial</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Pedidos", value: String(dashboard.internal.orders) },
              { label: "Orçamentos", value: String(dashboard.internal.quotes) },
              { label: "Pix observado", value: formatCurrency(dashboard.internal.revenuePix) },
              { label: "Cartão observado", value: formatCurrency(dashboard.internal.revenueCard) },
              { label: "Views rastreadas", value: String(dashboard.internal.totalViews) },
              { label: "Visitantes únicos", value: String(dashboard.internal.uniqueVisitors) },
              { label: "Add to cart rate", value: formatPercent(dashboard.internal.addToCartRate) },
              { label: "Purchase rate", value: formatPercent(dashboard.internal.purchaseRate) },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[22px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">Pendências comerciais</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Briefings em aberto</p>
                <p className="mt-2 text-xl font-black text-white">{dashboard.internal.openRequests}</p>
              </div>
              <div className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Valor médio por sessão</p>
                <p className="mt-2 text-xl font-black text-white">{formatCurrency(dashboard.internal.averageSessionValue)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Próximas ações</p>
        <h2 className="mt-2 text-2xl font-black text-white">O que mexer esta semana para aumentar aquisição e conversão</h2>
        <div className="mt-5 grid gap-3">
          {dashboard.actions.map((item) => (
            <div key={item} className="rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
              {item}
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
