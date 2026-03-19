"use client";

import { CreditCard, ExternalLink, MessageCircleMore, PackageCheck, QrCode, ShieldCheck, X } from "lucide-react";
import { pix, whatsappNumber } from "@/lib/constants";

const topics = [
  {
    id: "pix",
    title: "Fechar no Pix",
    icon: QrCode,
    summary: "Pagamento imediato com chave direta, QR Code e código copia e cola no checkout.",
    points: [
      `A chave ativa é ${pix.key}.`,
      "O cliente pode pagar pelo app do banco, pelo QR Code ou usando o código copia e cola.",
      "Depois do pagamento, basta enviar o comprovante e o código do pedido para a equipe."
    ],
    ctaLabel: "Quero pagar no Pix",
    ctaHref: `https://wa.me/${whatsappNumber}?text=Quero%20fechar%20meu%20pedido%20no%20Pix`
  },
  {
    id: "card",
    title: "Cartao de credito",
    icon: CreditCard,
    summary: "Parcelamento com orientação clara e, quando ativo, checkout em ambiente seguro.",
    points: [
      "Quando o checkout online está ativo, o site abre o ambiente seguro do parceiro de cobrança.",
      "Se o cliente preferir, a equipe também orienta parcelamento e fechamento pelo atendimento.",
      "O valor, o prazo e o formato de entrega são confirmados antes da cobrança."
    ],
    ctaLabel: "Falar sobre cartão",
    ctaHref: `https://wa.me/${whatsappNumber}?text=Quero%20pagar%20no%20cartao%20de%20credito`
  },
  {
    id: "custom",
    title: "Projeto personalizado",
    icon: PackageCheck,
    summary: "Referência, imagem, STL ou briefing para transformar sua ideia em peça impressa.",
    points: [
      "Você pode mandar referência pelo site ou pelo WhatsApp.",
      "A equipe confirma material, prazo, acabamento e caminho de pagamento.",
      "Esse fluxo atende presentes, decoração, setup, brindes e peças funcionais."
    ],
    ctaLabel: "Enviar referência",
    ctaHref: `https://wa.me/${whatsappNumber}?text=Quero%20enviar%20uma%20referencia%20para%20impressao%203D`
  }
];

export function CommerceAssistantDialog({
  open,
  onClose,
  cardCheckoutReady
}: {
  open: boolean;
  onClose: () => void;
  cardCheckoutReady: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/72 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-h-[90vh] w-full max-w-5xl overflow-auto rounded-[36px] border border-white/10 bg-[#07111a] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Consultor comercial</p>
            <h2 className="mt-2 text-3xl font-black text-white">Escolha o caminho mais rápido para concluir sua compra.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              Este painel resume pagamento, personalização e próximos passos para o cliente comprar com clareza.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-5">
              <div className="flex items-center gap-3 text-emerald-50">
                <QrCode className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Pix ativo</p>
              </div>
              <p className="mt-3 text-2xl font-black text-white">{pix.key}</p>
              <p className="mt-2 text-sm leading-7 text-white/68">Finalize o pedido no checkout, copie o código Pix ou o QR Code e confirme o comprovante com a equipe.</p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Cartao</p>
              </div>
              <p className="mt-3 text-lg font-bold text-white">
                {cardCheckoutReady ? "Checkout online disponível." : "Parcelamento confirmado no atendimento."}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {cardCheckoutReady
                  ? "O site já pode redirecionar o cliente para o ambiente seguro do parceiro de cobrança."
                  : "Se o cliente precisar parcelar, a equipe apresenta a melhor alternativa disponível durante o atendimento."}
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Quero%20atendimento%20humano%20para%20fechar%20meu%20pedido`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp w-full gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Ir para atendimento humano
            </a>
          </div>

          <div className="grid gap-4">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <article key={topic.id} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{topic.title}</h3>
                      <p className="text-sm text-white/58">{topic.summary}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {topic.points.map((point) => (
                      <div key={point} className="rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white/72">
                        {point}
                      </div>
                    ))}
                  </div>
                  <a href={topic.ctaHref} target="_blank" rel="noreferrer" className="btn-secondary mt-4 gap-2">
                    {topic.ctaLabel}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
