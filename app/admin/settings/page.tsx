import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

const ENV_KEYS = [
  { key: "DATABASE_URL", label: "Banco de dados (PostgreSQL)" },
  { key: "NEXTAUTH_SECRET", label: "NextAuth Secret" },
  { key: "NEXT_PUBLIC_PIX_KEY", label: "Chave Pix (pública)" },
  { key: "STAFF_NOTIFY_EMAIL", label: "E-mail de notificação" },
  { key: "SMTP_HOST", label: "SMTP Host" },
  { key: "SMTP_USER", label: "SMTP Usuário" },
  { key: "SUPABASE_URL", label: "Supabase URL" },
  { key: "MERCADO_PAGO_ACCESS_TOKEN", label: "Mercado Pago Token" },
  { key: "GOOGLE_MAPS_API_KEY", label: "Google Maps API Key" },
  { key: "ADMIN_SESSION_SECRET", label: "Admin Session Secret" },
];

export default async function AdminSettingsPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const statuses = ENV_KEYS.map((item) => ({
    ...item,
    configured: Boolean(process.env[item.key]?.trim()),
  }));

  const configured = statuses.filter((s) => s.configured).length;
  const total = statuses.length;

  return (
    <section>
      <div className="mb-6">
        <p className="section-kicker">Configurações</p>
        <h2 className="section-title">Configurações do ambiente</h2>
        <p className="section-copy">
          Visão das variáveis de ambiente configuradas. Os valores nunca são exibidos.{" "}
          <span className="text-emerald-200">{configured}/{total} configuradas.</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {statuses.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between rounded-[20px] border p-4 ${
              item.configured ? "border-emerald-300/20 bg-emerald-300/5" : "border-rose-300/20 bg-rose-300/5"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-0.5 font-mono text-xs text-white/40">{item.key}</p>
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                item.configured ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-rose-300/20 bg-rose-300/10 text-rose-200"
              }`}
            >
              {item.configured ? "✓ OK" : "Não definida"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[20px] border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        <p className="font-semibold text-white/80">Como configurar</p>
        <p className="mt-2 leading-7">
          Defina as variáveis no arquivo <code className="rounded bg-white/10 px-1 text-cyan-100">.env.local</code> (desenvolvimento) ou no painel da Vercel/Railway (produção). Reinicie o servidor após alterar.
        </p>
      </div>
    </section>
  );
}
