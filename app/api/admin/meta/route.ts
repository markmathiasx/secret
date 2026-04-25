import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getSandboxAdAccountInfo, listSandboxCampaigns, createSandboxCampaign } from "@/lib/meta/marketing-api";
import { metaConfig } from "@/lib/meta/config";
import { logStructured } from "@/lib/logger";
import { getSiteUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) return null;
  return user;
}

function maskId(value?: string | null) {
  if (!value) return null;
  return `***${value.slice(-4)}`;
}

/** GET /api/admin/meta — returns current Meta integration status + sandbox data */
export async function GET(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "sandbox_campaigns") {
    if (!metaConfig.enableMarketingApiSandbox) {
      return NextResponse.json({ ok: false, error: { message: "Marketing API sandbox disabled", type: "config", code: 0 } }, { status: 403 });
    }
    const result = await listSandboxCampaigns();
    return NextResponse.json(result);
  }

  if (action === "sandbox_account") {
    if (!metaConfig.enableMarketingApiSandbox) {
      return NextResponse.json({ ok: false, error: { message: "Marketing API sandbox disabled", type: "config", code: 0 } }, { status: 403 });
    }
    const result = await getSandboxAdAccountInfo();
    return NextResponse.json(result);
  }

  // Default: return integration status
  const siteUrl = getSiteUrl();
  return NextResponse.json({
    ok: true,
    status: {
      whatsapp: {
        configured: Boolean(metaConfig.phoneNumberId && metaConfig.systemUserToken),
        phoneNumberId: maskId(metaConfig.phoneNumberId),
      },
      facebook_page: {
        configured: Boolean(metaConfig.pageId && metaConfig.systemUserToken),
        pageId: maskId(metaConfig.pageId),
      },
      instagram: {
        configured: Boolean(metaConfig.igBusinessAccountId && metaConfig.systemUserToken),
        accountId: maskId(metaConfig.igBusinessAccountId),
      },
      marketing_sandbox: {
        enabled: metaConfig.enableMarketingApiSandbox && Boolean(metaConfig.sandboxAdAccountId && metaConfig.systemUserToken),
        prepared: Boolean(metaConfig.sandboxAdAccountId),
        adAccountId: maskId(metaConfig.sandboxAdAccountId),
      },
      business_login: {
        enabled: metaConfig.enableBusinessLogin && Boolean(metaConfig.appId && metaConfig.appSecret && metaConfig.businessLoginConfigId),
        configId: maskId(metaConfig.businessLoginConfigId),
      },
      webhook_urls: {
        whatsapp: `${siteUrl}/api/webhooks/whatsapp`,
        meta_messaging: `${siteUrl}/api/webhooks/meta-messaging`,
        instagram: `${siteUrl}/api/webhooks/instagram`,
      },
    },
  });
}

/** POST /api/admin/meta — admin actions (create sandbox campaign, etc.) */
export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action === "create_sandbox_campaign") {
    if (!metaConfig.enableMarketingApiSandbox) {
      return NextResponse.json({ error: "Marketing API sandbox not enabled" }, { status: 403 });
    }
    const result = await createSandboxCampaign({
      name: String(body.name ?? "MDH 3D Draft"),
      objective: body.objective ?? "OUTCOME_AWARENESS",
    });
    logStructured("info", "sandbox_campaign_created", { adminId: user.id, result: result.ok });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
