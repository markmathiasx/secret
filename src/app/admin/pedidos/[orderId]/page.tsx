import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { buttonFamilies } from "@/components/ui/buttons";
import { requireAdminSession } from "@/lib/admin-auth";
import { getOrderDetail } from "@/lib/order-service";
import {
  OPERATIONAL_STATUSES,
  PAYMENT_STATUSES,
  operationalStatusLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  sourceChannelLabels
} from "@/lib/commerce";
import { databaseUnavailableMessage } from "@/lib/database-status";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatCurrency } from "@/lib/utils";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminOrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const session = await requireAdminSession();
  const { orderId } = await params;
  const query = await searchParams;
  let databaseWarning = query.error === "db-unavailable" ? databaseUnavailableMessage : "";
  let detail: Awaited<ReturnType<typeof getOrderDetail>> = null;

  try {
    detail = await getOrderDetail(orderId);
  } catch {
    databaseWarning = databaseUnavailableMessage;
  }

  if (!detail && !databaseWarning) notFound();

  if (!detail) {
    return (
      <AdminShell
        email={session.email}
        title="Pedido indisponível"
        description="A conexão do banco precisa estar operacional para abrir o detalhe completo do pedido."
      >
        <div className="rounded-[32px] border border-amber-300/20 bg-amber-300/10 p-6 text-sm text-amber-100/85">
          {databaseWarning || "Não foi possível carregar o pedido neste momento."}
        </div>
      </AdminShell>
    );
  }

  const customerWhatsappHref = buildWhatsAppLink(
    detail.customer.whatsapp,
    `Oi, ${detail.customer.fullName}. Estou falando sobre o pedido ${detail.order.orderNumber} da MDH 3D.`
  );
  const actionErrorMessage =
    query.error === "status-update-failed"
      ? "Nao foi possivel atualizar o status operacional."
      : query.error === "payment-update-failed"
        ? "Nao foi possivel atualizar os dados de pagamento."
        : query.error === "note-create-failed"
          ? "Nao foi possivel registrar a nota interna."
          : query.error === "forbidden"
            ? "A acao foi bloqueada pela camada de seguranca da sessao."
          : "";

  return (
    <AdminShell
      email={session.email}
      title={`Pedido ${detail.order.orderNumber}`}
      description="Atualize pagamento, mova o fluxo operacional, acompanhe a timeline e registre notas internas."
    >
      {databaseWarning ? (
        <div className="mb-6 rounded-[28px] border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100/85">
          {databaseWarning}
        </div>
      ) : null}
      {actionErrorMessage ? (
        <div className="mb-6 rounded-[28px] border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-sm text-rose-100/85">
          {actionErrorMessage}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex flex-wrap gap-3">
              <Link href="/admin/pedidos" className={buttonFamilies.tertiary}>
                Voltar para a fila
              </Link>
              <a
                href={customerWhatsappHref}
                target="_blank"
                rel="noreferrer"
                className={buttonFamilies.primaryPix}
              >
                Chamar cliente no WhatsApp
              </a>
              <Link href={`/acompanhar-pedido?order=${detail.order.orderNumber}`} className={buttonFamilies.tertiary}>
                Ver consulta publica
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { label: "Cliente", value: detail.customer.fullName },
                { label: "WhatsApp", value: detail.customer.whatsapp },
                { label: "Email", value: detail.customer.email || "Não informado" },
                { label: "Origem", value: sourceChannelLabels[detail.order.sourceChannelId as keyof typeof sourceChannelLabels] || detail.order.sourceChannelId },
                { label: "Pagamento", value: paymentMethodLabels[detail.order.paymentMethod] },
                { label: "Total", value: formatCurrency(detail.order.totalAmount) },
                { label: "Status operacional", value: operationalStatusLabels[detail.order.operationalStatus] },
                { label: "Status do pagamento", value: paymentStatusLabels[detail.order.paymentStatus] },
                { label: "Criado em", value: new Date(detail.order.placedAt).toLocaleString("pt-BR") }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Endereço</p>
              <p className="mt-2 text-sm leading-7 text-white/72">
                {detail.address
                  ? `${detail.address.street}, ${detail.address.number}${detail.address.complement ? `, ${detail.address.complement}` : ""} - ${detail.address.neighborhood}, ${detail.address.city}/${detail.address.state}`
                  : "Endereço não vinculado"}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { label: "Frete", value: formatCurrency(detail.order.shippingAmount) },
                { label: "Total Pix", value: formatCurrency(detail.order.subtotalPix) },
                { label: "Total Cartao", value: formatCurrency(detail.order.subtotalCard) },
                { label: "Referencia WhatsApp", value: detail.order.whatsappReference || "Nao informada" },
                { label: "Marketplace ref.", value: detail.order.marketplaceReference || "Nao informada" },
                { label: "Observacoes cliente", value: detail.order.customerNotes || "Sem observacoes" }
              ].map((item) => (
                <div key={item.label} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {detail.order.reviewRequired ? (
              <div className="mt-6 rounded-[24px] border border-amber-300/25 bg-amber-300/12 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-amber-100/80">Risco e revisao</p>
                <p className="mt-2 text-sm leading-7 text-amber-50">
                  Este pedido foi sinalizado para revisao manual com score {detail.order.riskScore}.
                  {detail.order.reviewNote ? ` ${detail.order.reviewNote}` : ""}
                </p>
                {detail.order.riskSignals.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detail.order.riskSignals.map((signal) => (
                      <span
                        key={signal}
                        className="rounded-full border border-amber-200/20 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/80"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Itens</p>
              <div className="mt-4 space-y-3">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="font-semibold text-white">{item.productName}</p>
                      <p className="text-xs text-white/45">
                        {item.sku} • {item.quantity} unidade(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/45">Linha no Pix</p>
                      <p className="font-semibold text-white">{formatCurrency(item.lineTotalPix)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Timeline</p>
            <div className="mt-4 space-y-4">
              {detail.events.map((event) => (
                <div key={event.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold text-white">{event.description}</p>
                    <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                      {new Date(event.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{event.eventType}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black text-white">Atualizar operação</h2>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <form action={`/api/admin/orders/${detail.order.id}/status`} method="post">
                <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
                <input type="hidden" name="nextStatus" value="in_production" />
                <button className={`${buttonFamilies.tertiary} w-full`}>
                  Marcar em producao
                </button>
              </form>
              <form action={`/api/admin/orders/${detail.order.id}/status`} method="post">
                <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
                <input type="hidden" name="nextStatus" value="completed" />
                <button className={`${buttonFamilies.tertiary} w-full`}>
                  Marcar finalizado
                </button>
              </form>
            </div>
            <form action={`/api/admin/orders/${detail.order.id}/status`} method="post" className="mt-4 space-y-4">
              <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Status operacional</span>
                <select name="nextStatus" defaultValue={detail.order.operationalStatus} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  {OPERATIONAL_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className={`${buttonFamilies.secondary} w-full`}>
                Salvar operação
              </button>
            </form>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black text-white">Atualizar pagamento</h2>
            <div className="mt-3 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-white/62">
              Registro atual: {detail.payments[0]?.provider || "manual"} • {detail.payments[0]?.providerPaymentId || "sem referencia externa"}
            </div>
            <form action={`/api/admin/orders/${detail.order.id}/payment`} method="post" className="mt-4 space-y-4">
              <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Status do pagamento</span>
                <select name="status" defaultValue={detail.order.paymentStatus} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Referência Pix</span>
                <input name="pixReference" defaultValue={detail.payments[0]?.pixReference || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Bandeira</span>
                <input name="cardBrand" defaultValue={detail.payments[0]?.cardBrand || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Últimos 4 dígitos</span>
                <input name="cardLast4" maxLength={4} defaultValue={detail.payments[0]?.cardLast4 || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Titular</span>
                <input name="cardHolderName" defaultValue={detail.payments[0]?.cardHolderName || ""} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <label className="block text-sm text-white/68">
                <span className="mb-2 block">Observação</span>
                <textarea name="verificationNote" defaultValue={detail.payments[0]?.verificationNote || ""} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none" />
              </label>
              <button className={`${buttonFamilies.primaryPix} w-full`}>
                Salvar pagamento
              </button>
            </form>
            <form action={`/api/admin/orders/${detail.order.id}/payment`} method="post" className="mt-3">
              <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
              <input type="hidden" name="status" value="paid" />
              <input type="hidden" name="verificationNote" value="Pagamento confirmado manualmente pelo painel." />
              <button className={`${buttonFamilies.tertiary} w-full`}>
                Confirmar pagamento manualmente
              </button>
            </form>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-black text-white">Notas internas</h2>
            <form action={`/api/admin/orders/${detail.order.id}/notes`} method="post" className="mt-4 space-y-4">
              <input type="hidden" name="redirectTo" value={`/admin/pedidos/${detail.order.id}`} />
              <textarea
                name="content"
                required
                placeholder="Adicione contexto de produção, atendimento ou conferência."
                className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
              <button className={`${buttonFamilies.tertiary} w-full`}>
                Registrar nota
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {detail.notes.length ? (
                detail.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-white">{note.author}</p>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/45">
                        {new Date(note.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/68">{note.content}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-4 text-sm text-white/55">
                  Nenhuma nota interna registrada ainda para este pedido.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
