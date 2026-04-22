import { NextResponse } from "next/server";
import { createChatwootIdentifierHash } from "@/lib/chatwoot";
import { isChatwootWidgetConfigured } from "@/lib/env";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerSessionUser();

  if (!isChatwootWidgetConfigured()) {
    return applyNoStoreHeaders(
      NextResponse.json({ ok: false, error: "chatwoot_not_configured", user: null }, { status: 503 })
    );
  }

  if (!user) {
    return applyNoStoreHeaders(NextResponse.json({ ok: true, user: null }));
  }

  const identifier = user.id;

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      user: {
        identifier,
        identifierHash: createChatwootIdentifierHash(identifier),
        email: user.email,
        name: user.displayName,
      },
    })
  );
}
