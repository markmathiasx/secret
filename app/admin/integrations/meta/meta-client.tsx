"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2, ExternalLink, RefreshCw } from "lucide-react";

interface MetaStatus {
  whatsapp: { configured: boolean; phoneNumberId: string | null };
  facebook_page: { configured: boolean; pageId: string | null };
  instagram: { configured: boolean; accountId: string | null };
  marketing_sandbox: { enabled: boolean; prepared?: boolean; adAccountId: string | null };
  business_login: { enabled: boolean; configId: string | null };
  webhook_urls: { whatsapp: string; meta_messaging: string; instagram: string };
}

function StatusBadge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs text-emerald-400">
      <CheckCircle className="h-3.5 w-3.5" /> Configurado
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-amber-400">
      <XCircle className="h-3.5 w-3.5" /> Pendente
    </span>
  );
}

function WebhookRow({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
      <span className="text-sm text-white/70">{label}</span>
      <code className="text-xs text-cyan-300 font-mono">{path}</code>
    </div>
  );
}

export default function MetaIntegrationsPageClient({
  businessLoginUrl,
  searchParams,
}: {
  businessLoginUrl: string;
  searchParams: { success?: string; error?: string; fb_name?: string };
}) {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/meta");
      const data = await res.json();
      if (data.status) setStatus(data.status);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="space-y-6">
      {/* OAuth result banner */}
      {searchParams.success && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 px-5 py-4 text-sm text-emerald-300">
          <CheckCircle className="inline h-4 w-4 mr-2" />
          Business Login concluído{searchParams.fb_name ? ` como ${searchParams.fb_name}` : ""}.
        </div>
      )}
      {searchParams.error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/8 px-5 py-4 text-sm text-rose-300">
          <XCircle className="inline h-4 w-4 mr-2" />
          Erro no Business Login: <code className="font-mono">{searchParams.error}</code>
        </div>
      )}

      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { key: "whatsapp", label: "WhatsApp Business", detail: status?.whatsapp.phoneNumberId },
          { key: "facebook_page", label: "Facebook Page", detail: status?.facebook_page.pageId },
          { key: "instagram", label: "Instagram DM", detail: status?.instagram.accountId },
        ].map(({ key, label, detail }) => (
          <div key={key} className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{label}</p>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white/30" />
              ) : (
                <StatusBadge ok={(status as any)?.[key]?.configured ?? false} />
              )}
            </div>
            {detail && <p className="mt-1 text-xs text-white/40 font-mono">{detail}</p>}
          </div>
        ))}

        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Marketing API Sandbox</p>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white/30" />
            ) : (
              <StatusBadge ok={status?.marketing_sandbox.enabled ?? false} />
            )}
          </div>
          {status?.marketing_sandbox.adAccountId && (
            <p className="mt-1 text-xs text-white/40 font-mono">
              act_{status.marketing_sandbox.adAccountId}
            </p>
          )}
        </div>
      </div>

      {/* Business Login */}
      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-6">
        <h2 className="text-base font-bold text-white">Facebook Business Login</h2>
        <p className="mt-1 text-sm text-white/60">
          Conecte ativos de negócios Meta (páginas, contas de anúncio, WABA) via fluxo OAuth.
          Config ID: <code className="font-mono text-cyan-300">{status?.business_login.configId}</code>
        </p>
        <a
          href={businessLoginUrl}
          className="btn-primary mt-4 inline-flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Iniciar Business Login
        </a>
      </div>

      {/* Webhook URLs */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">URLs de Webhook Meta</h2>
          <button onClick={refresh} className="text-white/40 hover:text-white/70 transition">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-white/50">
          Registre estes caminhos no painel Meta for Developers usando o mesmo <code className="font-mono">META_VERIFY_TOKEN</code>.
        </p>
        {status?.webhook_urls && (
          <>
            <WebhookRow label="WhatsApp" path={status.webhook_urls.whatsapp} />
            <WebhookRow label="Facebook Page (Mensagens)" path={status.webhook_urls.meta_messaging} />
            <WebhookRow label="Instagram DM / Comentários" path={status.webhook_urls.instagram} />
          </>
        )}
      </div>
    </div>
  );
}
