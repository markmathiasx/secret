import { z } from "zod";

const PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const DEFAULT_DEV_URL = 'http://localhost:3000';
const DEFAULT_PROD_URL = 'https://www.mdh3d.com.br';
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh/v1";

const PLACEHOLDER_MARKERS = [
  "your_",
  "your-",
  "change-me",
  "changeme",
  "example",
  "placeholder",
  "password",
  "username",
  "user:pass",
  "<",
  ">",
];

const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);
const optionalTrimmedString = z.preprocess(emptyToUndefined, z.string().trim().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().trim().url().optional());
const optionalBooleanString = z.preprocess(
  emptyToUndefined,
  z.enum(["true", "false"]).optional(),
);
const optionalNumberString = z.preprocess(
  emptyToUndefined,
  z.string().trim().regex(/^\d+$/).optional(),
);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  VERCEL_URL: optionalTrimmedString,
  DATABASE_URL: optionalTrimmedString,
  DIRECT_URL: optionalTrimmedString,
  AUTH_SECRET: optionalTrimmedString,
  NEXTAUTH_SECRET: optionalTrimmedString,
  AUTH_URL: optionalUrl,
  NEXTAUTH_URL: optionalUrl,
  ADMIN_EMAIL: optionalTrimmedString,
  ADMIN_PASSWORD_HASH: optionalTrimmedString,
  ADMIN_SESSION_SECRET: optionalTrimmedString,
  AUTH_CUSTOMER_SESSION_SECRET: optionalTrimmedString,
  SMTP_HOST: optionalTrimmedString,
  SMTP_PORT: optionalNumberString,
  SMTP_SECURE: optionalBooleanString,
  SMTP_USER: optionalTrimmedString,
  SMTP_PASS: optionalTrimmedString,
  EMAIL_FROM: optionalTrimmedString,
  PIX_KEY: optionalTrimmedString,
  WHATSAPP_MODE: optionalTrimmedString,
  WHATSAPP_ACCESS_TOKEN: optionalTrimmedString,
  WHATSAPP_PHONE_NUMBER_ID: optionalTrimmedString,
  WHATSAPP_APP_SECRET: optionalTrimmedString,
  WHATSAPP_VERIFY_TOKEN: optionalTrimmedString,
  WHATSAPP_TEMPLATE_NAME: optionalTrimmedString,
  WHATSAPP_OTP_TEMPLATE_NAME: optionalTrimmedString,
  WHATSAPP_OTP_TEMPLATE_LOCALE: optionalTrimmedString,
  WHATSAPP_OTP_TEMPLATE_HAS_COPY_BUTTON: optionalBooleanString,
  MERCADOPAGO_ACCESS_TOKEN: optionalTrimmedString,
  MERCADOPAGO_WEBHOOK_SECRET: optionalTrimmedString,
  MERCADOPAGO_APP_ID: optionalTrimmedString,
  NEXT_PUBLIC_MP_PUBLIC_KEY: optionalTrimmedString,
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: optionalTrimmedString,
  NEXT_PUBLIC_GA4_ID: optionalTrimmedString,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: optionalTrimmedString,
  NEXT_PUBLIC_FB_PIXEL_ID: optionalTrimmedString,
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: optionalTrimmedString,
  MP_STATEMENT_DESCRIPTOR: optionalTrimmedString,
  MP_TIMEOUT_MS: optionalNumberString,
  MELHOR_ENVIO_TOKEN: optionalTrimmedString,
  MELHOR_ENVIO_BASE_URL: optionalUrl,
  MELHOR_ENVIO_FROM_POSTAL_CODE: optionalTrimmedString,
  MELHOR_ENVIO_USER_AGENT: optionalTrimmedString,
  OPENAI_API_KEY: optionalTrimmedString,
  OPENAI_MODEL: optionalTrimmedString,
  AI_GATEWAY_API_KEY: optionalTrimmedString,
  AI_GATEWAY_MODEL: optionalTrimmedString,
  AI_PROVIDER: optionalTrimmedString,
  GROQ_API_KEY: optionalTrimmedString,
  GROQ_MODEL: optionalTrimmedString,
  OLLAMA_BASE_URL: optionalUrl,
  OLLAMA_MODEL: optionalTrimmedString,
  SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  SUPABASE_ANON_KEY: optionalTrimmedString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalTrimmedString,
  SUPABASE_PUBLISHABLE_KEY: optionalTrimmedString,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalTrimmedString,
  SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
  SUPABASE_SECRET_KEY: optionalTrimmedString,
  SUPABASE_STORAGE_BUCKET: optionalTrimmedString,
  NEXT_PUBLIC_SUPABASE_CATALOG_BUCKET_URL: optionalUrl,
  CHATWOOT_BASE_URL: optionalUrl,
  NEXT_PUBLIC_CHATWOOT_BASE_URL: optionalUrl,
  CHATWOOT_WEBSITE_TOKEN: optionalTrimmedString,
  NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN: optionalTrimmedString,
  CHATWOOT_ADMIN_URL: optionalUrl,
  NEXT_PUBLIC_CHATWOOT_ADMIN_URL: optionalUrl,
  CHATWOOT_HMAC_TOKEN: optionalTrimmedString,
  NEXT_PUBLIC_CHATWOOT_AVAILABILITY: optionalTrimmedString,
  NEXT_PUBLIC_SUPPORT_CHANNEL: optionalTrimmedString,
  SUPPORT_CHANNEL: optionalTrimmedString,
  NEXT_PUBLIC_VERCEL_PLAN: optionalTrimmedString,
  VERCEL_PLAN: optionalTrimmedString,
  META_APP_ID: optionalTrimmedString,
  META_APP_SECRET: optionalTrimmedString,
  META_VERIFY_TOKEN: optionalTrimmedString,
  META_SYSTEM_USER_TOKEN: optionalTrimmedString,
  META_BUSINESS_ID: optionalTrimmedString,
  META_GRAPH_API_VERSION: optionalTrimmedString,
  META_PAGE_ID: optionalTrimmedString,
  META_IG_BUSINESS_ACCOUNT_ID: optionalTrimmedString,
  META_WABA_ID: optionalTrimmedString,
  META_PHONE_NUMBER_ID: optionalTrimmedString,
  META_BUSINESS_LOGIN_CONFIG_ID: optionalTrimmedString,
  META_MARKETPLACE_CREATORS_CONFIG_ID: optionalTrimmedString,
  META_INSTAGRAM_INTEGRATION_CONFIG_ID: optionalTrimmedString,
  META_WHATSAPP_MEASUREMENT_PARTNER_CONFIG_ID: optionalTrimmedString,
  META_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID: optionalTrimmedString,
  META_SANDBOX_AD_ACCOUNT_ID: optionalTrimmedString,
  META_ENABLE_FACEBOOK_SDK: optionalBooleanString,
  META_ENABLE_BUSINESS_LOGIN: optionalBooleanString,
  META_ENABLE_INSTAGRAM_PUBLISH: optionalBooleanString,
  META_ENABLE_FACEBOOK_POSTING: optionalBooleanString,
  META_ENABLE_WHATSAPP_OUTBOUND: optionalBooleanString,
  META_ENABLE_MARKETING_API_SANDBOX: optionalBooleanString,
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalTrimmedString,
  REDIS_URL: optionalTrimmedString,
  R2_ACCOUNT_ID: optionalTrimmedString,
  R2_ACCESS_KEY_ID: optionalTrimmedString,
  R2_SECRET_ACCESS_KEY: optionalTrimmedString,
  R2_BUCKET: optionalTrimmedString,
  R2_ENDPOINT: optionalUrl,
  R2_PUBLIC_BASE_URL: optionalUrl,
  UPLOADS_DIR: optionalTrimmedString,
  PRODUCT_MEDIA_DIR: optionalTrimmedString,
  MODEL_UPLOADS_DIR: optionalTrimmedString,
  SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  SENTRY_ORG: optionalTrimmedString,
  SENTRY_PROJECT: optionalTrimmedString,
});

