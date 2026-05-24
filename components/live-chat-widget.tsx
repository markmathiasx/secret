"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { FileText, LoaderCircle, MessageCircleMore, SendHorizonal, ShieldCheck, Sparkles, UserCheck, X } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const PENDING_SUBJECT_KEY = "mdh-chat-pending-subject";
const HUMAN_REQUEST_PATTERN = /(humano|atendente|pessoa|falar com algu[eé]m|suporte humano)/i;

type ChatMessage = {
  id: string;
  sender_type: "customer" | "ai" | "support_agent";
  message: string;
  created_at: string | Date;
};

type PublicChatStatus = "active" | "waiting" | "resolved" | "closed" | "needs_human";

type SupportStatus = {
  available: boolean;
  average_wait_time: number;
  active_agents: number;
  queue_length: number;
  provider: "chatwoot" | "native" | "whatsapp";
  launchMode: "chatwoot" | "native" | "whatsapp";
  label: string;
  handoffUrl: string;
};

const VISITOR_STORAGE_KEY = "mdh-chat-visitor-id";
const CHAT_QUICK_ACTIONS = [
  "Quero um presente com foto real até R$ 100",
  "Preciso de uma peça para setup",
  "Como funciona um projeto com STL?",
] as const;

function createVisitorId() {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `visitor-${random.replace(/[^a-z0-9]+/gi, "").slice(0, 24)}`;
}

function getClientVisitorId() {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY);
  if (existing) return existing;

  const next = createVisitorId();
  window.localStorage.setItem(VISITOR_STORAGE_KEY, next);
  return next;
}

function formatTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildWhatsAppTranscript(messages: ChatMessage[], threadId: string | null, pathname: string | null) {
  const transcript = messages.slice(-8).map((message) => {
    const sender = message.sender_type === "customer" ? "Cliente" : message.sender_type === "support_agent" ? "Equipe MDH" : "Assistente MDH";
    return `${sender}: ${message.message}`;
  });

  return [
    "Oi! Quero continuar este atendimento da MDH 3D no WhatsApp.",
    threadId ? `Conversa do site: ${threadId}` : null,
    pathname ? `Página: ${pathname}` : null,
    transcript.length ? "Resumo recente:" : null,
    ...transcript,
  ].filter(Boolean).join("\n");
}

