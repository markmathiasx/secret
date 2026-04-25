import { NextResponse } from "next/server";
import { buildBusinessLoginUrl } from "@/lib/meta/business-login";
import { metaConfig } from "@/lib/meta/config";
import { getSiteUrl } from "@/lib/env";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { logStructured } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "mdh_meta_bl_state";

export async function GET() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.redirect(new URL("/admin/login", getSiteUrl()));
  }

  const redirectBase = new URL("/admin/integrations/meta", getSiteUrl());
  if (!metaConfig.enableBusinessLogin || !metaConfig.appId || !metaConfig.appSecret || !metaConfig.businessLoginConfigId) {
    redirectBase.searchParams.set("error", "business_login_config");
    return NextResponse.redirect(redirectBase.toString());
  }

  const redirectUri = new URL("/api/auth/business-login/callback", getSiteUrl()).toString();
  const state = crypto.randomUUID();
  const response = NextResponse.redirect(buildBusinessLoginUrl(redirectUri, state));
  response.cookies.set({
    name: STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/business-login",
    maxAge: 10 * 60,
  });

  logStructured("info", "business_login_started", { adminUserId: user.id });
  return response;
}
