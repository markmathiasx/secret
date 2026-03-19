"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  PackageCheck,
  QrCode,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { assistantQuickPrompts } from "@/lib/commerce-assistant";
import { pix, whatsappNumber } from "@/lib/constants";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  source?: "ai" | "fallback";
};

type AssistantApiResponse = {
  ok: boolean;
  message?: string;
  responseId?: string | null;
  aiReady?: boolean;
  source?: "ai" | "fallback";
  provider?: "openai" | "groq" | "ollama" | "fallback";
  model?: string;
};

function getAssistantStackLabel(provider: "openai" | "groq" | "ollama" | "fallback", model: string) {
  if (provider === "ollama") return "consultor automático local";
  if (provider === "groq" || provider === "openai") return "consultor automático online";
  return "consultor guiado";
}

function createWelcomeMessage(
  aiAssistantReady: boolean,
  cardCheckoutReady: boolean,
  aiAssistantProvider: "openai" | "groq" | "ollama" | "fallback",
  aiAssistantModel: string
): ChatMessage {
  const stackLabel = getAssistantStackLabel(aiAssistantProvider, aiAssistantModel);

  return {
    id: "welcome",
    role: "assistant",
    source: aiAssistantReady ? "ai" : "fallback",
    content: aiAssistantReady
      ? [
          "Sou o consultor digital da MDH 3D.",
          "Posso te indicar produtos do catálogo, explicar foto real, render do produto e prévia do modelo, orientar personalização e te conduzir para Pix ou cartão.",
          cardCheckoutReady
            ? "Se quiser, já posso começar por produto, presente, setup ou pagamento."
            : "Se quiser, já posso começar por produto, presente, setup, Pix ou parcelamento com a equipe.",
        ].join(" ")
      : [
          "Sou o consultor guiado da MDH 3D.",
          "Consigo te orientar com base no catálogo, pagamento, entrega e personalização, e se precisar a equipe humana assume pelo WhatsApp.",
        ].join(" "),
  };
}

const infoCards = [
  {
    id: "pix",
    title: "Pix ativo",
    icon: QrCode,
    description: "Chave direta, QR Code e fluxo imediato no checkout para acelerar o fechamento.",
    actionLabel: "Fechar no Pix",
    actionHref: "/checkout",
  },
  {
    id: "card",
    title: "Cartão e parcelamento",
    icon: CreditCard,
    description: "Checkout online quando ativo, com apoio do atendimento humano para fechar sem ruído.",
    actionLabel: "Falar sobre cartão",
    actionHref: `https://wa.me/${whatsappNumber}?text=Quero%20pagar%20no%20cartao%20de%20credito`,
  },
  {
    id: "custom",
    title: "Projeto personalizado",
    icon: PackageCheck,
    description: "Envie imagem, briefing, STL, OBJ ou 3MF para receber análise de material, prazo e acabamento.",
    actionLabel: "Enviar referência",
    actionHref: "/imagem-para-impressao-3d",
  },
] as const;

export function CommerceAssistantDialog({
  open,
  onClose,
  cardCheckoutReady,
  aiAssistantReady,
  aiAssistantProvider,
  aiAssistantModel,
}: {
  open: boolean;
  onClose: () => void;
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "fallback";
  aiAssistantModel: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(aiAssistantReady, cardCheckoutReady, aiAssistantProvider, aiAssistantModel),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const conversationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    conversationRef.current?.scrollTo({ top: conversationRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    setMessages([createWelcomeMessage(aiAssistantReady, cardCheckoutReady, aiAssistantProvider, aiAssistantModel)]);
    setInput("");
    setError("");
    setResponseId(null);
    setIsSending(false);
  }, [open, aiAssistantReady, cardCheckoutReady, aiAssistantProvider, aiAssistantModel]);

  const statusLabel = useMemo(() => {
    if (aiAssistantReady) {
      return aiAssistantProvider === "ollama" ? "Atendimento automático ativo" : "Atendimento automático ativo";
    }
    return "Consultor guiado";
  }, [aiAssistantProvider, aiAssistantReady]);

  const stackLabel = useMemo(
    () => getAssistantStackLabel(aiAssistantProvider, aiAssistantModel),
    [aiAssistantModel, aiAssistantProvider]
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          previousResponseId: responseId,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as AssistantApiResponse;

      if (!response.ok || !data.ok || !data.message) {
        throw new Error("Falha ao consultar o atendimento.");
      }

      setResponseId(data.responseId || null);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || "Posso continuar te ajudando.",
          source: data.source || (data.aiReady ? "ai" : "fallback"),
        },
      ]);
    } catch {
      setError("Não consegui responder agora. Use o WhatsApp para atendimento imediato.");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          source: "fallback",
          content: `Posso te direcionar para o WhatsApp agora: https://wa.me/${whatsappNumber}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/72 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[36px] border border-white/10 bg-[#07111a] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Consultor comercial</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {statusLabel}
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-black text-white">Tire dúvidas, descubra produtos e avance para a compra.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
              Este consultor responde com base no catálogo, na política comercial da loja e no fluxo real de pagamento e personalização da MDH 3D.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Resumo da operação</p>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-white/72">
                <p>Pix visível no checkout e chave ativa em <span className="font-semibold text-white">{pix.key}</span>.</p>
                <p>{cardCheckoutReady ? "Cartão online disponível em ambiente seguro." : "Parcelamento tratado com apoio da equipe humana."}</p>
                <p>Projetos personalizados aceitam briefing, imagem, STL, OBJ e 3MF.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article key={card.id} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{card.title}</h3>
                        <p className="text-sm text-white/58">{card.description}</p>
                      </div>
                    </div>
                    <a
                      href={card.actionHref}
                      target={card.actionHref.startsWith("http") ? "_blank" : undefined}
                      rel={card.actionHref.startsWith("http") ? "noreferrer" : undefined}
                      className="btn-secondary mt-4 gap-2"
                    >
                      {card.actionLabel}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </article>
                );
              })}
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Quero%20atendimento%20humano%20para%20fechar%20meu%20pedido`}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp mt-4 w-full gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Ir para atendimento humano
            </a>
          </aside>

          <section className="flex min-h-[640px] flex-col bg-black/10">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Conversa de compra</p>
                  <p className="text-xs text-white/50">
                    Pergunte por item, faixa de preço, foto real, pagamento, frete ou personalização.
                  </p>
                </div>
              </div>
            </div>

            <div ref={conversationRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-[0_12px_30px_rgba(2,8,23,0.18)] ${
                      message.role === "user"
                        ? "border border-cyan-300/25 bg-cyan-400/15 text-cyan-50"
                        : "border border-white/10 bg-white/5 text-white/78"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/68">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Consultando o catálogo e a operação da loja...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 px-6 py-4">
              <div className="mb-4 flex flex-wrap gap-2">
                {assistantQuickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-cyan-300/20 hover:text-white"
                    disabled={isSending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="grid gap-3">
                <label className="sr-only" htmlFor="commerce-assistant-input">
                  Faça sua pergunta
                </label>
                <div className="flex gap-3">
                  <textarea
                    id="commerce-assistant-input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ex.: quero um presente geek até R$ 80 com foto real, ou preciso de um suporte para controle..."
                    className="min-h-[104px] flex-1 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30"
                    disabled={isSending}
                  />
                  <button type="submit" className="btn-primary self-end px-5 py-4" disabled={isSending || !input.trim()}>
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/45">
                <div className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  O consultor usa o catálogo e as regras da loja; o fechamento final continua no checkout e no atendimento humano.
                </div>
                {error ? <p className="text-amber-200">{error}</p> : null}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
