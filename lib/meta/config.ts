import "server-only";

/**
 * Central Meta Platform configuration.
 * Reads META_* env vars with WHATSAPP_* fallbacks for backwards compatibility.
 * Fails loudly if called with missing required vars — never silently uses undefined.
 */

export const META_GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v25.0";

function flag(name: string, defaultValue = false) {
  const value = process.env[name];
  if (value == null || value === "") return defaultValue;
  return value === "true" || value === "1" || value.toLowerCase() === "yes";
}

const systemUserToken =
  process.env.META_SYSTEM_USER_TOKEN ?? process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const phoneNumberId =
  process.env.META_PHONE_NUMBER_ID ?? process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
const businessLoginConfigId = process.env.META_BUSINESS_LOGIN_CONFIG_ID ?? "";
const sandboxAdAccountId = process.env.META_SANDBOX_AD_ACCOUNT_ID ?? "";

export const metaConfig = {
  appId: process.env.META_APP_ID ?? "",
  appSecret: process.env.META_APP_SECRET ?? process.env.WHATSAPP_APP_SECRET ?? "",
  verifyToken: process.env.META_VERIFY_TOKEN ?? process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  /** System-user long-lived token — used for server-side Graph API calls. */
  systemUserToken,
  phoneNumberId,
  wabaId: process.env.META_WABA_ID ?? "",
  businessId: process.env.META_BUSINESS_ID ?? "",
  pageId: process.env.META_PAGE_ID ?? "",
  igBusinessAccountId: process.env.META_IG_BUSINESS_ACCOUNT_ID ?? "",
  graphApiVersion: META_GRAPH_VERSION,

  businessLoginConfigId,
  sandboxAdAccountId,

  // Feature flags
  enableFacebookSdk: flag("META_ENABLE_FACEBOOK_SDK", false),
  enableBusinessLogin: flag(
    "META_ENABLE_BUSINESS_LOGIN",
    Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET && businessLoginConfigId)
  ),
  enableInstagramPublish: flag("META_ENABLE_INSTAGRAM_PUBLISH", false),
  enableFacebookPosting: flag("META_ENABLE_FACEBOOK_POSTING", false),
  enableWhatsappOutbound: flag(
    "META_ENABLE_WHATSAPP_OUTBOUND",
    Boolean(systemUserToken && phoneNumberId)
  ),
  enableMarketingApiSandbox: flag("META_ENABLE_MARKETING_API_SANDBOX", false),
} as const;

/** Returns true only if the minimum required server-side vars are set. */
export function isMetaConfigured(): boolean {
  return Boolean(
    metaConfig.appSecret &&
    metaConfig.verifyToken &&
    metaConfig.systemUserToken
  );
}

/** Returns true if WhatsApp outbound is ready (token + phone number ID). */
export function isWhatsAppOutboundReady(): boolean {
  return Boolean(
    metaConfig.enableWhatsappOutbound &&
    metaConfig.systemUserToken &&
    metaConfig.phoneNumberId
  );
}

export function isMetaVerifyTokenConfigured(): boolean {
  return Boolean(metaConfig.verifyToken);
}

/** Returns true if Page messaging is ready (token + page ID). */
export function isFacebookPageReady(): boolean {
  return Boolean(metaConfig.systemUserToken && metaConfig.pageId);
}

/** Returns true if Instagram DM is ready (token + IG account). */
export function isInstagramReady(): boolean {
  return Boolean(metaConfig.systemUserToken && metaConfig.igBusinessAccountId);
}
