import { redirect } from "next/navigation";
import { AdminInbox } from "@/components/admin/admin-inbox";
import { prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ thread?: string | string[] }>;
};

export default async function AdminInboxPage({ searchParams }: Props) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    redirect("/admin/login");
  }

  const query = (await Promise.resolve(searchParams ?? {})) as { thread?: string | string[] };
  const initialThreadId = Array.isArray(query.thread) ? query.thread[0] : query.thread || null;
  const [threads] = await Promise.all([
    prisma.chatThread.findMany({
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      take: 50,
      include: {
        buyer: true,
        seller: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
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
    isWhatsApp: Boolean(
      thread.buyer?.email?.endsWith("@mdh.local") &&
        (thread.buyer.email.startsWith("wa-") ||
          ((thread.buyer as { phone?: string | null }).phone?.replace(/\D/g, "").length ?? 0) >= 11)
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
          Site e WhatsApp chegam no mesmo fluxo operacional para a equipe assumir conversas sem perder contexto.
        </p>
      </div>

      <AdminInbox initialThreads={initialThreads} initialThreadId={initialThreadId} />
    </section>
  );
}
