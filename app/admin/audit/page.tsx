import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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

export default async function AdminAuditPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const hasDatabase = await canConnectToDatabase();
  const events = hasDatabase
    ? await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 80,
        include: { actor: { select: { email: true, name: true } } },
      })
    : [];

  return (
    <IndustrialShell>
      <IndustrialHeader
        eyebrow="Seguranca"
        title="Auditoria"
        description="Eventos sensíveis com IP e user-agent gravados em hash para reduzir exposição de dados pessoais."
      />

      <IndustrialSection className="mt-8">
        {!hasDatabase ? (
          <IndustrialError message="Persistência de produção não configurada. Configure o banco para registrar auditoria real." />
        ) : events.length === 0 ? (
          <IndustrialEmptyState title="Sem eventos" description="Nenhum evento de auditoria foi gravado no banco." />
        ) : (
          <div className="grid gap-3">
            {events.map((event) => (
              <IndustrialCard key={event.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-100" />
                      <h2 className="font-black text-white">{event.action}</h2>
                    </div>
                    <p className="industrial-muted mt-2 text-sm">
                      {event.actor?.email || "Sistema"} · {event.createdAt.toLocaleString("pt-BR")}
                    </p>
                    <p className="mt-2 text-xs text-white/42">{event.targetType || "sem alvo"} {event.targetId ? `· ${event.targetId}` : ""}</p>
                  </div>
                  <IndustrialBadge tone={event.actorUserId ? "cyan" : "slate"}>{event.actorUserId ? "usuario" : "sistema"}</IndustrialBadge>
                </div>
              </IndustrialCard>
            ))}
          </div>
        )}
      </IndustrialSection>
    </IndustrialShell>
  );
}
