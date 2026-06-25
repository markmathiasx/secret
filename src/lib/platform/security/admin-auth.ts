import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";
import { applyNoStoreHeaders } from "@/lib/http-cache";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : "";
}

export function getRequestSecret(request: Request, headerName = "x-admin-secret") {
  const url = new URL(request.url);
  return request.headers.get(headerName)?.trim() || getBearerToken(request) || url.searchParams.get("token")?.trim() || "";
}

export async function requireAdminPlatformAuth(request: Request) {
  const user = await getServerSessionUser();
  if (isAdminSession(user)) return null;

  const expected = (process.env.ADMIN_SECRET || "").trim();
  if (!expected) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "admin_secret_not_configured" }, { status: 503 }),
      { varyCookie: true }
    );
  }

  const supplied = getRequestSecret(request);
  if (!supplied || !safeCompare(supplied, expected)) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }), {
      varyCookie: true,
    });
  }

  return null;
}
