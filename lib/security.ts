type RateWindow = { count: number; expiresAt: number };
const hits = new Map<string, RateWindow>();

export function checkRateLimit(key: string, limit = 15, windowMs = 60_000) {
  const now = Date.now();
  const current = hits.get(key);
  if (!current || current.expiresAt < now) {
    hits.set(key, { count: 1, expiresAt: now + windowMs });
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }
  current.count += 1;
  hits.set(key, current);
  return { ok: true, remaining: Math.max(0, limit - current.count), retryAfter: 0 };
}

export function getClientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const MODEL_EXTENSIONS = new Set(["stl", "obj", "3mf", "step", "stp", "iges", "igs"]);
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODEL_MIME_TYPES = new Set([
  "",
  "application/octet-stream",
  "model/stl",
  "model/obj",
  "model/3mf",
  "application/vnd.ms-package.3dmanufacturing-3dmodel+xml",
  "application/zip",
  "text/plain",
]);

export function sanitizeUploadFileName(name: string) {
  const fallback = "arquivo";
  const clean = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return clean || fallback;
}

function getExtension(name: string) {
  const clean = sanitizeUploadFileName(name).toLowerCase();
  const parts = clean.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function includesAscii(bytes: Uint8Array, expected: string, offset = 0) {
  const sample = new TextDecoder("ascii", { fatal: false }).decode(bytes.slice(offset, offset + expected.length));
  return sample === expected;
}

async function readFileHeader(file: File, bytes = 32) {
  const buffer = await file.slice(0, bytes).arrayBuffer();
  return new Uint8Array(buffer);
}

function isAllowedImageSignature(extension: string, header: Uint8Array) {
  if (extension === "png") return startsWith(header, [0x89, 0x50, 0x4e, 0x47]);
  if (extension === "jpg" || extension === "jpeg") return startsWith(header, [0xff, 0xd8, 0xff]);
  if (extension === "webp") return includesAscii(header, "RIFF", 0) && includesAscii(header, "WEBP", 8);
  return false;
}

function isAllowedModelSignature(extension: string, header: Uint8Array) {
  const text = new TextDecoder("ascii", { fatal: false }).decode(header).trimStart().toLowerCase();

  if (extension === "3mf") return startsWith(header, [0x50, 0x4b, 0x03, 0x04]);
  if (extension === "stl") return startsWith(header, [0x73, 0x6f, 0x6c, 0x69, 0x64]) || header.length >= 32;
  if (extension === "obj") return text.startsWith("#") || text.startsWith("o ") || text.startsWith("v ") || text.startsWith("mtllib");
  if (extension === "step" || extension === "stp") return text.includes("iso-10303") || text.includes("header");
  if (extension === "iges" || extension === "igs") return text.includes("s") || text.includes("iges");
  return false;
}

export async function validateUploadFile(
  file: File,
  profile: "image" | "model",
  options: { maxBytes: number }
) {
  const safeName = sanitizeUploadFileName(file.name);
  const extension = getExtension(safeName);
  const allowedExtensions = profile === "image" ? IMAGE_EXTENSIONS : MODEL_EXTENSIONS;
  const allowedMimeTypes = profile === "image" ? IMAGE_MIME_TYPES : MODEL_MIME_TYPES;

  if (!allowedExtensions.has(extension)) {
    return { ok: false as const, safeName, reason: "extension", message: "Tipo de arquivo não suportado." };
  }

  if (file.size <= 0 || file.size > options.maxBytes) {
    return { ok: false as const, safeName, reason: "size", message: "Arquivo fora do limite permitido." };
  }

  if (!allowedMimeTypes.has(file.type)) {
    return { ok: false as const, safeName, reason: "mime", message: "Tipo informado pelo navegador não confere com o permitido." };
  }

  const header = await readFileHeader(file);
  const signatureOk =
    profile === "image"
      ? isAllowedImageSignature(extension, header)
      : isAllowedModelSignature(extension, header);

  if (!signatureOk) {
    return { ok: false as const, safeName, reason: "signature", message: "A assinatura do arquivo não parece corresponder ao tipo enviado." };
  }

  return {
    ok: true as const,
    safeName,
    extension,
    size: file.size,
    contentType: file.type || "application/octet-stream",
  };
}