type EnvValidationResult = ReturnType<typeof envSchema.safeParse>;
let envValidationResult: EnvValidationResult | null = null;

export function validateEnv() {
  if (!envValidationResult) {
    envValidationResult = envSchema.safeParse(process.env);
  }
  return envValidationResult;
}

export function getEnvIssues() {
  const result = validateEnv();
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function isLocalAddress(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "0.0.0.0";
}

function isVercelDefaultHost(hostname: string) {
  return /\.vercel\.app$/i.test(hostname.trim().toLowerCase());
}

function normalizeUrl(value?: string | null, options?: { allowLocal?: boolean }) {
  const raw = (value || '').trim();
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    if (!options?.allowLocal && isLocalAddress(parsed.hostname)) {
      return null;
    }
    if (PROD && parsed.hostname === "mdh3d.com.br") {
      parsed.hostname = "www.mdh3d.com.br";
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const candidates = PROD
    ? [
        process.env.NEXT_PUBLIC_SITE_URL,
        DEFAULT_PROD_URL,
      ]
    : [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL, DEFAULT_DEV_URL];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate, { allowLocal: !PROD });
    if (PROD && normalized && isVercelDefaultHost(new URL(normalized).hostname)) {
      continue;
    }
    if (normalized) return normalized;
  }

  return PROD ? DEFAULT_PROD_URL : DEFAULT_DEV_URL;
}

