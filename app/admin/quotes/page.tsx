import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
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

export default async function AdminQuotesPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const hasDatabase = await canConnectToDatabase();
  const quotes = hasDatabase
    ? await prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 40,
        include: { referenceFile: true, buyer: { select: { email: true, name: true } } },
      })
    : [];

  return (
    <IndustrialShell>
      <IndustrialHeader
        eyebrow="Operacao comercial"
        title="Orçamentos"
        description="Fila protegida de pedidos sob medida, anexos e origem do atendimento."
      />

      <IndustrialSection className="mt-8">
        {!hasDatabase ? (
          <IndustrialError message="Persistência de produção não configurada. Configure DATABASE_URL/DIRECT_URL e aplique as migrations antes de operar orçamentos reais." />
        ) : quotes.length === 0 ? (
          <IndustrialEmptyState title="Sem orçamentos" description="Nenhum orçamento foi registrado no banco." />
        ) : (
          <div className="industrial-grid">
            {quotes.map((quote) => (
              <IndustrialCard key={quote.id}>
                <div className="flex items-start justify-between gap-3">
                  <FileText className="mt-1 h-5 w-5 text-cyan-100" />
                  <IndustrialBadge tone={quote.status === "recebido" ? "cyan" : "emerald"}>{quote.status}</IndustrialBadge>
                </div>
                <h2 className="mt-4 text-lg font-black text-white">{quote.quoteCode || quote.id}</h2>
                <p className="industrial-muted mt-2 text-sm">{quote.customerName || quote.buyer?.name || quote.buyer?.email || "Cliente sem nome"}</p>
                <p className="industrial-muted mt-3 text-sm">{quote.projectDescription || "Sem descrição pública registrada."}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-white/42">{quote.createdAt.toLocaleString("pt-BR")}</p>
                {quote.referenceFile ? <p className="mt-3 text-xs text-cyan-100">Arquivo: {quote.referenceFile.mimeType}</p> : null}
              </IndustrialCard>
            ))}
          </div>
        )}
      </IndustrialSection>
    </IndustrialShell>
  );
}
