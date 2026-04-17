import { NextResponse } from "next/server";
import { getCatalogDiagnostics } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export async function GET() {
  const diagnostics = await getCatalogDiagnostics();
  return applyNoStoreHeaders(
    NextResponse.json(
      {
        ok: diagnostics.ok,
        timestamp: new Date().toISOString(),
        catalog: diagnostics,
      },
      { status: diagnostics.ok ? 200 : 503 }
    )
  );
}
