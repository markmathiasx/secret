"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Bot,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  MessageCircleMore,
  PackageCheck,
  SendHorizonal,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { assistantQuickPrompts } from "@/lib/assistant-prompts";
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
  provider?: "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";
  model?: string;
  threadId?: string | null;
};

function buildClientAssistantFallback(message: string) {
  const normalized = message.toLowerCase();

  if (/(que horas|hora atual|hor[aá]rio|que dia|data de hoje|dia de hoje)/.test(normalized)) {
    const date = new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    return `Agora são ${time}, horário de Brasília. Hoje é ${date}. Também posso conversar sobre produtos, entrega, pagamento, STL, carrinho, login e páginas do site.`;
  }

  if (/(site|loja|mdh|cat[aá]logo|checkout|conta|login|como funciona|p[aá]gina)/.test(normalized)) {
    return "Posso responder sobre o catálogo, páginas do site, checkout, Pix, cartão, entrega, personalização, STL e atendimento humano. Pergunte como no ChatGPT: produto, prazo, preço, foto real, pedido ou suporte.";
  }

  if (/(stl|obj|3mf|personaliz|briefing|referencia|referência)/.test(normalized)) {
    return "Para projeto personalizado, mande sua referência em /imagem-para-impressao-3d ou siga para o atendimento humano para validar material, prazo e acabamento.";
  }

  if (/(presente|foto real|lembranc|gift)/.test(normalized)) {
    return "Se a prioridade é presentear com menos dúvida, eu começaria pelo catálogo com foto real e por itens até a faixa de preço que você tiver em mente. Se quiser, abra o atendimento humano e eu te levo para o fechamento.";
  }

  if (/(setup|suporte|organiza|mesa|fone|controle)/.test(normalized)) {
    return "Para setup e utilidade, o melhor caminho é abrir a vitrine de setup no catálogo e cruzar com pronta entrega. Se preferir, chame o atendimento para afinar a indicação com o seu uso.";
  }

  if (/(pix|cartao|cartão|parcel)/.test(normalized)) {
    return "Eu consigo te orientar por Pix, cartão e próxima etapa de fechamento. Se quiser resolver isso agora com a equipe, abra o atendimento humano ou siga direto para /checkout.";
  }

  return `Posso te orientar por objetivo, faixa de preço, foto real, pronta entrega ou personalização. Se preferir atendimento humano imediato, use https://wa.me/${whatsappNumber}.`;
}

function createWelcomeMessage(
  aiAssistantReady: boolean,
  cardCheckoutReady: boolean
): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    source: aiAssistantReady ? "ai" : "fallback",
    content: aiAssistantReady
      ? [
          "Sou o consultor de compra da MDH 3D.",
          "Posso separar produtos por faixa de preço, foto real, pronta entrega, setup, presente ou personalização.",
          cardCheckoutReady
            ? "Se você já souber o objetivo da compra, eu encurto a seleção e te levo para o fechamento."
            : "Se você já souber o objetivo da compra, eu encurto a seleção e te levo para Pix ou atendimento humano.",
        ].join(" ")
      : [
          "Sou o consultor de compra da MDH 3D.",
          "Consigo te orientar com base no catálogo, no pagamento, na entrega e na personalização, e a equipe humana assume pelo WhatsApp quando for necessário.",
        ].join(" "),
  };
}

