import "server-only";
import { metaConfig, META_GRAPH_VERSION } from "./config";
import type { BusinessLoginToken, BusinessLoginUserProfile, GraphApiResponse } from "./types";

const GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Exchange the authorization code (from Business Login callback) for an access token.
 * This is the server-side step after the user completes the FB Business Login flow.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<GraphApiResponse<BusinessLoginToken>> {
  const params = new URLSearchParams({
    client_id: metaConfig.appId,
    client_secret: metaConfig.appSecret,
    redirect_uri: redirectUri,
    code,
  });

  try {
    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error, rawStatus: res.status };
    return { ok: true, data: json as BusinessLoginToken };
  } catch (err) {
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : "network_error", type: "network", code: 0 },
    };
  }
}

/** Fetch the authenticated user's profile using their access token. */
export async function getBusinessLoginProfile(
  accessToken: string
): Promise<GraphApiResponse<BusinessLoginUserProfile>> {
  try {
    const res = await fetch(
      `${GRAPH_BASE}/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`
    );
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error, rawStatus: res.status };
    return { ok: true, data: json as BusinessLoginUserProfile };
  } catch (err) {
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : "network_error", type: "network", code: 0 },
    };
  }
}

/**
 * Build the Facebook Business Login URL.
 * Redirect the admin user to this URL to initiate the OAuth flow.
 */
export function buildBusinessLoginUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: metaConfig.appId,
    redirect_uri: redirectUri,
    config_id: metaConfig.businessLoginConfigId,
    response_type: "code",
    ...(state ? { state } : {}),
  });
  return `https://www.facebook.com/dialog/oauth?${params.toString()}`;
}