export function getChatwootBaseUrl() {
  return normalizeUrl(
    process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || process.env.CHATWOOT_BASE_URL,
    { allowLocal: !PROD }
  );
}

export function getChatwootWebsiteToken() {
  return (
    process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN ||
    process.env.CHATWOOT_WEBSITE_TOKEN ||
    ""
  ).trim();
}

export function getChatwootAdminUrl() {
  return normalizeUrl(
    process.env.CHATWOOT_ADMIN_URL || process.env.NEXT_PUBLIC_CHATWOOT_ADMIN_URL,
    { allowLocal: !PROD }
  );
}

export function getChatwootHmacToken() {
  return (process.env.CHATWOOT_HMAC_TOKEN || "").trim();
}

export function getChatwootAvailabilityMode() {
  const mode = (process.env.NEXT_PUBLIC_CHATWOOT_AVAILABILITY || "messages").trim().toLowerCase();
  if (mode === "live") return "live";
  return "messages";
}

export function isChatwootWidgetConfigured() {
  return Boolean(getChatwootBaseUrl() && getChatwootWebsiteToken());
}

export function isChatwootLiveAvailable() {
  return isChatwootWidgetConfigured() && getChatwootAvailabilityMode() === "live";
}

export type SupportChannelMode = "chatwoot" | "native" | "whatsapp";

export function getSupportChannelMode(): SupportChannelMode {
  if (isChatwootWidgetConfigured()) {
    return "chatwoot";
  }

  const configured = (process.env.NEXT_PUBLIC_SUPPORT_CHANNEL || process.env.SUPPORT_CHANNEL || "").trim().toLowerCase();
  if (configured === "native") {
    return "native";
  }

  return "whatsapp";
}

export function isNativeSiteChatEnabled() {
  return getSupportChannelMode() === "native";
}

/**
 * Returns true if the resolved site URL still points to a vercel.app domain.
 * Useful for startup guards that should block production with the wrong canonical.
 */
export function isSiteUrlVercelDefault(): boolean {
  const url = getSiteUrl();
  return isVercelDefaultHost(new URL(url).hostname);
}

export function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
}

export function getSupabaseAnonKey() {
  return (
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).trim();
}

export function getSupabaseServiceKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim();
}

export function getSupabaseEnv() {
  return {
    url: getSupabaseUrl(),
    anon: getSupabaseAnonKey(),
    serviceRole: getSupabaseServiceKey()
  };
}

export function getSupabaseStorageBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET || "mdh-private-assets").trim();
}

export function getDatabaseUrl() {
  return (process.env.DATABASE_URL || "").trim();
}

export type DatabaseUrlStatus =
  | { ok: true; value: string }
  | { ok: false; reason: "missing" | "placeholder" | "invalid_url" | "invalid_protocol"; message: string };

export function hasPlaceholderValue(value?: string | null) {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized) return false;
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

export function getDatabaseUrlStatus(): DatabaseUrlStatus {
  const value = getDatabaseUrl();
  if (!value) {
    return {
      ok: false,
      reason: "missing",
      message: "DATABASE_URL não configurada. Configure a variável no ambiente antes de usar recursos com banco.",
    };
  }

  if (hasPlaceholderValue(value)) {
    return {
      ok: false,
      reason: "placeholder",
      message: "DATABASE_URL contém placeholder. Configure uma URL PostgreSQL real no ambiente.",
    };
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
      return {
        ok: false,
        reason: "invalid_protocol",
        message: "DATABASE_URL deve usar protocolo postgres:// ou postgresql://.",
      };
    }
  } catch {
    return {
      ok: false,
      reason: "invalid_url",
      message: "DATABASE_URL inválida. Configure uma URL PostgreSQL válida.",
    };
  }

  return { ok: true, value };
}

export function getDirectDatabaseUrl() {
  return (process.env.DIRECT_URL || "").trim();
}

