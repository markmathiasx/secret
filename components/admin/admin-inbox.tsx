"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import {
  AlertCircle, Archive, CheckCircle2, MessageSquareReply,
  RefreshCcw, Search, SendHorizonal, Sparkles, UserCheck, X,
} from "lucide-react";
import { normalizeMetaChannel, type MetaChannel } from "@/lib/meta/types";

type ThreadStatus = "open" | "needs_human" | "resolved" | "archived";

type InboxThreadSummary = {
  id: string;
  subject: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  channel: MetaChannel;
  status: ThreadStatus;
  tags: string[];
  notes: string | null;
  unread: boolean;
  isWhatsApp: boolean;
  type: string;
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
  channel?: string;
  status?: string;
  tags?: string[];
  notes?: string | null;
  unread?: boolean;
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

const CHANNEL_LABELS: Record<MetaChannel, string> = {
  whatsapp: "WhatsApp",
  facebook_page: "Facebook",
  instagram_dm: "Instagram DM",
  instagram_comments: "Instagram comentários",
  site: "Site",
};

const CHANNEL_COLORS: Record<MetaChannel, string> = {
  whatsapp: "bg-emerald-400/15 text-emerald-300",
  facebook_page: "bg-blue-400/15 text-blue-300",
  instagram_dm: "bg-fuchsia-400/15 text-fuchsia-300",
  instagram_comments: "bg-pink-400/15 text-pink-300",
  site: "bg-cyan-400/12 text-cyan-300",
};

const STATUS_LABELS: Record<ThreadStatus, string> = {
  open: "Aberta",
  needs_human: "Precisa humano",
  resolved: "Resolvida",
  archived: "Arquivada",
};

const STATUS_COLORS: Record<ThreadStatus, string> = {
  open: "bg-cyan-400/12 text-cyan-300",
  needs_human: "bg-amber-400/15 text-amber-300",
  resolved: "bg-emerald-400/15 text-emerald-300",
  archived: "bg-white/10 text-white/40",
};

const ALL_CHANNELS: Array<MetaChannel | "all"> = [
  "all", "whatsapp", "facebook_page", "instagram_dm", "instagram_comments", "site",
];

const ALL_STATUSES: Array<ThreadStatus | "all"> = ["all", "open", "needs_human", "resolved", "archived"];

function ChannelBadge({ channel }: { channel: MetaChannel }) {
  const normalized = normalizeMetaChannel(channel);
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${CHANNEL_COLORS[normalized]}`}>
      {CHANNEL_LABELS[normalized]}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || "open") as ThreadStatus;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${STATUS_COLORS[s] ?? STATUS_COLORS.open}`}>
      {STATUS_LABELS[s] ?? s}
    </span>
  );
}

