import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, MessageCircleMore, ShieldCheck, XCircle } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

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
    tone: "border-emerald-300/20 bg-emerald-300/10 text-emerald-50",
    nextSteps: [
      "Guarde o comprovante para agilizar a validacao.",
      "Envie cor, tamanho e referencia final no atendimento.",
      "Acompanhe producao e entrega pelo canal escolhido."
    ]
  },
  pending: {
    icon: Clock3,
    title: "Pagamento pendente",
    description: "O pedido foi iniciado, mas o provedor ainda nao confirmou a compensacao. Se quiser, fale com a MDH para validar o status em tempo real.",
    tone: "border-amber-300/20 bg-amber-300/10 text-amber-50",
    nextSteps: [
      "Revise se o pagamento foi finalizado no app ou no banco.",
      "Aguarde a compensacao e volte nesta tela para confirmar status.",
      "Se precisar, finalize por Pix ou WhatsApp sem perder atendimento."
    ]
  },
  failure: {
    icon: XCircle,
    title: "Pagamento nao concluido",
    description: "O checkout foi interrompido ou recusado. Voce pode tentar novamente, usar Pix ou finalizar pelo WhatsApp sem perder o atendimento.",
    tone: "border-rose-300/20 bg-rose-300/10 text-rose-50",
    nextSteps: [
      "Tente novamente com outro metodo no checkout.",
      "Se preferir, feche no Pix para confirmacao imediata.",
      "Use o atendimento humano para fechar sem atrito."
    ]
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
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage} Quero confirmar meu checkout.`)}`;

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

        <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm font-semibold text-white">Proximos passos recomendados</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {current.nextSteps.map((step, index) => (
              <div key={step} className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Passo {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">{step}</p>
              </div>
            ))}
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

        <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/75">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-100" />
          <p>Checkout, login e catalogo usam o mesmo host para manter sessao estavel e evitar quebra por troca de dominio.</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">
            Voltar ao catalogo
          </Link>
          <a href={whatsappHref} className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-5 py-3 text-sm font-semibold text-emerald-100">
            <MessageCircleMore className="h-4 w-4" />
            Falar com atendimento
          </a>
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
