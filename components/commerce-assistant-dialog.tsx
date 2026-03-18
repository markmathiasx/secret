"use client";

import { CreditCard, ExternalLink, MessageCircleMore, PackageCheck, QrCode, ShieldCheck, X } from "lucide-react";
import { pix } from "@/lib/constants";

const topics = [
  {
    id: "pix",
    title: "Fechar no Pix",
    icon: QrCode,
    summary: "Pagamento instantaneo com chave direta, QR Code e copia e cola no checkout.",
    points: [
      `A chave ativa e ${pix.key}.`,
      "O cliente pode pagar direto no app do banco ou usar o QR Code gerado pelo site.",
      "Depois do pagamento, o pedido segue com codigo para confirmacao no WhatsApp."
    ],
    ctaLabel: "Quero pagar no Pix",
    ctaHref: "https://wa.me/5521920137249?text=Quero%20fechar%20meu%20pedido%20no%20Pix"
  },
  {
    id: "card",
    title: "Cartao de credito",
    icon: CreditCard,
    summary: "Checkout terceirizado para nao expor dados sensiveis dentro do site.",
    points: [
      "O fluxo abre o checkout hospedado do Mercado Pago.",
      "O cliente paga no ambiente seguro do provedor e retorna ao site com o status.",
      "Quando a credencial de producao estiver ativa, o processo fica totalmente online."
    ],
    ctaLabel: "Falar sobre cartao",
    ctaHref: "https://wa.me/5521920137249?text=Quero%20pagar%20no%20cartao%20de%20credito"
  },
  {
    id: "custom",
    title: "Projeto personalizado",
    icon: PackageCheck,
    summary: "Referencia, imagem, STL ou briefing para impressao 3D sob encomenda.",
    points: [
      "Voce pode mandar referencia pelo site ou pelo WhatsApp.",
      "A equipe confirma material, prazo, acabamento e caminho de pagamento.",
      "Esse fluxo serve para presente, setup, decoracao e pecas tecnicas."
    ],
    ctaLabel: "Enviar referencia",
    ctaHref: "https://wa.me/5521920137249?text=Quero%20enviar%20uma%20referencia%20para%20impressao%203D"
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
            <h2 className="mt-2 text-3xl font-black text-white">Atendimento orientado para fechar o pedido.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
              Use este painel para conduzir o cliente para Pix, cartao ou encomenda personalizada sem deixar a conversa vaga.
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
              <p className="mt-2 text-sm leading-7 text-white/68">Sempre oriente o cliente a confirmar o pedido com o codigo gerado no checkout e depois pagar nesta chave.</p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Cartao</p>
              </div>
              <p className="mt-3 text-lg font-bold text-white">
                {cardCheckoutReady ? "Checkout de cartao pronto para uso." : "Checkout de cartao preparado, aguardando token de producao."}
              </p>
              <p className="mt-2 text-sm leading-7 text-white/68">
                {cardCheckoutReady
                  ? "O site ja pode redirecionar o cliente para o Mercado Pago."
                  : "Falta apenas a credencial real do Mercado Pago para ativar o pagamento online de ponta a ponta."}
              </p>
            </div>

            <a
              href="https://wa.me/5521920137249?text=Quero%20atendimento%20humano%20para%20fechar%20meu%20pedido"
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
