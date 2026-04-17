type LogLevel = "info" | "warn" | "error";

const SENSITIVE_KEY = /password|senha|token|secret|session|cookie|authorization|cpf|cnpj|email|phone|telefone|whatsapp|address|endereco/i;

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => sanitize(item));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[redacted]" : sanitize(item),
    ])
  );
}

export function logStructured(level: LogLevel, event: string, data: Record<string, unknown> = {}) {
  const safeData = sanitize(data) as Record<string, unknown>;
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...safeData,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.info(line);
}
