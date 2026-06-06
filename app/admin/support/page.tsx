import { redirect } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { canConnectToDatabase, prisma } from "@/lib/prisma";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { IndustrialBadge } from "@/components/ui/IndustrialBadge";
import { IndustrialCard } from "@/components/ui/IndustrialCard";
import { IndustrialEmptyState } from "@/components/ui/IndustrialEmptyState";
import { IndustrialError } from "@/components/ui/IndustrialError";
import { IndustrialHeader } from "@/components/ui/IndustrialHeader";
import { IndustrialShell } from "@/components/ui/IndustrialShell";
import { IndustrialSection } from "@/components/ui/IndustrialSection";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const hasDatabase = await canConnectToDatabase();
  const conversations = hasDatabase
    ? await prisma.supportConversation.findMany({
        orderBy: { updatedAt: "desc" },
        take: 60,
        include: {
          user: { select: { email: true, name: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      })
    : [];

  return (
    <IndustrialShell>
      <IndustrialHeader
        eyebrow="Atendimento"
        title="Suporte vendedor"
        description="Conversas persistidas pelo bot vendedor e pelo atendimento humano."
      />

      <IndustrialSection className="mt-8">
        {!hasDatabase ? (
          <IndustrialError message="Persistência de produção não configurada. O suporte persistente exige banco ativo." />
        ) : conversations.length === 0 ? (
          <IndustrialEmptyState title="Sem conversas" description="Nenhuma conversa persistida em SupportConversation." />
        ) : (
          <div className="industrial-grid">
            {conversations.map((conversation) => (
              <IndustrialCard key={conversation.id}>
                <div className="flex items-start justify-between gap-3">
                  <MessageSquareText className="mt-1 h-5 w-5 text-cyan-100" />
                  <IndustrialBadge tone={conversation.status === "open" ? "cyan" : "slate"}>{conversation.status}</IndustrialBadge>
                </div>
                <h2 className="mt-4 font-black text-white">{conversation.user?.email || conversation.sessionId}</h2>
                <p className="industrial-muted mt-2 text-sm">{conversation.summary || conversation.messages[0]?.content || "Sem resumo registrado."}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/42">{conversation.updatedAt.toLocaleString("pt-BR")}</p>
              </IndustrialCard>
            ))}
          </div>
        )}
      </IndustrialSection>
    </IndustrialShell>
  );
}