export function LiveChatWidget({
  defaultMode = "native",
}: {
  defaultMode?: "chatwoot" | "native" | "whatsapp";
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadStatus, setThreadStatus] = useState<PublicChatStatus>("active");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [supportStatus, setSupportStatus] = useState<SupportStatus | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [chatwootReady, setChatwootReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);
  const launchMode = supportStatus?.launchMode || defaultMode;
  const usesNativeChat = launchMode === "native";
  const handoffRequested = useMemo(
    () =>
      threadStatus === "needs_human" ||
      messages.some((message) => message.sender_type === "customer" && HUMAN_REQUEST_PATTERN.test(message.message)) ||
      messages.some((message) => /atendimento humano|atendente humano assumiu/i.test(message.message)),
    [messages, threadStatus]
  );
  const whatsappTranscriptText = useMemo(
    () => buildWhatsAppTranscript(messages, threadId, pathname),
    [messages, pathname, threadId]
  );
  const whatsappTranscriptHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappTranscriptText)}`;

  const hiddenOnPath = useMemo(
    () =>
      Boolean(
        pathname?.startsWith("/admin") ||
          pathname?.startsWith("/checkout") ||
          pathname?.startsWith("/conta") ||
          pathname?.startsWith("/login")
      ),
    [pathname]
  );

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  }

  function openChatwoot() {
    window.dispatchEvent(new CustomEvent("mdh:chatwoot-open"));
  }

  function openWhatsAppSupport(message?: string) {
    const query = message ? `?text=${encodeURIComponent(message)}` : "";
    window.open(`https://wa.me/${whatsappNumber}${query}`, "_blank", "noopener,noreferrer");
  }

  function launchChatwootFromPanel() {
    if (!chatwootReady) {
      setError("O widget ao vivo ainda está carregando. Tente novamente em alguns segundos ou use o WhatsApp.");
      return;
    }

    setError("");
    setIsOpen(false);
    openChatwoot();
  }

  const loadSupportStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/chat?action=status", { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as SupportStatus;
      if (response.ok) {
        setSupportStatus(data);
      }
    } catch {
      setSupportStatus(null);
    }
  }, []);

  const loadThread = useCallback(async (currentThreadId: string, silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`/api/chat?thread_id=${encodeURIComponent(currentThreadId)}`, {
        cache: "no-store",
      });
      const session = await response.json().catch(() => null);

      if (response.ok && session?.messages) {
        const nextMessages = session.messages as ChatMessage[];
        setThreadStatus((session.status as PublicChatStatus | undefined) || "active");
        const previousCount = lastMessageCountRef.current;
        lastMessageCountRef.current = nextMessages.length;
        setMessages(nextMessages);

        if (isOpen) {
          setUnreadCount(0);
        } else if (nextMessages.length > previousCount) {
          setUnreadCount((current) => current + (nextMessages.length - previousCount));
        }

        scrollToBottom();
      } else if (response.status === 403) {
        setThreadId(null);
        setMessages([]);
        setThreadStatus("active");
        lastMessageCountRef.current = 0;
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isOpen]);

  const restoreCurrentThread = useCallback(async () => {
    try {
      const response = await fetch("/api/chat?action=current", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      const session = payload?.session;

      if (response.ok && session?.id && Array.isArray(session.messages)) {
        setThreadId(session.id as string);
        setMessages(session.messages as ChatMessage[]);
        setThreadStatus((session.status as PublicChatStatus | undefined) || "active");
        lastMessageCountRef.current = session.messages.length;
      } else {
        setThreadId(null);
        setMessages([]);
        setThreadStatus("active");
        lastMessageCountRef.current = 0;
      }
    } catch {
      setThreadId(null);
      setMessages([]);
      setThreadStatus("active");
      lastMessageCountRef.current = 0;
    }
  }, []);

  async function startChat(subjectOverride?: string): Promise<string | null> {
    const id = visitorId || getClientVisitorId();
    if (!id) return null;

    setVisitorId(id);
    setError("");
    try {
      setLoading(true);
      // Consume any pending product-context subject set by a PDP CTA
      const pendingSubject =
        subjectOverride ||
        (typeof window !== "undefined" ? window.localStorage.getItem(PENDING_SUBJECT_KEY) : null) ||
        null;
      if (pendingSubject && typeof window !== "undefined") {
        window.localStorage.removeItem(PENDING_SUBJECT_KEY);
      }
      const defaultSubject = pathname ? `Atendimento via ${pathname}` : "Atendimento comercial";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "start",
          visitor_id: id,
          subject: pendingSubject || defaultSubject,
          priority: "normal",
        }),
      });

      const session = await response.json().catch(() => ({}));
      if (!response.ok || !session?.id) {
        throw new Error(session?.error || "Falha ao iniciar o chat.");
      }

      setThreadId(session.id);
      setThreadStatus((session.status as PublicChatStatus | undefined) || "active");
      lastMessageCountRef.current = 0;
      setMessages([]);
      setUnreadCount(0);
      setIsOpen(true);
      await loadThread(session.id, true);
      return session.id as string;
    } catch {
      setError("Não consegui iniciar o atendimento agora.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = await startChat();
      if (!currentThreadId) return;
    }

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      sender_type: "customer",
      message: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimistic]);
    if (HUMAN_REQUEST_PATTERN.test(trimmed)) {
      setThreadStatus("needs_human");
    }
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "send_message",
          thread_id: currentThreadId,
          message: trimmed,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.id) {
        throw new Error(payload?.error || "Falha ao enviar a mensagem.");
      }

      setTimeout(() => {
        void loadThread(currentThreadId, true);
      }, 1000);
      // Progressive retries to catch AI replies that arrive after the first poll
      setTimeout(() => {
        void loadThread(currentThreadId, true);
      }, 2600);
      setTimeout(() => {
        void loadThread(currentThreadId, true);
      }, 4400);
      setError("");
    } catch {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      setError("Não consegui enviar agora. Tente novamente ou use o WhatsApp.");
    } finally {
      setLoading(false);
      setUnreadCount(0);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void sendMessage();
  }

  useEffect(() => {
    setVisitorId(getClientVisitorId());
    void restoreCurrentThread();
    void loadSupportStatus();
  }, [loadSupportStatus, restoreCurrentThread]);

  useEffect(() => {
    function handleReady() {
      setChatwootReady(true);
      setError("");
    }

    function handleError() {
      setChatwootReady(false);
      setError("O chat ao vivo ainda está carregando. Se precisar, use o WhatsApp.");
    }

    window.addEventListener("mdh:chatwoot-ready", handleReady);
    window.addEventListener("mdh:chatwoot-error", handleError);

    return () => {
      window.removeEventListener("mdh:chatwoot-ready", handleReady);
      window.removeEventListener("mdh:chatwoot-error", handleError);
    };
  }, []);

  // Listen for product-context open-chat events dispatched by PDP CTAs
  useEffect(() => {
    function handleOpenChat() {
      if (launchMode === "whatsapp") {
        openWhatsAppSupport(whatsappTranscriptText);
        return;
      }

      setIsOpen(true);
      setUnreadCount(0);
      if (usesNativeChat && !threadId) {
        void startChat();
      }
    }
    window.addEventListener("mdh:openchat", handleOpenChat);
    return () => window.removeEventListener("mdh:openchat", handleOpenChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [launchMode, threadId, usesNativeChat, whatsappTranscriptText]);

  useEffect(() => {
    if (!threadId || !usesNativeChat) return;
    const timer = window.setInterval(() => {
      void loadThread(threadId, true);
      void loadSupportStatus();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [threadId, usesNativeChat, isOpen, loadSupportStatus, loadThread]);

  useEffect(() => {
    if (!isOpen) return;
    scrollToBottom();
  }, [isOpen, messages]);

  if (hiddenOnPath) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[110] sm:bottom-24 sm:right-6">
      {isOpen ? (
        launchMode === "chatwoot" ? (
          <section className="flex w-[min(400px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/96 shadow-[0_24px_80px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,15,24,0.96),rgba(8,15,24,0.84))] px-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Atendimento MDH</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">Atendimento ao vivo no widget oficial</p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {supportStatus?.available
                    ? `Equipe online • tempo médio ${supportStatus.average_wait_time} min`
                    : "Abra o widget para continuar no inbox comercial da loja"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
                aria-label="Fechar chat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-4 p-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/72">
                Use o widget da MDH para falar com a equipe sem sair do site. O consultor continua ajudando na seleção, e o atendimento humano assume o fechamento quando necessário.
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Inbox Chatwoot integrado
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  {chatwootReady ? "Widget pronto" : "Carregando widget"}
                </span>
              </div>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={launchChatwootFromPanel}
                  className="btn-primary w-full justify-center gap-2"
                >
                  <MessageCircleMore className="h-4 w-4" />
                  Abrir atendimento ao vivo
                </button>
                <button
                  type="button"
                  onClick={() => openWhatsAppSupport()}
                  className="btn-secondary w-full justify-center gap-2"
                >
                  WhatsApp
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {CHAT_QUICK_ACTIONS.map((prompt) => (
                  <span
                    key={prompt}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72"
                  >
                    {prompt}
                  </span>
                ))}
              </div>

              {error ? <p className="text-xs text-amber-200">{error}</p> : null}
            </div>
          </section>
        ) : (
          <section className="flex h-[min(760px,calc(100vh-1rem))] w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/96 shadow-[0_24px_80px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
            <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,15,24,0.96),rgba(8,15,24,0.84))] px-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-cyan-100">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em]">Atendimento MDH</p>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {handoffRequested ? "Atendimento humano solicitado" : "Tire dúvidas antes de comprar"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {handoffRequested
                    ? "A conversa foi marcada para a equipe assumir o fechamento."
                    : supportStatus?.available
                    ? `Equipe online • tempo médio ${supportStatus.average_wait_time} min`
                    : supportStatus?.label || "Atendimento humano disponível no WhatsApp"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10"
                aria-label="Fechar chat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col">
              <div className={`border-b px-4 py-3 text-xs ${handoffRequested ? "border-amber-300/18 bg-amber-300/8 text-amber-100" : "border-white/10 text-white/55"}`}>
                {handoffRequested ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Atendimento humano solicitado no inbox da MDH.
                    </span>
                    <a href={whatsappTranscriptHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-emerald-100 hover:text-white">
                      <FileText className="h-3.5 w-3.5" />
                      Levar histórico ao WhatsApp
                    </a>
                  </div>
                ) : (
                  `Responda por aqui ou chame o WhatsApp em +${whatsappNumber}`
                )}
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 ? (
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
                    Diga o que você quer comprar, sua faixa de preço ou se prefere foto real, pronta entrega e personalização. Para chamar uma pessoa, peça atendimento humano e a conversa fica marcada para a equipe.
                  </div>
                ) : null}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === "customer" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-7 shadow-[0_12px_28px_rgba(2,8,23,0.18)] ${
                        message.sender_type === "customer"
                          ? "border border-cyan-300/20 bg-cyan-400/12 text-cyan-50"
                          : "border border-white/10 bg-white/5 text-white/78"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.message}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/35">
                        {message.sender_type === "customer" ? "Você" : "MDH 3D"} • {formatTimestamp(message.created_at)}
                      </p>
                    </div>
                  </div>
                ))}

                {loading ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Processando resposta...
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(8,15,24,0.5),rgba(8,15,24,0.95))] p-4">
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                    handoffRequested
                      ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  }`}>
                    {handoffRequested ? <UserCheck className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    {handoffRequested ? "Humano solicitado" : "Fechamento com equipe humana"}
                  </span>
                  <a
                    href={messages.length ? whatsappTranscriptHref : `https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 transition hover:border-emerald-300/20 hover:text-white"
                  >
                    {messages.length ? "WhatsApp com histórico" : "WhatsApp"}
                  </a>
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                  {CHAT_QUICK_ACTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72 transition hover:border-cyan-300/20 hover:text-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Escreva sua dúvida..."
                    className="min-h-[56px] max-h-[140px] flex-1 resize-none rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={loading || !input.trim()}
                    className="inline-flex h-[56px] items-center justify-center rounded-[18px] border border-cyan-300/20 bg-cyan-400/15 px-4 text-cyan-50 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Enviar mensagem"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
                {error ? <p className="mt-2 text-xs text-amber-200">{error}</p> : null}
              </div>
            </div>
          </section>
        )
      ) : (
        <button
          type="button"
          onClick={() => {
            if (launchMode === "whatsapp") {
              openWhatsAppSupport(whatsappTranscriptText);
              return;
            }

            setIsOpen(true);
            if (launchMode === "native" && !threadId && !loading) {
              void startChat();
            }
          }}
          className="relative flex h-[64px] items-center gap-3 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 pl-5 text-white shadow-[0_18px_42px_rgba(37,211,102,0.22)] backdrop-blur-xl transition hover:scale-[1.02] hover:bg-emerald-300/15"
          aria-label="Abrir chat"
        >
          <span className="absolute inset-0 animate-pulse rounded-full border border-emerald-300/20" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-100">
            <MessageCircleMore className="h-5 w-5" />
          </span>
          <span className="relative text-left">
            <span className="block text-sm font-semibold">
              {launchMode === "chatwoot" ? "Abrir atendimento ao vivo" : launchMode === "whatsapp" ? "Falar no WhatsApp" : "Tirar dúvidas agora"}
            </span>
            <span className="block text-[11px] text-white/60">
              {unreadCount > 0
                ? `${unreadCount} nova(s) mensagem(ns)`
                : launchMode === "chatwoot"
                  ? supportStatus?.label || "Inbox comercial no widget"
                  : launchMode === "whatsapp"
                    ? "Resposta humana"
                    : handoffRequested
                      ? "Humano solicitado"
                      : "Atendimento pré-venda"}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export default LiveChatWidget;
