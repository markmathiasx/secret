const SENSITIVE_KEY = /authorization|cookie|cpf|cnpj|email|password|phone|secret|senha|session|token|whatsapp/i;

export function sanitizeText(value: unknown, maxLength = 2000) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeForLog(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return sanitizeText(value, 500);
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => sanitizeForLog(item));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? "[redacted]" : sanitizeForLog(item),
    ])
  );
}

export function sanitizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: sanitizeText(error.message, 240),
    };
  }

  return {
    name: "UnknownError",
    message: sanitizeText(error, 240) || "unknown_error",
  };
}
