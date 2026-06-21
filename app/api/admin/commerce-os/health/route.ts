import { NextResponse } from "next/server";
import { requireAdminOrSecret } from "@/src/lib/apiops/auth";
import { getProductMasterDiagnostics } from "@/src/lib/catalog";
import { getFeedOpsHealth } from "@/src/lib/feedops/health";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = await requireAdminOrSecret(request);
  if (denied) return denied;

  const [catalog, feedops] = await Promise.all([
    getProductMasterDiagnostics(),
    Promise.resolve(getFeedOpsHealth()),
  ]);

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: catalog.ok,
      generatedAt: new Date().toISOString(),
      catalog,
      feedops,
    }),
    { varyCookie: true }
  );
}
