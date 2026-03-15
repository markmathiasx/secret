import Link from "next/link";

const statusMap = {
  success: {
    title: "Pagamento aprovado",
    text: "Recebemos a confirmação do pagamento. Nossa equipe vai seguir com produção e atualização pelo WhatsApp.",
    color: "text-emerald-200"
  },
  pending: {
    title: "Pagamento pendente",
    text: "Seu pagamento está em análise. Assim que aprovar, o pedido será liberado para produção.",
    color: "text-amber-200"
  },
  failure: {
    title: "Pagamento não concluído",
    text: "Não houve confirmação de pagamento. Você pode tentar novamente por Pix ou falar com atendimento.",
    color: "text-rose-200"
  }
} as const;

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const key = (status || "pending") as keyof typeof statusMap;
  const info = statusMap[key] || statusMap.pending;

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Checkout</p>
      <h1 className={`mt-3 text-4xl font-black ${info.color}`}>{info.title}</h1>
      <p className="mt-4 max-w-2xl text-white/70">{info.text}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalogo" className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
          Voltar ao catálogo
        </Link>
        <Link href="/entregas" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
          Revisar frete e prazo
        </Link>
      </div>
    </section>
  );
}
