import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getBusinessLoginProfile } from "@/lib/meta/business-login";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { getSiteUrl } from "@/lib/env";
import { logStructured } from "@/lib/logger";
import { metaConfig } from "@/lib/meta/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "mdh_meta_bl_state";

/**
 * Facebook Business Login OAuth callback.
 * Meta redirects the admin here after they complete the Business Login flow.
 * URL: /api/auth/business-login/callback?code=…&state=…
 */
export async function GET(request: NextRequest) {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) {
    return NextResponse.redirect(new URL("/admin/login", getSiteUrl()));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const redirectBase = new URL("/admin/integrations/meta", getSiteUrl());
  const responseError = (errorCode: string) => {
    redirectBase.searchParams.set("error", errorCode);
    const response = NextResponse.redirect(redirectBase.toString());
    response.cookies.set({ name: STATE_COOKIE, value: "", path: "/api/auth/business-login", maxAge: 0 });
    return response;
  };

  if (error || !code) {
    logStructured("warn", "business_login_oauth_error", { error, errorDesc });
    return responseError(error ?? "cancelled");
  }

  const cookieState = request.cookies.get(STATE_COOKIE)?.value;
  if (!state || !cookieState || state !== cookieState) {
    logStructured("warn", "business_login_state_invalid", { hasState: !!state, hasCookieState: !!cookieState });
    return responseError("invalid_state");
  }

  if (!metaConfig.enableBusinessLogin || !metaConfig.appId || !metaConfig.appSecret || !metaConfig.businessLoginConfigId) {
    return responseError("business_login_config");
  }

  const redirectUri = new URL("/api/auth/business-login/callback", getSiteUrl()).toString();
  const tokenResult = await exchangeCodeForToken(code, redirectUri);

  if (!tokenResult.ok || !tokenResult.data) {
    logStructured("error", "business_login_token_exchange_failed", {
      error: tokenResult.error?.message,
    });
    return responseError("token_exchange");
  }

  const { access_token } = tokenResult.data;

  // Fetch profile to confirm identity
  const profileResult = await getBusinessLoginProfile(access_token);
  const fbUserId = profileResult.data?.id;
  const fbName = profileResult.data?.name;

  logStructured("info", "business_login_success", {
    adminUserId: user.id,
    fbUserId,
    fbName,
  });

  // NOTE: In production, persist the token securely (DB + encryption).
  // For now we pass the FB user name back as a success indicator in the URL.
  redirectBase.searchParams.set("success", "1");
  if (fbName) redirectBase.searchParams.set("fb_name", fbName);
  const response = NextResponse.redirect(redirectBase.toString());
  response.cookies.set({ name: STATE_COOKIE, value: "", path: "/api/auth/business-login", maxAge: 0 });
  return response;
}