export function getRedisUrl() {
  return (process.env.REDIS_URL || "redis://127.0.0.1:6379").trim();
}

export function getAuthSecret() {
  return (
    process.env.AUTH_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_CUSTOMER_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    ""
  );
}

export function getAuthBaseUrl() {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    getSiteUrl()
  );
}

export function getSmtpConfig() {
  return {
    host: (process.env.SMTP_HOST || process.env.MAILHOG_HOST || "127.0.0.1").trim(),
    port: Number(process.env.SMTP_PORT || process.env.MAILHOG_SMTP_PORT || 1025),
    secure: (process.env.SMTP_SECURE || "false").trim() === "true",
    user: (process.env.SMTP_USER || "").trim(),
    pass: (process.env.SMTP_PASS || "").trim(),
    from: (process.env.EMAIL_FROM || `MDH 3D Store <noreply@${new URL(getSiteUrl()).hostname}>`).trim(),
  };
}

export function getUploadsDir() {
  return (process.env.UPLOADS_DIR || "uploads").trim();
}

export function getProductUploadsDir() {
  return (process.env.PRODUCT_MEDIA_DIR || `${getUploadsDir()}/products`).trim();
}

export function getModelUploadsDir() {
  return (process.env.MODEL_UPLOADS_DIR || `${getUploadsDir()}/stl`).trim();
}

export function getMercadoPagoPublicKey() {
  return (
    process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ||
    ""
  ).trim();
}

export function getMercadoPagoAccessToken() {
  return (process.env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
}

export function getMercadoPagoWebhookSecret() {
  return (process.env.MERCADOPAGO_WEBHOOK_SECRET || "").trim();
}

export function getMercadoPagoAppId() {
  return (process.env.MERCADOPAGO_APP_ID || "").trim();
}

export function getMercadoPagoStatementDescriptor() {
  return (process.env.MP_STATEMENT_DESCRIPTOR || "MDH 3D").trim();
}

export function getMercadoPagoTimeoutMs() {
  const parsed = Number(process.env.MP_TIMEOUT_MS || 15_000);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15_000;
}

export function getPixKey() {
  return String(process.env.PIX_KEY || "").trim();
}

export function getMelhorEnvioConfig() {
  const production = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  return {
    token: (process.env.MELHOR_ENVIO_TOKEN || "").trim(),
    baseUrl: normalizeUrl(
      process.env.MELHOR_ENVIO_BASE_URL ||
        (production ? "https://www.melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br"),
      { allowLocal: false }
    ),
    fromPostalCode: (process.env.MELHOR_ENVIO_FROM_POSTAL_CODE || "").replace(/\D/g, "").slice(0, 8),
    userAgent: (
      process.env.MELHOR_ENVIO_USER_AGENT ||
      `MDH 3D Store (${process.env.EMAIL_FROM || "suporte@mdh3d.com.br"})`
    ).trim(),
  };
}

export function isMelhorEnvioConfigured() {
  const config = getMelhorEnvioConfig();
  return Boolean(config.token && config.baseUrl && config.fromPostalCode.length === 8);
}

export function getR2Config() {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const endpoint = normalizeUrl(
    process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : ""),
    { allowLocal: false }
  );

  return {
    endpoint,
    accessKeyId: (process.env.R2_ACCESS_KEY_ID || "").trim(),
    secretAccessKey: (process.env.R2_SECRET_ACCESS_KEY || "").trim(),
    bucket: (process.env.R2_BUCKET || "").trim(),
    publicBaseUrl: normalizeUrl(process.env.R2_PUBLIC_BASE_URL, { allowLocal: false }),
  };
}

export function isR2Configured() {
  const config = getR2Config();
  return Boolean(config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucket);
}

export function isMercadoPagoConfigured() {
  return Boolean(getMercadoPagoAccessToken());
}

export function isMercadoPagoBricksConfigured() {
  return Boolean(getMercadoPagoAccessToken() && getMercadoPagoPublicKey());
}

/**
 * Vercel plan helpers.
 *
 * NOTE: Vercel does not expose plan info directly to deployments, so
 * we rely on an explicit environment variable set in the project settings.
 *
 * Set `NEXT_PUBLIC_VERCEL_PLAN=hobby` or `NEXT_PUBLIC_VERCEL_PLAN=pro` (or similar)
 * in Vercel to let the app know which plan is used.
 */
export function getVercelPlan(): string {
  return (process.env.NEXT_PUBLIC_VERCEL_PLAN || process.env.VERCEL_PLAN || "hobby").toLowerCase();
}

