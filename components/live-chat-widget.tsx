"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { usePathname } from "next/navigation";
import { LoaderCircle, MessageCircleMore, SendHorizonal, ShieldCheck, Sparkles, X } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";

const PENDING_SUBJECT_KEY = "mdh-chat-pending-subject";

type ChatMessage = {
  id: string;
  sender_type: "customer" | "ai" | "support_agent";
  message: string;
  created_at: string | Date;
};

type SupportStatus = {
  available: boolean;
  average_wait_time: number;
  active_agents: number;
  queue_length: number;
};

const VISITOR_STORAGE_KEY = "mdh-chat-visitor-id";
const THREAD_STORAGE_KEY = "mdh-chat-thread-id";

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

export function LiveChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [visitorId, setVisitorId] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [supportStatus, setSupportStatus] = useState<SupportStatus | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

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
        const previousCount = lastMessageCountRef.current;
        lastMessageCountRef.current = nextMessages.length;
        setMessages(nextMessages);

        if (isOpen) {
          setUnreadCount(0);
        } else if (nextMessages.length > previousCount) {
          setUnreadCount((current) => current + (nextMessages.length - previousCount));
        }

        scrollToBottom();
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [isOpen]);

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
      window.localStorage.setItem(THREAD_STORAGE_KEY, session.id);
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
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          action: "send_message",
          visitor_id: visitorId || getClientVisitorId(),
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
    const storedThread = window.localStorage.getItem(THREAD_STORAGE_KEY);
    if (storedThread) {
      setThreadId(storedThread);
      void loadThread(storedThread, true);
    }
    void loadSupportStatus();
  }, [loadSupportStatus, loadThread]);

  // Listen for product-context open-chat events dispatched by PDP CTAs
  useEffect(() => {
    function handleOpenChat() {
      setIsOpen(true);
      setUnreadCount(0);
      if (!threadId) {
        void startChat();
      }
    }
    window.addEventListener("mdh:openchat", handleOpenChat);
    return () => window.removeEventListener("mdh:openchat", handleOpenChat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    const timer = window.setInterval(() => {
      void loadThread(threadId, true);
      void loadSupportStatus();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [threadId, isOpen, loadSupportStatus, loadThread]);

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
        <section className="flex h-[min(760px,calc(100vh-1rem))] w-[min(420px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/96 shadow-[0_24px_80px_rgba(2,8,23,0.42)] backdrop-blur-2xl">
          <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,15,24,0.96),rgba(8,15,24,0.84))] px-4 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">Atendimento MDH</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-white">Tire dúvidas antes de comprar</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                {supportStatus?.available
                  ? `Equipe online • tempo médio ${supportStatus.average_wait_time} min`
                  : "Atendimento humano disponível no WhatsApp"}
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
            <div className="border-b border-white/10 px-4 py-3 text-xs text-white/55">
              Responda por aqui ou chame o WhatsApp em +{whatsappNumber}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/70">
                  Escreva o que você quer comprar, seu orçamento ou sua dúvida sobre prazo, frete e personalização.
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
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Fallback humano ativo
                </span>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 transition hover:border-emerald-300/20 hover:text-white"
                >
                  WhatsApp
                </a>
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
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (!threadId && !loading) {
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
            <span className="block text-sm font-semibold">Tirar dúvidas agora</span>
            <span className="block text-[11px] text-white/60">
              {unreadCount > 0 ? `${unreadCount} nova(s) mensagem(ns)` : "Atendimento pré-venda"}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export default LiveChatWidget;
