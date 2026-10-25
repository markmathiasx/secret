import { createHash, randomBytes, randomUUID } from "node:crypto";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const DEFAULT_LOG_SALT = randomBytes(32).toString("hex");

export class HttpTimeoutError extends Error {
  constructor(code = "request_timeout") {
    super(code);
    this.code = code;
    this.status = 504;
  }
}

export function normalizeErrorCode(value) {
  const code = typeof value === "string" ? value.toLowerCase() : "internal";
  return /^[a-z0-9_]{1,80}$/.test(code) ? code : "internal";
}

export function redactIdentifier(value, salt = DEFAULT_LOG_SALT) {
  if (value === undefined || value === null || value === "") return null;
  return createHash("sha256")
    .update(String(salt))
    .update("\0")
    .update(String(value))
    .digest("hex")
    .slice(0, 20);
}

export function logForensic(logger, level, event, details = {}) {
  const writer = logger?.[level];
  if (typeof writer !== "function") return;
  const safe = { event };
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === null) continue;
    if (["requestId", "method", "path", "status", "durationMs", "code", "scope", "outcome", "subjectHash", "ipHash"].includes(key)) {
      safe[key] = value;
    }
  }
  try {
    writer.call(logger, safe);
  } catch {}
}

export function forensicPath(req) {
  if (typeof req.route?.path === "string") return `${req.baseUrl || ""}${req.route.path}`;
  return String(req.path || "/")
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ":id")
    .replace(/\/\d{4,}(?=\/|$)/g, "/:id");
}

export function requestAudit({ logger, logSalt = DEFAULT_LOG_SALT } = {}) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    req.requestId = randomUUID();
    req.logSalt = logSalt;
    res.setHeader("X-Request-Id", req.requestId);
    res.once("finish", () => {
      const durationMs = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
      logForensic(logger, "info", "request_complete", {
        requestId: req.requestId,
        method: req.method,
        path: forensicPath(req),
        status: res.statusCode,
        durationMs,
        ipHash: redactIdentifier(req.ip, logSalt),
        subjectHash: redactIdentifier(req.user?.id, logSalt),
      });
    });
    next();
  };
}

export function createRouteLimiter({ name, windowMs, limit, logger, userAware = false }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: userAware
      ? (req) => req.user?.id ? `user:${req.user.id}` : `ip:${ipKeyGenerator(req.ip)}`
      : (req) => `ip:${ipKeyGenerator(req.ip)}`,
    handler: (req, res) => {
      logForensic(logger, "warn", "rate_limited", {
        requestId: req.requestId,
        method: req.method,
        path: forensicPath(req),
        status: 429,
        scope: name,
        ipHash: redactIdentifier(req.ip, req.logSalt),
        subjectHash: redactIdentifier(req.user?.id, req.logSalt),
      });
      res.status(429).json({ error: "rate_limited" });
    },
  });
}

export function rejectInvalidJson(req, res, maxBytes) {
  if (!req.is("application/json")) {
    res.status(415).json({ error: "json_required" });
    return true;
  }
  if (Number(req.bodyBytes || 0) > maxBytes) {
    res.status(413).json({ error: "body_too_large" });
    return true;
  }
  return false;
}

export function requireJson(maxBytes) {
  return (req, res, next) => {
    if (!rejectInvalidJson(req, res, maxBytes)) next();
  };
}

export function captureBodyBytes(req, _res, buffer) {
  req.bodyBytes = buffer.length;
}

export async function withTimeout(operation, timeoutMs, code = "upstream_timeout") {
  let timeout;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new HttpTimeoutError(code)), timeoutMs);
        timeout.unref?.();
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

export function hardenHttpServer(server, {
  requestTimeoutMs = 20_000,
  headersTimeoutMs = 10_000,
  keepAliveTimeoutMs = 5_000,
  maxRequestsPerSocket = 100,
} = {}) {
  server.requestTimeout = requestTimeoutMs;
  server.headersTimeout = Math.min(headersTimeoutMs, requestTimeoutMs);
  server.keepAliveTimeout = keepAliveTimeoutMs;
  server.maxRequestsPerSocket = maxRequestsPerSocket;
  return server;
}
