import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { CommerceOsDashboardSnapshot } from "@/src/lib/commerce-os/service";

function formatDateTime(value: string | null) {
  if (!value) return "Sem previsão";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem previsão";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPercent(value: number | null) {
  if (value === null) return "Sem dado";
  return `${(value * 100).toFixed(0)}%`;
}

export function CommerceOsDashboard({ snapshot }: { snapshot: CommerceOsDashboardSnapshot }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,47,73,0.35),rgba(2,6,23,0.92))] p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Commerce OS MDH 3D</p>
            <h2 className="mt-3 text-3xl font-black text-white">Backoffice, produção, IA e crescimento com a mesma leitura operacional.</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">
              Este cockpit usa pedidos reais, catálogo real, ledger operacional e jobs locais. Onde não houver configuração
              suficiente, o sistema marca a lacuna em vez de inventar capacidade, estoque ou prazo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
              Pedidos
            </Link>
            <Link href="/admin/inventory" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Estoque
            </Link>
            <Link href="/admin/ai-operator" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Copiloto
            </Link>
            <Link href="/admin/platform/jobs" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
              Jobs
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["Receita paga", formatCurrency(snapshot.executive.revenue)],
            ["Margem estimada", formatCurrency(snapshot.executive.estimatedMargin)],
            ["Ticket médio", formatCurrency(snapshot.executive.averageTicket)],
            ["Lucro por hora", snapshot.executive.profitPerMachineHour === null ? "Sem dado" : formatCurrency(snapshot.executive.profitPerMachineHour)],
            ["Fila total", `${snapshot.executive.queueHours.toFixed(1)}h`],
            ["Atrasos previstos", String(snapshot.executive.delayedOrders)],
            ["Falhas 30d", String(snapshot.executive.failureCount30d)],
            ["Estoque crítico", String(snapshot.executive.criticalStockCount)],
          ].map(([label, value]) => (
            <article key={label} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
              <p className="mt-2 text-2xl font-black text-white">{value}</p>
            </article>
          ))}
        </div>

        {snapshot.notes.length ? (
          <div className="mt-6 rounded-[20px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm text-amber-100">
            {snapshot.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[26px] border border-white/10 bg-black/20 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Produção</p>
              <h3 className="mt-2 text-2xl font-black text-white">Fila por impressora</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
              {snapshot.queue.printers.length} impressoras
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {snapshot.queue.printers.map((printer) => (
              <article key={printer.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{printer.label}</p>
                    <p className="mt-1 text-xs text-white/50">
                      Backlog {printer.backlogHours.toFixed(1)}h
                      {printer.configuredHoursPerDay ? ` • utilização ${formatPercent(printer.utilization)}` : " • capacidade não configurada"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
                    {printer.items.length} itens
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {printer.items.slice(0, 5).map((item) => (
                    <div key={`${printer.id}:${item.orderId}`} className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-semibold text-white">{item.orderNumber}</p>
                          <p className="mt-1 text-sm text-white/75">{item.itemSummary}</p>
                          <p className="mt-1 text-xs text-white/45">
                            {item.customerName} • {item.hours.toFixed(1)}h • {item.grams.toFixed(0)}g • {item.materials.join(", ") || "material pendente"}
                          </p>
                        </div>
                        <div className="text-right text-xs text-white/55">
                          <p className="uppercase tracking-[0.14em]">{item.priority}</p>
                          <p className="mt-1">{formatDateTime(item.predictedCompletionAt)}</p>
                          {item.delayHours ? <p className="mt-1 text-amber-200">+{item.delayHours.toFixed(1)}h</p> : null}
                        </div>
                      </div>
                      {item.blockedReason ? (
                        <p className="mt-2 rounded-[12px] border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-100">
                          Bloqueio: {item.blockedReason}
                        </p>
                      ) : null}
                    </div>
                  ))}
                  {!printer.items.length ? (
                    <p className="text-sm text-white/45">Sem itens ativos para esta impressora.</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[26px] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Fluxo</p>
            <h3 className="mt-2 text-2xl font-black text-white">Máquina de estados</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Ativos", snapshot.lifecycle.activeOrders],
                ["Aguardando pagamento", snapshot.lifecycle.awaitingPayment],
                ["Personalização bloqueada", snapshot.lifecycle.personalizationBlocked],
                ["Imprimindo", snapshot.lifecycle.printing],
                ["QC pendente", snapshot.lifecycle.qualityPending],
                ["Embalagem pendente", snapshot.lifecycle.packingPending],
                ["Em trânsito", snapshot.lifecycle.inTransit],
                ["Devoluções abertas", snapshot.lifecycle.returnsOpen + snapshot.lifecycle.refundsOpen],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">{label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/10 bg-black/20 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Copiloto</p>
            <h3 className="mt-2 text-2xl font-black text-white">Ações prioritárias</h3>
            <div className="mt-4 grid gap-3">
              {snapshot.copilot.map((suggestion) => (
                <article key={suggestion.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{suggestion.title}</p>
                      <p className="mt-1 text-sm text-white/60">{suggestion.rationale}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/60">
                      {suggestion.domain}
                    </span>
                  </div>
                </article>
              ))}
              {!snapshot.copilot.length ? <p className="text-sm text-white/45">Nenhuma ação prioritária gerada neste momento.</p> : null}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-[26px] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Estoque e reservas</p>
          <h3 className="mt-2 text-2xl font-black text-white">Consumíveis</h3>
          <div className="mt-5 grid gap-3">
            {snapshot.inventory.consumables.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-white/45">
                      Reservado {item.reserved} {item.unit}
                      {item.onHand === null ? " • saldo não configurado" : ` • saldo ${item.available}`}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em] ${
                    item.status === "critical"
                      ? "border-rose-300/25 bg-rose-300/12 text-rose-100"
                      : item.status === "unconfigured"
                        ? "border-amber-300/25 bg-amber-300/12 text-amber-100"
                        : "border-emerald-300/25 bg-emerald-300/12 text-emerald-100"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {!snapshot.inventory.consumables.length ? <p className="text-sm text-white/45">Sem consumo ativo registrado.</p> : null}
          </div>

          <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Produtos com baixo estoque</p>
            <div className="mt-3 grid gap-2">
              {snapshot.inventory.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-3 text-sm text-white/70">
                  <span>{product.title}</span>
                  <span className="font-mono text-white">{product.stock}</span>
                </div>
              ))}
              {!snapshot.inventory.lowStockProducts.length ? <p className="text-sm text-white/45">Nenhum SKU crítico nesta leitura.</p> : null}
            </div>
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Qualidade e falhas</p>
          <h3 className="mt-2 text-2xl font-black text-white">QC, embalagem e reimpressão</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Falhas 30d</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.defects.count30d}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Impacto de margem</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(snapshot.defects.estimatedMarginImpact30d)}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">QC pendente</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.quality.pendingOrders.length}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Evidências seguras</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.quality.secureEvidenceCount}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {snapshot.defects.recent.slice(0, 4).map((defect) => (
              <div key={defect.id} className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{defect.cause}</p>
                <p className="mt-1 text-sm text-white/60">
                  {defect.stage} • {defect.reprintRequired ? "reimpressão" : "sem reimpressão"} • {formatCurrency(defect.estimatedMarginImpact)}
                </p>
              </div>
            ))}
            {!snapshot.defects.recent.length ? <p className="text-sm text-white/45">Nenhuma falha registrada no ledger local.</p> : null}
          </div>
        </article>

        <article className="rounded-[26px] border border-white/10 bg-black/20 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">IA, crescimento e jobs</p>
          <h3 className="mt-2 text-2xl font-black text-white">Observabilidade operacional</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Latência média IA</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.ai.avgLatencyMs === null ? "Sem dado" : `${snapshot.ai.avgLatencyMs}ms`}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Erro IA</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.ai.errorRate === null ? "Sem dado" : `${(snapshot.ai.errorRate * 100).toFixed(0)}%`}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Jobs em fila</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.jobs.queued + snapshot.jobs.running}</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">Review elegível</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.growth.verifiedReviewEligible}</p>
            </div>
          </div>

          <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">Anomalias e regras</p>
            <div className="mt-3 grid gap-2 text-sm text-white/65">
              {snapshot.ai.anomalies.map((item) => (
                <p key={item}>{item}</p>
              ))}
              {snapshot.growth.antiAbuseRules.map((rule) => (
                <p key={rule}>{rule}</p>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
