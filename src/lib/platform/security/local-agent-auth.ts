import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getRequestSecret } from "@/src/lib/platform/security/admin-auth";

export function requireLocalAgentAuth(request: Request) {
  const expected = (process.env.LOCAL_AGENT_SHARED_SECRET || "").trim();
  if (!expected) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "local_agent_secret_not_configured" }, { status: 503 })
    );
  }

  if (getRequestSecret(request, "x-local-agent-secret") !== expected) {
    return applyNoStoreHeaders(NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 }));
  }

  return null;
}