export function AdminInbox({
  initialThreads,
  initialThreadId,
}: {
  initialThreads: InboxThreadSummary[];
  initialThreadId?: string | null;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
    initialThreadId || initialThreads[0]?.id || null
  );
  const [thread, setThread] = useState<InboxThreadDetail | null>(null);
  const [reply, setReply] = useState("");
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<MetaChannel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | "all">("all");
  const [noteInput, setNoteInput] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [patching, setPatching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedThread = useMemo(
    () => threads.find((item) => item.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  );

  const filteredThreads = useMemo(() => {
    let result = threads;
    if (channelFilter !== "all") {
      result = result.filter((item) => item.channel === channelFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }
    const normalized = query.trim().toLowerCase();
    if (!normalized) return result;
    return result.filter((item) =>
      [item.subject, item.buyerName, item.buyerEmail, item.lastMessage?.body || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, channelFilter, statusFilter, threads]);

  const unreadCount = useMemo(() => threads.filter((t) => t.unread && t.status !== "archived").length, [threads]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    });
  }

  const loadThreads = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (channelFilter !== "all") params.set("channel", channelFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await fetch(`/api/admin/inbox?${params.toString()}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Falha ao carregar a fila.");
      if (Array.isArray(data?.threads)) { setThreads(data.threads); setError(""); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a fila.");
    }
  }, [channelFilter, statusFilter]);

  const loadThread = useCallback(async (threadId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/inbox?thread_id=${encodeURIComponent(threadId)}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Falha ao carregar a conversa.");
      if (data?.thread) {
        setThread(data.thread);
        setSelectedThreadId(threadId);
        setReply("");
        setNoteInput(data.thread.notes || "");
        setThreads((prev) => prev.map((t) => t.id === threadId ? { ...t, unread: false } : t));
        scrollToBottom();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a conversa.");
    } finally {
      setLoading(false);
    }
  }, []);

  const patchThread = useCallback(async (action: string, extra?: Record<string, unknown>) => {
    if (!selectedThreadId) return;
    setPatching(true);
    try {
      const response = await fetch("/api/admin/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedThreadId, action, ...extra }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Falha ao atualizar.");
      if (data?.thread) {
        setThread((prev) => prev ? { ...prev, ...data.thread } : prev);
        setThreads((prev) => prev.map((t) => t.id === selectedThreadId ? { ...t, ...data.thread } : t));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar.");
    } finally {
      setPatching(false);
    }
  }, [selectedThreadId]);

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
        body: JSON.stringify({ threadId: selectedThreadId, message: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) throw new Error(data?.error || "Falha ao enviar a resposta.");
      setReply("");
      await Promise.all([loadThread(selectedThreadId), loadThreads()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar a resposta.");
    } finally {
      setSending(false);
    }
  }, [loadThread, loadThreads, reply, selectedThreadId]);

  const saveNote = useCallback(async () => {
    await patchThread("note", { note: noteInput });
  }, [patchThread, noteInput]);

  const handleReplyKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        void sendReply();
      }
    },
    [sendReply]
  );

  useEffect(() => {
    if (selectedThreadId) void loadThread(selectedThreadId);
  }, [loadThread, selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId) return;
    const timer = window.setInterval(() => {
      void loadThread(selectedThreadId);
      void loadThreads();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [loadThread, loadThreads, selectedThreadId]);

  useEffect(() => { scrollToBottom(); }, [thread]);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* Sidebar */}
      <aside className="rounded-[30px] border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-2 text-cyan-100">
          <Sparkles className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.2em]">Inbox unificado</p>
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
              {unreadCount} novo{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-3 text-2xl font-black text-white">Conversas omnichannel</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Conversas</p>
            <p className="mt-1 text-lg font-bold text-white">{filteredThreads.length}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Precisam atenção</p>
            <p className="mt-1 text-lg font-bold text-amber-300">
              {threads.filter((t) => t.status === "needs_human").length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conversa"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>

        {/* Channel filter */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_CHANNELS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                channelFilter === ch
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {ch === "all" ? "Todos" : CHANNEL_LABELS[ch as MetaChannel]}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                statusFilter === s
                  ? "border-amber-400/40 bg-amber-400/12 text-amber-200"
                  : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {s === "all" ? "Todos status" : STATUS_LABELS[s as ThreadStatus]}
            </button>
          ))}
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

        {/* Thread list */}
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
                    : item.status === "needs_human"
                    ? "border-amber-400/25 bg-amber-400/8 hover:border-amber-400/40"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-1.5">
                    {item.unread && (
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
                    )}
                    <p className="truncate text-sm font-semibold text-white">{item.buyerName}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-white/55 shrink-0">
                    {new Date(item.lastMessageAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{item.subject}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <ChannelBadge channel={(item.channel ?? "site") as MetaChannel} />
                  {item.status !== "open" && <StatusBadge status={item.status} />}
                  {item.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 max-h-[3rem] overflow-hidden text-sm leading-6 text-white/65">
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

      {/* Detail panel */}
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5">
        {thread ? (
          <>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/78">Conversa selecionada</p>
                <h2 className="mt-2 text-2xl font-black text-white">{thread.buyer?.name || thread.subject}</h2>
                <p className="mt-2 text-sm text-white/55">{thread.buyer?.email || "Visitante sem e-mail"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ChannelBadge channel={(thread.channel ?? "site") as MetaChannel} />
                  <StatusBadge status={thread.status ?? "open"} />
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                    {thread.messages.length} mensagens
                  </span>
                  {thread.tags?.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => void patchThread("untag", { tag })}
                        className="text-white/30 hover:text-rose-300"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {thread.status !== "resolved" && (
                  <button
                    type="button"
                    disabled={patching}
                    onClick={() => void patchThread("resolve")}
                    className="btn-glass gap-1.5 text-emerald-300 hover:bg-emerald-400/10"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Resolver
                  </button>
                )}
                {thread.status === "resolved" && (
                  <button
                    type="button"
                    disabled={patching}
                    onClick={() => void patchThread("reopen")}
                    className="btn-glass gap-1.5"
                  >
                    Reabrir
                  </button>
                )}
                {thread.status !== "archived" && (
                  <button
                    type="button"
                    disabled={patching}
                    onClick={() => void patchThread("archive")}
                    className="btn-glass gap-1.5 text-white/50"
                  >
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </button>
                )}
                {!thread.sellerId && (
                  <button
                    type="button"
                    disabled={patching}
                    onClick={() => void patchThread("assign")}
                    className="btn-glass gap-1.5 text-cyan-300"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assumir
                  </button>
                )}
                <button type="button" onClick={() => setShowNotes((v) => !v)} className="btn-glass gap-1.5">
                  Notas
                </button>
                <button type="button" onClick={() => void loadThreads()} className="btn-glass gap-2">
                  <MessageSquareReply className="h-4 w-4" />
                  Recarregar
                </button>
              </div>
            </div>

            {/* Internal notes panel */}
            {showNotes && (
              <div className="mt-4 rounded-[20px] border border-amber-400/15 bg-amber-400/5 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/70">Nota interna</p>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Adicione uma nota interna visível apenas para a equipe..."
                  className="w-full resize-none rounded-[14px] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
                  rows={3}
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={saveNote} disabled={patching} className="btn-glass text-sm">
                    Salvar nota
                  </button>
                  <button type="button" onClick={() => setShowNotes(false)} className="btn-glass text-sm text-white/40">
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="mt-5 flex min-h-[400px] flex-col rounded-[24px] border border-white/10 bg-black/20">
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
                            day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
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
                <label className="sr-only" htmlFor="admin-reply">Responder cliente</label>
                <div className="flex gap-3">
                  <textarea
                    id="admin-reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={handleReplyKeyDown}
                    placeholder="Responder ao cliente... (Ctrl+Enter para enviar)"
                    className="min-h-[92px] flex-1 resize-none rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
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
