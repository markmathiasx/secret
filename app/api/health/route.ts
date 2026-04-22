import { NextResponse } from "next/server";
import { getCatalogDiagnostics, getCatalogSnapshot } from "@/lib/catalog-repository";
import { applyNoStoreHeaders } from "@/lib/http-cache";
import { getSupportStatus } from "@/lib/live-chat-service";
import {
  getAiAssistantModel,
  getAiAssistantProvider,
  getChatwootAvailabilityMode,
  getSiteUrl,
  getSupabaseEnv,
  isAiAssistantConfigured,
  isCardCheckoutConfigured,
  isChatwootWidgetConfigured,
} from "@/lib/env";
import { isProductVisualVerified } from "@/lib/product-visuals";

export async function GET() {
  const supabase = getSupabaseEnv();
  const catalogDiagnostics = await getCatalogDiagnostics();
  const products = await getCatalogSnapshot();
  const verifiedVisuals = products.filter((product) => isProductVisualVerified(product)).length;
  const supportStatus = await getSupportStatus();

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
      support: {
        chatwootConfigured: isChatwootWidgetConfigured(),
        channel: supportStatus.launchMode,
        availabilityMode: getChatwootAvailabilityMode(),
        available: supportStatus.available,
        label: supportStatus.label,
      },
      catalog: {
        total: catalogDiagnostics.publicCount,
        source: catalogDiagnostics.servedSource,
        expectedPages: catalogDiagnostics.expectedPages,
        fallbackActive: catalogDiagnostics.fallbackActive,
        verifiedVisuals,
      },
      integrations: {
        supabaseConfigured: Boolean(supabase.url && supabase.anon),
      },
    })
  );
}
