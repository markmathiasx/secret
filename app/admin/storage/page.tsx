import { redirect } from "next/navigation";
import { HardDrive } from "lucide-react";
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

export default async function AdminStoragePage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const hasDatabase = await canConnectToDatabase();
  const files = hasDatabase
    ? await prisma.fileAsset.findMany({
        orderBy: { createdAt: "desc" },
        take: 60,
        include: { owner: { select: { email: true, name: true } } },
      })
    : [];

  const totalBytes = files.reduce((sum, file) => sum + file.sizeBytes, 0);

  return (
    <IndustrialShell>
      <IndustrialHeader
        eyebrow="Storage privado"
        title="Arquivos"
        description="Metadados de uploads privados e públicos com checksum, owner e propósito operacional."
      />

      <div className="industrial-grid mt-8">
        <IndustrialCard>
          <p className="industrial-eyebrow">Objetos</p>
          <p className="mt-3 text-3xl font-black text-white">{files.length}</p>
        </IndustrialCard>
        <IndustrialCard>
          <p className="industrial-eyebrow">Bytes listados</p>
          <p className="mt-3 text-3xl font-black text-white">{totalBytes.toLocaleString("pt-BR")}</p>
        </IndustrialCard>
      </div>

      <IndustrialSection className="mt-6">
        {!hasDatabase ? (
          <IndustrialError message="Persistência de produção não configurada. Sem banco, o painel não exibe arquivos reais." />
        ) : files.length === 0 ? (
          <IndustrialEmptyState title="Nenhum arquivo" description="A tabela FileAsset ainda não possui registros." />
        ) : (
          <div className="grid gap-3">
            {files.map((file) => (
              <IndustrialCard key={file.id}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <HardDrive className="h-5 w-5 text-cyan-100" />
                      <h2 className="font-black text-white">{file.path}</h2>
                    </div>
                    <p className="industrial-muted mt-2 text-sm">{file.owner?.email || "Sem owner"} · {file.mimeType} · {file.sizeBytes.toLocaleString("pt-BR")} bytes</p>
                    <p className="mt-2 break-all text-xs text-white/42">sha256:{file.checksum}</p>
                  </div>
                  <IndustrialBadge tone={file.publicUrl ? "emerald" : "slate"}>{file.purpose}</IndustrialBadge>
                </div>
              </IndustrialCard>
            ))}
          </div>
        )}
      </IndustrialSection>
    </IndustrialShell>
  );
}
