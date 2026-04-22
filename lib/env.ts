const PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const DEFAULT_DEV_URL = 'http://localhost:3000';

function isLocalAddress(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "0.0.0.0";
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
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getSiteUrl() {
  const candidates = PROD
    ? [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
        process.env.VERCEL_URL,
      ]
    : [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL, DEFAULT_DEV_URL];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate, { allowLocal: !PROD });
    if (normalized) return normalized;
  }

  return DEFAULT_DEV_URL;
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

/**
 * Returns true if the resolved site URL still points to a vercel.app domain.
 * Useful for startup guards that should block production with the wrong canonical.
 */
export function isSiteUrlVercelDefault(): boolean {
  const url = getSiteUrl();
  return /\.vercel\.app$/i.test(new URL(url).hostname);
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

export function getDatabaseUrl() {
  return (process.env.DATABASE_URL || "").trim();
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

export type AiAssistantProvider = "openai" | "groq" | "ollama" | "fallback";

export function getAiAssistantProvider() {
  const forced = (process.env.AI_PROVIDER || "").trim().toLowerCase();

  if (forced === "openai") return isOpenAiConfigured() ? "openai" : "fallback";
  if (forced === "groq") return isGroqConfigured() ? "groq" : "fallback";
  if (forced === "ollama") return "ollama";

  if (isGroqConfigured()) return "groq";
  if (isOpenAiConfigured()) return "openai";
  return "fallback";
}

export function getAiAssistantProviderLabel(provider: AiAssistantProvider = getAiAssistantProvider()) {
  switch (provider) {
    case "groq":
      return "Groq";
    case "ollama":
      return "Ollama local";
    case "openai":
      return "OpenAI";
    default:
      return "Modo guiado";
  }
}

export function getAiAssistantModel() {
  switch (getAiAssistantProvider()) {
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
