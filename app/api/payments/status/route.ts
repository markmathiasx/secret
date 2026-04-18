import { NextResponse } from "next/server";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { isMercadoPagoBricksConfigured, isMercadoPagoConfigured } from "@/lib/env";

export async function GET() {
  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      cardCheckoutReady: isMercadoPagoBricksConfigured(),
      pixCheckoutReady: isMercadoPagoConfigured(),
    })
  );
}
