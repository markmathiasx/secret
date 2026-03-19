const PROD = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const DEFAULT_PROD_URL = 'https://mdh-3d-store.vercel.app';
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
        process.env.VERCEL_PROJECT_PRODUCTION_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_URL,
        DEFAULT_PROD_URL,
      ]
    : [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL, DEFAULT_DEV_URL];

  for (const candidate of candidates) {
    const normalized = normalizeUrl(candidate, { allowLocal: !PROD });
    if (normalized) return normalized;
  }

  return PROD ? DEFAULT_PROD_URL : DEFAULT_DEV_URL;
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
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());
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
