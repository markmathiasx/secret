import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getRequestSecret } from "@/src/lib/platform/security/admin-auth";

export function requireCronAuth(request: Request) {
  const expected = (process.env.CRON_SECRET || "").trim();
  if (!expected) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "cron_secret_not_configured" }, { status: 503 }));
  }

  if (getRequestSecret(request, "x-cron-secret") !== expected) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }));
  }

  return null;
}
