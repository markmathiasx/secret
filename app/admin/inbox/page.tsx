import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminInbox } from "@/components/admin/admin-inbox";
import { getChatwootAdminUrl, isChatwootWidgetConfigured } from "@/lib/env";
import { normalizeMetaChannel, type MetaChannel } from "@/lib/meta/types";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

/** Derive channel from DB field or legacy email prefix. */
function resolveChannel(channel: string | null | undefined, email: string | null | undefined): MetaChannel {
  if (channel && channel !== "site") return normalizeMetaChannel(channel);
  if (email?.endsWith("@mdh.local")) {
    if (email.startsWith("wa-")) return "whatsapp";
    if (email.startsWith("fb-")) return "facebook_page";
    if (email.startsWith("igc-")) return "instagram_comments";
    if (email.startsWith("ig-")) return "instagram_dm";
  }
  return normalizeMetaChannel(channel);
}

type Props = {
  searchParams?: Promise<{ thread?: string | string[] }>;
};

const inboxThreadInclude = {
  buyer: true,
  seller: true,
  messages: {
    orderBy: { createdAt: "desc" },
    take: 1,
  },
} satisfies Prisma.ChatThreadInclude;

type InboxThreadRecord = Prisma.ChatThreadGetPayload<{ include: typeof inboxThreadInclude }>;

export default async function AdminInboxPage({ searchParams }: Props) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  const chatwootAdminUrl = getChatwootAdminUrl();
  const chatwootConfigured = isChatwootWidgetConfigured();

  const query = (await Promise.resolve(searchParams ?? {})) as { thread?: string | string[] };
  const initialThreadId = Array.isArray(query.thread) ? query.thread[0] : query.thread || null;
  const [threads]: [InboxThreadRecord[]] = await Promise.all([
    prisma.chatThread.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 50,
      include: inboxThreadInclude,
    }),
  ]);

  const initialThreads = threads.map((thread) => ({
    id: thread.id,
    subject: thread.subject || "Atendimento comercial",
    buyerName: thread.buyer?.name || thread.buyer?.email || "Visitante",
    buyerEmail: thread.buyer?.email || "",
    sellerName: thread.seller?.name || "",
    lastMessageAt: (thread.lastMessageAt || thread.updatedAt).toISOString(),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    channel: resolveChannel(thread.channel, thread.buyer?.email),
    status: thread.status as "open" | "needs_human" | "resolved" | "archived",
    tags: thread.tags ?? [],
    notes: thread.notes ?? null,
    unread: thread.unread,
    isWhatsApp: Boolean(
      thread.buyer?.email?.endsWith("@mdh.local") &&
        (thread.buyer.email.startsWith("wa-") ||
          (thread.buyer.phone?.replace(/\D/g, "").length ?? 0) >= 11)
    ),
    type: thread.type as string,
    lastMessage: thread.messages[0]
      ? {
          id: thread.messages[0].id,
          body: thread.messages[0].body,
          createdAt: thread.messages[0].createdAt.toISOString(),
          senderId: thread.messages[0].senderId,
        }
      : null,
  }));

  return (
    <section className="mx-auto max-w-[1600px] px-6 py-10">
      <div className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] p-6 shadow-[0_28px_80px_rgba(2,8,23,0.32)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
        <h1 className="mt-2 text-3xl font-black text-white">Inbox de atendimento</h1>
        <p className="mt-2 text-sm text-white/60">
          Site, WhatsApp, Facebook e Instagram chegam no mesmo fluxo operacional para a equipe assumir conversas sem perder contexto.
        </p>
      </div>

      {chatwootConfigured ? (
        <div className="mb-8 rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-6 text-white/80 shadow-[0_20px_60px_rgba(16,185,129,0.12)]">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Chatwoot Community</p>
          <h2 className="mt-2 text-2xl font-black text-white">Inbox principal do widget ao vivo</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
            O atendimento ao vivo do site agora pode operar pelo Chatwoot. Esta área continua útil para o fluxo interno e para conversas já salvas no banco, enquanto o widget oficial usa o inbox configurado por ambiente.
          </p>
          {chatwootAdminUrl ? (
            <a
              href={chatwootAdminUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary mt-4 inline-flex"
            >
              Abrir inbox do Chatwoot
            </a>
          ) : (
            <p className="mt-4 text-sm text-amber-100">
              Configure <span className="font-semibold text-white">CHATWOOT_ADMIN_URL</span> para abrir o inbox do Chatwoot por aqui.
            </p>
          )}
        </div>
      ) : null}

      <AdminInbox initialThreads={initialThreads} initialThreadId={initialThreadId} />
    </section>
  );
}
