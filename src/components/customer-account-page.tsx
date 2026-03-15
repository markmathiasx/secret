import Link from "next/link";
import { operationalStatusLabels, paymentStatusLabels, sourceChannelLabels, type SourceChannelId } from "@/lib/commerce";
import { formatCurrency } from "@/lib/utils";

type CustomerAccountPageProps = {
  customerName: string;
  email: string;
  linkedCustomerName?: string | null;
  orders: Array<{
    order: {
      id: string;
      orderNumber: string;
      totalAmount: number;
      operationalStatus: keyof typeof operationalStatusLabels;
      paymentStatus: keyof typeof paymentStatusLabels;
      placedAt: Date;
    };
    channel: {
      id: string;
      label: string;
    };
  }>;
};

function formatPlacedAt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function CustomerAccountPage({
  customerName,
  email,
  linkedCustomerName,
  orders
}: CustomerAccountPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="section-shell rounded-[36px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Conta MDH 3D</p>
          <h1 className="mt-3 text-4xl font-black text-white">Sua conta está ativa</h1>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Use esta area para voltar ao catalogo, acompanhar pedidos ligados ao seu cadastro e sair com seguranca quando quiser.
          </p>

          <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-black/20 p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Nome da conta</p>
              <p className="mt-2 text-lg font-semibold text-white">{customerName}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">E-mail</p>
              <p className="mt-2 text-white/78">{email}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Cliente vinculado</p>
              <p className="mt-2 text-white/78">{linkedCustomerName || "Vai aparecer assim que um pedido for ligado a esta conta."}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/12 px-5 py-3 text-sm font-semibold text-cyan-100"
            >
              Voltar para a loja
            </Link>
            <Link
              href="/acompanhar-pedido"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/78"
            >
              Acompanhar pedido por numero
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/72"
              >
                Sair da conta
              </button>
            </form>
          </div>
        </aside>

        <div className="section-shell rounded-[36px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Pedidos ligados a esta conta</p>
              <h2 className="mt-2 text-3xl font-black text-white">Historico recente</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/50">
              {orders.length} pedido(s)
            </span>
          </div>

          {orders.length ? (
            <div className="mt-6 space-y-3">
              {orders.map((entry) => (
                <article key={entry.order.id} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">
                        {sourceChannelLabels[entry.channel.id as SourceChannelId] || entry.channel.label}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{entry.order.orderNumber}</h3>
                      <p className="mt-2 text-sm text-white/52">{formatPlacedAt(entry.order.placedAt)}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-white">{formatCurrency(entry.order.totalAmount)}</p>
                      <p className="text-xs text-white/45">Total do pedido</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/72">
                      {operationalStatusLabels[entry.order.operationalStatus]}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/72">
                      {paymentStatusLabels[entry.order.paymentStatus]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/acompanhar-pedido?order=${entry.order.orderNumber}`}
                      className="rounded-full border border-cyan-400/25 bg-cyan-400/12 px-4 py-2 text-sm font-semibold text-cyan-100"
                    >
                      Ver andamento
                    </Link>
                    <Link
                      href="/catalogo"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
                    >
                      Comprar de novo
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6">
              <p className="text-lg font-semibold text-white">Nenhum pedido ligado ainda</p>
              <p className="mt-3 text-sm leading-7 text-white/58">
                Assim que voce finalizar um pedido com esta conta ou com o mesmo e-mail, o historico aparece aqui para facilitar recompras e acompanhamento.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
