import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Retorno do checkout",
  robots: {
    index: false,
    follow: false
  }
};

const states = {
  success: {
    icon: CheckCircle2,
    title: "Pagamento aprovado",
    description: "Recebemos a confirmacao do checkout. Agora voce pode acompanhar o pedido ou continuar no atendimento para combinar detalhes finais.",
    tone: "border-emerald-300/20 bg-emerald-300/10 text-emerald-50"
  },
  pending: {
    icon: Clock3,
    title: "Pagamento pendente",
    description: "O pedido foi iniciado, mas o provedor ainda nao confirmou a compensacao. Se quiser, fale com a MDH para validar o status em tempo real.",
    tone: "border-amber-300/20 bg-amber-300/10 text-amber-50"
  },
  failure: {
    icon: XCircle,
    title: "Pagamento nao concluido",
    description: "O checkout foi interrompido ou recusado. Voce pode tentar novamente, usar Pix ou finalizar pelo WhatsApp sem perder o atendimento.",
    tone: "border-rose-300/20 bg-rose-300/10 text-rose-50"
  }
} as const;

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ status?: keyof typeof states }>;
}) {
  const params = await searchParams;
  const current = states[params.status || "pending"] || states.pending;
  const Icon = current.icon;

  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <div className={`rounded-[36px] border p-8 ${current.tone}`}>
        <div className="flex items-start gap-4">
          <span className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em]">Retorno do checkout</p>
            <h1 className="mt-3 text-4xl font-black text-white">{current.title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/82">{current.description}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">1. Pedido organizado</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Sua loja ja tem uma pagina clara para cada status de retorno.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">2. Atendimento continua</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Mesmo sem automacao completa, o cliente nao cai em 404 e sabe o proximo passo.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">3. Alternativas seguras</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Pix, WhatsApp e catalogo continuam disponiveis se o checkout nao fechar na primeira tentativa.</p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
            Voltar ao catalogo
          </Link>
          <Link href="/entregas" className="rounded-full border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white">
            Revisar frete
          </Link>
          <Link href="/" className="rounded-full border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white">
            Ir para a home
          </Link>
        </div>
      </div>
    </section>
  );
}