const infoCards = [
  {
    id: "gift",
    title: "Presentes com foto real",
    icon: Sparkles,
    description: "Comece por itens com impacto visual forte e caminho curto até o fechamento.",
    actionLabel: "Ver presentes",
    actionHref: "/catalogo?intent=Presente&mode=real",
  },
  {
    id: "setup",
    title: "Setup e utilidades",
    icon: PackageCheck,
    description: "Peças funcionais para mesa, bancada e organização com leitura rápida de valor.",
    actionLabel: "Ver setup",
    actionHref: "/catalogo?category=Setup%20%26%20Organiza%C3%A7%C3%A3o&status=Pronta%20entrega",
  },
  {
    id: "custom",
    title: "Projeto personalizado",
    icon: CreditCard,
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
  aiAssistantProvider: _aiAssistantProvider,
  aiAssistantModel: _aiAssistantModel,
  liveChatMode,
}: {
  open: boolean;
  onClose: () => void;
  cardCheckoutReady: boolean;
  aiAssistantReady: boolean;
  aiAssistantProvider: "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";
  aiAssistantModel: string;
  liveChatMode: "chatwoot" | "native" | "whatsapp";
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(aiAssistantReady, cardCheckoutReady),
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [assistantThreadId, setAssistantThreadId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const conversationRef = useRef<HTMLDivElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const leadScore = useMemo(() => {
    return Math.min(
      100,
      messages.reduce((score, message) => {
        if (message.role !== "user") return score;
        const content = message.content.toLowerCase();
        let next = score + 6;
        if (/(comprar|fechar|pedido|checkout|carrinho|pix|cart[aã]o|pre[cç]o|valor|frete)/.test(content)) next += 24;
        if (/(hoje|agora|urgente|pronta entrega|r[aá]pido|presente)/.test(content)) next += 18;
        if (/(stl|personaliz|sob medida|quantidade|lote|brinde)/.test(content)) next += 12;
        return next;
      }, 0)
    );
  }, [messages]);
  const leadStage = leadScore >= 70 ? "Pronto para fechar" : leadScore >= 40 ? "Qualificando compra" : "Descoberta";

  function scrollToLatest() {
    requestAnimationFrame(() => {
      conversationEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  }

  useEffect(() => {
    if (!open) return;
    scrollToLatest();
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    setMessages([createWelcomeMessage(aiAssistantReady, cardCheckoutReady)]);
    setInput("");
    setError("");
    setResponseId(null);
    setIsSending(false);
  }, [open, aiAssistantReady, cardCheckoutReady]);

  function getVisitorId() {
    const key = "mdh_assistant_visitor_id";
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const value = `assistant-${crypto.randomUUID()}`;
    window.localStorage.setItem(key, value);
    return value;
  }

  const statusLabel = useMemo(() => {
    if (aiAssistantReady) {
      return "Resposta imediata no site";
    }
    return "Catálogo + apoio humano";
  }, [aiAssistantReady]);

  const liveSupportLabel = useMemo(() => {
    return liveChatMode === "chatwoot"
      ? "Atendimento ao vivo no widget"
      : "Atendimento humano no WhatsApp";
  }, [liveChatMode]);

  function openLiveChat() {
    if (liveChatMode === "chatwoot") {
      window.dispatchEvent(new CustomEvent("mdh:chatwoot-open"));
      return;
    }

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Quero atendimento humano para fechar meu pedido")}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

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
          threadId: assistantThreadId,
          visitorId: getVisitorId(),
          source: "assistant_dialog",
          channel: "site",
        }),
      });

      const data = (await response.json().catch(() => ({}))) as AssistantApiResponse;

      if (!response.ok || !data.ok || !data.message) {
        throw new Error("Falha ao consultar o atendimento.");
      }

      setResponseId(data.responseId || null);
      if (data.threadId) setAssistantThreadId(data.threadId);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || "Posso continuar te ajudando.",
          source: data.source || (data.aiReady ? "ai" : "fallback"),
        },
      ]);
      scrollToLatest();
    } catch {
      setError("Não consegui responder agora. Use o WhatsApp para atendimento imediato.");
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          source: "fallback",
          content: buildClientAssistantFallback(trimmed),
        },
      ]);
      scrollToLatest();
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void sendMessage(input);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/72 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto flex h-[min(94vh,900px)] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07111a] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Consultor de compra</p>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                {statusLabel}
              </span>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                {leadStage}
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-black text-white">Encontre a peça certa e avance para o fechamento.</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">
              Este consultor responde com base no catálogo, na política comercial da loja e no fluxo real de pagamento, entrega e personalização da MDH 3D.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-emerald-100">
                {liveSupportLabel}
              </span>
              <button
                type="button"
                onClick={openLiveChat}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-cyan-300/20 hover:text-white"
              >
                Abrir atendimento
              </button>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="hidden overflow-y-auto border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 lg:block lg:border-b-0 lg:border-r">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3 text-cyan-100">
                <Sparkles className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.18em]">Base para fechar</p>
              </div>
              <div className="mt-4 grid gap-3 text-sm leading-7 text-white/72">
                <p>
                  {pix.key
                    ? <>Pix visível no checkout e chave ativa em <span className="font-semibold text-white">{pix.key}</span>.</>
                    : "Pix visível no checkout quando a chave estiver configurada no servidor."}
                </p>
                <p>{cardCheckoutReady ? "Cartão online disponível em ambiente seguro." : "Parcelamento tratado com apoio da equipe humana."}</p>
                <p>Projetos personalizados aceitam briefing, imagem, STL, OBJ e 3MF.</p>
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-emerald-100">
                  <Target className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]">Intenção de compra</p>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-black/20 px-3 py-1 text-xs font-bold text-emerald-100">
                  {leadScore}/100
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-white transition-all duration-500"
                  style={{ width: `${leadScore}%` }}
                />
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">
                {leadScore >= 70
                  ? "Cliente com sinais fortes de fechamento. Melhor caminho: carrinho, Pix ou atendimento humano."
                  : leadScore >= 40
                    ? "Cliente com intenção clara. Faça uma seleção curta e ofereça próximo passo."
                    : "Cliente ainda explorando. Priorize faixa de preço, uso e prova visual."}
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/carrinho" onClick={onClose} className="btn-primary justify-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Ir para carrinho
                </Link>
                <Link href="/catalogo?intent=Compra%20r%C3%A1pida&mode=real" onClick={onClose} className="btn-secondary justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Ver compra rápida
                </Link>
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

          <section className="flex min-h-0 flex-col overflow-hidden bg-black/10">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-100">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Conversa com o consultor</p>
                  <p className="text-xs text-white/50">
                    Converse sobre produtos, páginas do site, dia/hora, pagamento, entrega, foto real, pronta entrega ou personalização.
                  </p>
                </div>
              </div>
            </div>

            <div ref={conversationRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[92%] rounded-[24px] px-5 py-4 text-[15px] leading-7 shadow-[0_12px_30px_rgba(2,8,23,0.18)] ${
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
              <div ref={conversationEndRef} />
            </div>

            <div className="border-t border-white/10 bg-black/20 px-6 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Sugestões</span>
                {assistantQuickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => void sendMessage(prompt.prompt)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/72 transition hover:border-cyan-300/20 hover:text-white"
                    disabled={isSending}
                  >
                    {prompt.label}
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
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Pergunte como no chat: produto, prazo, Pix, STL, data, site..."
                    className="min-h-[76px] max-h-[180px] flex-1 resize-none rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none placeholder:text-white/30"
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
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={openLiveChat} className="btn-secondary gap-2">
                  <MessageCircleMore className="h-4 w-4" />
                  {liveChatMode === "chatwoot" ? "Abrir atendimento ao vivo" : "Chamar no WhatsApp"}
                </button>
                <Link href="/catalogo" className="btn-glass gap-2">
                  <PackageCheck className="h-4 w-4" />
                  Ver catálogo
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
