/**
 * CSRF protection utility.
 * Generates and validates CSRF tokens stored in httpOnly cookies.
 * Use for state-changing form submissions in Server Actions and API routes.
 */
import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";

const CSRF_COOKIE = "__csrf";
const CSRF_HEADER = "x-csrf-token";
const MAX_AGE = 4 * 60 * 60; // 4 hours

function sign(token: string): string {
  const secret = process.env.AUTH_SECRET ?? "csrf-default-secret";
  return createHmac("sha256", secret).update(token).digest("hex");
}

/** Generate a new CSRF token and set it as a cookie. Returns the token. */
export async function setCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, sign(token), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
  return token;
}

/** Validate a CSRF token from a request header against the cookie. */
export async function validateCsrfToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const cookieStore = await cookies();
  const stored = cookieStore.get(CSRF_COOKIE)?.value;
  if (!stored) return false;
  const expected = sign(token);
  // Constant-time comparison
  if (expected.length !== stored.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Middleware helper: reads x-csrf-token header and validates.
 * Returns 403 Response if invalid.
 */
export async function requireCsrf(request: Request): Promise<Response | null> {
  const token = request.headers.get(CSRF_HEADER);
  const valid = await validateCsrfToken(token);
  if (!valid) {
    return Response.json({ ok: false, message: "Token CSRF inválido." }, { status: 403 });
  }
  return null;
}
