/** Shared policy for server-side signing secrets; never exposes secret values. */
const placeholderMarkers = [
  "troque-o-session-secret", "mdh_troque_este_token_no_env", "gere_uma_chave_aleatoria",
  "cole_o_hash_gerado_aqui", "placeholder", "change-me", "changeme", "your_secret",
  "your-secret", "example", "fallback-secret", "default-secret",
];

export function isProductionSecretEnvironment() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

export function isSigningSecretValid(value: string | null | undefined, production = isProductionSecretEnvironment()): boolean {
  const normalized = value?.trim() || "";
  if (new TextEncoder().encode(normalized).byteLength < 32) return false;
  const lower = normalized.toLowerCase();
  if (placeholderMarkers.some((marker) => lower.includes(marker))) return false;
  if (production && lower.startsWith("mdh_dev_")) return false;
  return true;
}

export function selectSigningSecret(candidates: (string | null | undefined)[], production = isProductionSecretEnvironment()): string | null {
  for (const candidate of candidates) {
    if (isSigningSecretValid(candidate, production)) return candidate!.trim();
  }
  return null;
}

export function requireSigningSecret(candidates: (string | null | undefined)[]): string {
  const secret = selectSigningSecret(candidates);
  if (!secret) throw new Error("Server signing secret is missing or invalid.");
  return secret;
}
