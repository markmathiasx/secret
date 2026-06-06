import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getServerSessionUser } from "@/lib/server-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getServerSessionUser();

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      authenticated: Boolean(user),
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: user.role,
            source: user.source,
          }
        : null,
    }),
  );
}
