import DOMPurify from "isomorphic-dompurify";

const EMPTY_HTML_CONFIG = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

function coerceString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function sanitizeHtml(input: unknown, maxLength = 10_000) {
  return DOMPurify.sanitize(coerceString(input).slice(0, maxLength), {
    USE_PROFILES: { html: true },
  }).trim();
}

export function sanitizePlainText(input: unknown, maxLength = 500) {
  return DOMPurify.sanitize(coerceString(input).slice(0, maxLength), EMPTY_HTML_CONFIG)
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeMultilineText(input: unknown, maxLength = 5000) {
  return DOMPurify.sanitize(coerceString(input).slice(0, maxLength), EMPTY_HTML_CONFIG)
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export function sanitizeEmail(input: unknown) {
  return sanitizePlainText(input, 320).toLowerCase();
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
