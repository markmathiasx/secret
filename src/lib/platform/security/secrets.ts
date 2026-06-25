const SECRET_VALUE = /(sk-[a-z0-9_-]{20,}|sk-proj-[a-z0-9_-]{20,}|gh[pousr]_[a-z0-9_]{20,}|AKIA[0-9A-Z]{16}|APP_USR-[a-z0-9_-]{20,})/gi;
const SECRET_NAME = /SECRET|TOKEN|PASSWORD|PRIVATE|ACCESS_KEY|SERVICE_ROLE|WEBHOOK|API_KEY/i;

export function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(SECRET_VALUE, "[redacted-secret]");
  }

  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SECRET_NAME.test(key) ? "[redacted-secret]" : redactSecrets(item),
    ])
  );
}

export function isPublicSecretName(name: string) {
  return /^NEXT_PUBLIC_/i.test(name) && SECRET_NAME.test(name);
}

export function inspectPublicSecretEnv(env: NodeJS.ProcessEnv = process.env) {
  return Object.keys(env).filter(isPublicSecretName).sort();
}

export function maskUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.username) url.username = "***";
    if (url.password) url.password = "***";
    return url.toString();
  } catch {
    return "[invalid-url]";
  }
}
