"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, MessageSquareReply, RefreshCcw, Search, SendHorizonal, Sparkles } from "lucide-react";

type InboxThreadSummary = {
  id: string;
  subject: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: null | {
    id: string;
    body: string;
    createdAt: string;
    senderId: string;
  };
};

type InboxThreadDetail = {
  id: string;
  subject: string;
  buyerId: string | null;
  sellerId: string | null;
  createdAt: string;
  buyer: { id: string; name: string | null; email: string | null } | null;
  seller: { id: string; name: string | null; email: string | null } | null;
  messages: Array<{
    id: string;
    senderId: string;
    body: string;
    createdAt: string;
  }>;
};

export function AdminInbox({ initialThreads, initialThreadId }: { initialThreads: InboxThreadSummary[]; initialThreadId?: string | null }) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId || initialThreads[0]?.id || null);
  const [thread, setThread] = useState<InboxThreadDetail | null>(null);
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedThread = useMemo(
    () => threads.find((item) => item.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  );

  const filteredThreads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return threads;

    return threads.filter((item) =>
      [item.subject, item.buyerName, item.buyerEmail, item.lastMessage?.body || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, threads]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  }

  const loadThreads = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/inbox", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao carregar a fila.");
      }

      if (Array.isArray(data?.threads)) {
        setThreads(data.threads);
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a fila.");
    }
  }, []);

  const loadThread = useCallback(async (threadId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/inbox?thread_id=${encodeURIComponent(threadId)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao carregar a conversa.");
      }

      if (data?.thread) {
        setThread(data.thread);
        setSelectedThreadId(threadId);
        setReply("");
        scrollToBottom();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a conversa.");
    } finally {
      setLoading(false);
    }
  }, []);

  const sendReply = useCallback(async () => {
    const trimmed = reply.trim();
    if (!trimmed || !selectedThreadId) return;

    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          threadId: selectedThreadId,
          message: trimmed,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Falha ao enviar a resposta.");
      }

      setReply("");
      await Promise.all([loadThread(selectedThreadId), loadThreads()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a resposta.");
    } finally {
      setSending(false);
    }
  }, [loadThread, loadThreads, reply, selectedThreadId]);

  useEffect(() => {
    if (selectedThreadId) {
      void loadThread(selectedThreadId);
    }
  }, [loadThread, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const timer = window.setInterval(() => {
      void loadThread(selectedThreadId);
      void loadThreads();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadThread, loadThreads, selectedThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [thread]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-[30px] border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-2 text-cyan-100">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.2em]">Inbox unificado</p>
        </div>
        <p className="mt-3 text-2xl font-black text-white">Conversas do site e do WhatsApp</p>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Cada conversa entra aqui em tempo real para a equipe assumir, responder e fechar o atendimento.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Conversas</p>
            <p className="mt-1 text-lg font-bold text-white">{threads.length}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Selecionada</p>
            <p className="mt-1 truncate text-lg font-bold text-white">{selectedThread ? "1" : "0"}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conversa"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-[18px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <button type="button" onClick={() => void loadThreads()} className="btn-secondary mt-3 gap-2">
          <RefreshCcw className="h-4 w-4" />
          Atualizar
        </button>

        <div className="mt-4 grid gap-3">
          {filteredThreads.map((item) => {
            const active = item.id === selectedThreadId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => void loadThread(item.id)}
                className={`rounded-[22px] border px-4 py-4 text-left transition ${
                  active
                    ? "border-cyan-300/25 bg-cyan-400/10 shadow-[0_16px_36px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{item.buyerName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{item.subject}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/55">
                    {new Date(item.lastMessageAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-3 max-h-[3.75rem] overflow-hidden text-sm leading-6 text-white/65">
                  {item.lastMessage?.body || "Sem mensagens ainda."}
                </p>
              </button>
            );
          })}

          {!filteredThreads.length ? (
            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/50">
              Nenhuma conversa encontrada.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5">
        {thread ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/78">Conversa selecionada</p>
                <h2 className="mt-2 text-2xl font-black text-white">{thread.buyer?.name || thread.subject}</h2>
                <p className="mt-2 text-sm text-white/55">{thread.buyer?.email || "Visitante sem e-mail"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                    {thread.messages.length} mensagens
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/60">
                    Atualizada em {new Date(thread.messages[thread.messages.length - 1]?.createdAt || threadIdFallback(thread)).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => void loadThreads()} className="btn-glass gap-2">
                <MessageSquareReply className="h-4 w-4" />
                Recarregar fila
              </button>
            </div>

            <div className="mt-5 flex min-h-[540px] flex-col rounded-[24px] border border-white/10 bg-black/20">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {thread.messages.map((message) => {
                  const fromCustomer = message.senderId === thread.buyerId;
                  const fromAgent = message.senderId === thread.sellerId;
                  const fromAi = message.senderId === "ai-bot";

                  return (
                    <div key={message.id} className={`flex ${fromCustomer ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                          fromCustomer
                            ? "border border-cyan-300/20 bg-cyan-400/12 text-cyan-50"
                            : fromAi
                              ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-50"
                              : "border border-white/10 bg-white/5 text-white/80"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-white/35">
                          {fromCustomer ? "Cliente" : fromAgent ? "Atendente" : "IA"} •{" "}
                          {new Date(message.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {loading ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                      <AlertCircle className="h-4 w-4" />
                      Carregando conversa...
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 bg-black/20 p-4">
                <label className="sr-only" htmlFor="admin-reply">
                  Responder cliente
                </label>
                <div className="flex gap-3">
                  <textarea
                    id="admin-reply"
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Responder ao cliente..."
                    className="min-h-[92px] flex-1 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => void sendReply()}
                    disabled={sending || !reply.trim()}
                    className="btn-primary self-end gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SendHorizonal className="h-4 w-4" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-8 text-sm text-white/55">
            Nenhuma conversa selecionada.
          </div>
        )}
      </section>
    </div>
  );
}

function threadIdFallback(thread: InboxThreadDetail) {
  return thread.messages[thread.messages.length - 1]?.createdAt || thread.createdAt;
}
