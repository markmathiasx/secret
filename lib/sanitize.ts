function coerceString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stripHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function stripControlChars(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function sanitizeHtml(input: unknown, maxLength = 10_000) {
  return stripControlChars(coerceString(input).slice(0, maxLength)).trim();
}

export function sanitizePlainText(input: unknown, maxLength = 500) {
  return stripControlChars(stripHtml(coerceString(input).slice(0, maxLength)))
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(input: unknown, maxLength = 5000) {
  return stripControlChars(stripHtml(coerceString(input).slice(0, maxLength)))
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function sanitizeEmail(input: unknown) {
  return sanitizePlainText(input, 320).replace(/\s/g, "").toLowerCase();
}

export function sanitizeMetadataRecord(
  input: Record<string, unknown>,
  limits: { keyLength?: number; valueLength?: number } = {},
) {
  const keyLength = limits.keyLength ?? 80;
  const valueLength = limits.valueLength ?? 500;

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      sanitizePlainText(key, keyLength),
      typeof value === "string" ? sanitizePlainText(value, valueLength) : value,
    ]).filter(([key]) => Boolean(key)),
  );
}
