import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import {
  getAiAssistantModel,
  getAiAssistantProvider,
  getSiteUrl,
  getSupabaseEnv,
  isAiAssistantConfigured,
  isCardCheckoutConfigured,
} from "@/lib/env";
import { isProductVisualVerified } from "@/lib/product-visuals";

export async function GET() {
  const supabase = getSupabaseEnv();
  const verifiedVisuals = catalog.filter((product) => isProductVisualVerified(product)).length;

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
      siteUrl: getSiteUrl(),
      ai: {
        ready: isAiAssistantConfigured(),
        provider: getAiAssistantProvider(),
        model: getAiAssistantModel(),
      },
      payments: {
        pixReady: true,
        cardCheckoutReady: isCardCheckoutConfigured(),
      },
      catalog: {
        total: catalog.length,
        verifiedVisuals,
      },
      integrations: {
        supabaseConfigured: Boolean(supabase.url && supabase.anon),
      },
    })
  );
}
