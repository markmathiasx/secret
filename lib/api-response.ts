/**
 * Centralized API response helpers.
 * Standardizes error format and adds X-Request-ID to all responses.
 */
import { NextResponse } from "next/server";

export interface ApiError {
  ok: false;
  message: string;
  code?: string;
}

export interface ApiSuccess<T = Record<string, unknown>> {
  ok: true;
  data?: T;
}

type ApiResponseInit = {
  status?: number;
  requestId?: string | null;
  headers?: Record<string, string>;
};

function withRequestId(
  response: NextResponse,
  requestId?: string | null,
): NextResponse {
  if (requestId) {
    response.headers.set("x-request-id", requestId);
    response.headers.set("x-trace-id", requestId);
  }
  return response;
}

export function apiError(
  message: string,
  status = 400,
  opts: { code?: string } & ApiResponseInit = {},
): NextResponse {
  const { requestId, headers = {}, code } = opts;
  const body: ApiError = { ok: false, message, ...(code ? { code } : {}) };
  const res = NextResponse.json(body, { status, headers });
  return withRequestId(res, requestId);
}

export function apiOk<T = Record<string, unknown>>(
  data: T,
  opts: ApiResponseInit = {},
): NextResponse {
  const { requestId, headers = {}, status = 200 } = opts;
  const res = NextResponse.json({ ok: true, ...data }, { status, headers });
  return withRequestId(res, requestId);
}

export function apiRateLimit(retryAfter = 60, requestId?: string | null): NextResponse {
  return apiError("Muitas tentativas. Aguarde antes de tentar novamente.", 429, {
    requestId,
    code: "RATE_LIMITED",
    headers: { "Retry-After": String(retryAfter) },
  });
}

export function apiUnauthorized(requestId?: string | null): NextResponse {
  return apiError("Não autorizado.", 401, { requestId, code: "UNAUTHORIZED" });
}

export function apiForbidden(requestId?: string | null): NextResponse {
  return apiError("Acesso negado.", 403, { requestId, code: "FORBIDDEN" });
}

export function apiNotFound(resource = "Recurso", requestId?: string | null): NextResponse {
  return apiError(`${resource} não encontrado.`, 404, { requestId, code: "NOT_FOUND" });
}

export function apiServerError(message = "Erro interno.", requestId?: string | null): NextResponse {
  return apiError(message, 500, { requestId, code: "INTERNAL_ERROR" });
}
