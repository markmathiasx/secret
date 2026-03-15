import Link from "next/link";
import {
  contactPreferenceLabels,
  operationalStatusLabels,
  paymentStatusLabels,
  sourceChannelLabels,
  type ContactPreference,
  type SourceChannelId
} from "@/lib/commerce";
import { formatCurrency } from "@/lib/utils";

type CustomerAccountPageProps = {
  customerName: string;
  email: string;
  customerProfile?: {
    fullName: string;
    whatsapp: string;
    contactPreference: ContactPreference;
    notes?: string | null;
  } | null;
  addresses: Array<{
    id: string;
    postalCode: string;
    street: string;
    number: string;
    complement: string | null;
    reference: string | null;
    neighborhood: string;
    city: string;
    state: string;
    createdAt: Date;
  }>;
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
  customerProfile,
  addresses,
  orders
}: CustomerAccountPageProps) {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <aside className="section-shell rounded-[36px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Conta MDH 3D</p>
          <h1 className="mt-3 text-4xl font-black text-white">Ola, {firstName}</h1>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Use esta area para revisar seus dados, acompanhar pedidos ligados ao seu cadastro e sair com seguranca quando quiser.
          </p>

          <div className="premium-card mt-6 space-y-3 rounded-[28px] bg-black/20 p-5">
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
              <p className="mt-2 text-white/78">
                {customerProfile?.fullName || "Vai aparecer assim que um pedido for ligado a esta conta."}
              </p>
            </div>
          </div>

          <div className="premium-card mt-6 space-y-3 rounded-[28px] bg-black/20 p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">WhatsApp principal</p>
              <p className="mt-2 text-white/78">{customerProfile?.whatsapp || "Vai aparecer no primeiro pedido ligado a esta conta."}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Contato preferido</p>
              <p className="mt-2 text-white/78">
                {customerProfile?.contactPreference
                  ? contactPreferenceLabels[customerProfile.contactPreference]
                  : "Definido no checkout quando houver pedido vinculado"}
              </p>
            </div>
            {customerProfile?.notes ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Observacoes salvas</p>
                <p className="mt-2 text-sm leading-7 text-white/62">{customerProfile.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="premium-card mt-6 grid gap-3 rounded-[28px] bg-black/20 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Pedidos recentes</p>
              <p className="mt-2 text-2xl font-black text-white">{orders.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Endereços salvos</p>
              <p className="mt-2 text-2xl font-black text-white">{addresses.length}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/catalogo"
              className="premium-btn premium-btn-primary"
            >
              Voltar para a loja
            </Link>
            <Link
              href="/acompanhar-pedido"
              className="premium-btn premium-btn-secondary"
            >
              Acompanhar pedido por numero
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="premium-btn premium-btn-ghost inline-flex w-full items-center justify-center text-white/72"
              >
                Sair da conta
              </button>
            </form>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="section-shell rounded-[36px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Enderecos salvos</p>
                <h2 className="mt-2 text-3xl font-black text-white">Base da sua conta</h2>
              </div>
              <span className="premium-badge premium-badge-neutral text-xs">
                {addresses.length} endereco(s)
              </span>
            </div>

            {addresses.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {addresses.map((address) => (
                  <article key={address.id} className="premium-card rounded-[28px] bg-black/20 p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/75">Entrega cadastrada</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {address.street}, {address.number}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/58">
                      {address.complement ? `${address.complement} • ` : ""}
                      {address.neighborhood} • {address.city}/{address.state}
                    </p>
                    <p className="mt-2 text-sm text-white/45">CEP {address.postalCode}</p>
                    {address.reference ? <p className="mt-2 text-sm text-white/45">Referencia: {address.reference}</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="premium-card mt-6 rounded-[28px] border-dashed bg-black/20 p-6">
                <p className="text-lg font-semibold text-white">Nenhum endereco salvo ainda</p>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Assim que voce fechar um pedido com esta conta, o endereco usado entra aqui para agilizar suas proximas compras.
                </p>
              </div>
            )}
          </div>

          <div className="section-shell rounded-[36px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Pedidos ligados a esta conta</p>
              <h2 className="mt-2 text-3xl font-black text-white">Historico recente</h2>
            </div>
            <span className="premium-badge premium-badge-neutral text-xs">
              {orders.length} pedido(s)
            </span>
          </div>

          {orders.length ? (
            <div className="mt-6 space-y-3">
              {orders.map((entry) => (
                <article key={entry.order.id} className="premium-card rounded-[28px] bg-black/20 p-5">
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
                    <span className="premium-badge premium-badge-neutral px-3 py-2 text-xs normal-case tracking-[0.04em]">
                      {operationalStatusLabels[entry.order.operationalStatus]}
                    </span>
                    <span className="premium-badge premium-badge-neutral px-3 py-2 text-xs normal-case tracking-[0.04em]">
                      {paymentStatusLabels[entry.order.paymentStatus]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/acompanhar-pedido?order=${entry.order.orderNumber}`}
                      className="premium-btn premium-btn-primary px-4 py-2 text-sm"
                    >
                      Ver andamento
                    </Link>
                    <Link
                      href="/catalogo"
                      className="premium-btn premium-btn-secondary px-4 py-2 text-sm"
                    >
                      Comprar de novo
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="premium-card mt-6 rounded-[28px] border-dashed bg-black/20 p-6">
              <p className="text-lg font-semibold text-white">Nenhum pedido ligado ainda</p>
              <p className="mt-3 text-sm leading-7 text-white/58">
                Assim que voce finalizar um pedido com esta conta ou com o mesmo e-mail, o historico aparece aqui para facilitar recompras e acompanhamento.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