export function isVercelHobbyPlan(): boolean {
  return getVercelPlan() === "hobby";
}

export function isVercelProPlan(): boolean {
  const plan = getVercelPlan();
  return plan === "pro" || plan === "team" || plan === "enterprise";
}

export function isCardCheckoutConfigured() {
  return isMercadoPagoBricksConfigured();
}

export function getOpenAiApiKey() {
  return (process.env.OPENAI_API_KEY || "").trim();
}

export function getOpenAiAssistantModel() {
  return (process.env.OPENAI_MODEL || "gpt-5.1").trim();
}

export function isOpenAiConfigured() {
  return Boolean(getOpenAiApiKey());
}

export function getAiGatewayApiKey() {
  return (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || "").trim();
}

export function getAiGatewayBaseUrl() {
  return AI_GATEWAY_BASE_URL;
}

export function getAiGatewayModel() {
  const configured = (process.env.AI_GATEWAY_MODEL || "").trim();
  if (configured) return configured;
  const openAiModel = getOpenAiAssistantModel();
  return openAiModel.includes("/") ? openAiModel : `openai/${openAiModel}`;
}

export function isAiGatewayConfigured() {
  return Boolean(getAiGatewayApiKey());
}

export function getGroqApiKey() {
  return (process.env.GROQ_API_KEY || "").trim();
}

export function getGroqAssistantModel() {
  return (process.env.GROQ_MODEL || "llama-3.1-8b-instant").trim();
}

export function isGroqConfigured() {
  return Boolean(getGroqApiKey());
}

export function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").trim().replace(/\/$/, "");
}

export function getOllamaAssistantModel() {
  return (process.env.OLLAMA_MODEL || "qwen3:4b-q4_K_M").trim();
}

export type AiAssistantProvider = "openai" | "groq" | "ollama" | "ai_gateway" | "fallback";

function normalizeAiProvider(value?: string | null): AiAssistantProvider | "" {
  const normalized = (value || "").trim().toLowerCase().replace(/-/g, "_");
  if (normalized === "gateway" || normalized === "vercel_ai_gateway") return "ai_gateway";
  if (normalized === "ai_gateway" || normalized === "openai" || normalized === "groq" || normalized === "ollama") {
    return normalized;
  }
  return "";
}

export function getAiAssistantProvider() {
  const forced = normalizeAiProvider(process.env.AI_PROVIDER);

  if (forced === "ai_gateway") return isAiGatewayConfigured() ? "ai_gateway" : "fallback";
  if (forced === "openai") return isOpenAiConfigured() ? "openai" : "fallback";
  if (forced === "groq") return isGroqConfigured() ? "groq" : "fallback";
  if (forced === "ollama") return "ollama";

  if (isAiGatewayConfigured()) return "ai_gateway";
  if (isGroqConfigured()) return "groq";
  if (isOpenAiConfigured()) return "openai";
  return "fallback";
}

export function getAiAssistantConfigurationError() {
  const forced = normalizeAiProvider(process.env.AI_PROVIDER);

  if (forced === "ai_gateway" && !isAiGatewayConfigured()) {
    return "AI_GATEWAY_API_KEY não configurada para AI_PROVIDER=ai_gateway.";
  }
  if (forced === "openai" && !isOpenAiConfigured()) {
    return "OPENAI_API_KEY não configurada para AI_PROVIDER=openai.";
  }
  if (forced === "groq" && !isGroqConfigured()) {
    return "GROQ_API_KEY não configurada para AI_PROVIDER=groq.";
  }
  return null;
}

export function getAiAssistantProviderLabel(provider: AiAssistantProvider = getAiAssistantProvider()) {
  switch (provider) {
    case "groq":
      return "Groq";
    case "ollama":
      return "Ollama local";
    case "openai":
      return "OpenAI";
    case "ai_gateway":
      return "Vercel AI Gateway";
    default:
      return "Modo guiado";
  }
}

export function getAiAssistantModel() {
  switch (getAiAssistantProvider()) {
    case "ai_gateway":
      return getAiGatewayModel();
    case "groq":
      return getGroqAssistantModel();
    case "ollama":
      return getOllamaAssistantModel();
    case "openai":
      return getOpenAiAssistantModel();
    default:
      return getGroqAssistantModel();
  }
}

export function isAiAssistantConfigured() {
  return getAiAssistantProvider() !== "fallback";
}
