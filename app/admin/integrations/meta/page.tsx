import { redirect } from "next/navigation";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { buildBusinessLoginUrl } from "@/lib/meta/business-login";
import { getSiteUrl } from "@/lib/env";
import MetaIntegrationsPageClient from "./meta-client";

export const dynamic = "force-dynamic";

export default async function MetaIntegrationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const params = (await Promise.resolve(searchParams ?? {})) as {
    success?: string;
    error?: string;
    fb_name?: string;
  };

  const redirectUri = new URL("/api/auth/business-login/callback", getSiteUrl()).toString();
  const businessLoginUrl = buildBusinessLoginUrl(redirectUri);

  return (
    <section>
      <div className="mb-8">
        <p className="section-kicker">Meta Platform</p>
        <h2 className="section-title">Integrações Meta</h2>
        <p className="section-copy">
          Status da integração com WhatsApp Business, Facebook Pages, Instagram e Marketing API.
        </p>
      </div>
      <MetaIntegrationsPageClient
        businessLoginUrl={businessLoginUrl}
        searchParams={params}
      />
    </section>
  );
}
