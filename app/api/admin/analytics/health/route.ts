import { NextResponse } from "next/server";
import { requireAdminOrSecret } from "@/src/lib/apiops/auth";
import { applyNoStoreHeaders } from "@/lib/http-cache";

export const dynamic = "force-dynamic";

function configured(...keys: string[]) {
  return keys.some((key) => Boolean(process.env[key]?.trim()));
}

export async function GET(request: Request) {
  const denied = await requireAdminOrSecret(request);
  if (denied) return denied;

  const gtmConfigured = configured("NEXT_PUBLIC_GTM_ID", "VITE_GTM_ID");
  const metaPixelConfigured = configured("NEXT_PUBLIC_META_PIXEL_ID", "NEXT_PUBLIC_FB_PIXEL_ID", "VITE_META_PIXEL_ID");
  const ga4Configured = configured("NEXT_PUBLIC_GA4_ID", "NEXT_PUBLIC_GA_MEASUREMENT_ID");

  return applyNoStoreHeaders(
    NextResponse.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      status: gtmConfigured || metaPixelConfigured || ga4Configured ? "configured" : "optional_instrumentation_pending",
      dataLayer: "safe_noop_when_unconfigured",
      providers: {
        gtm: gtmConfigured ? "configured" : "optional_pending",
        metaPixel: metaPixelConfigured ? "configured" : "optional_pending",
        ga4: ga4Configured ? "configured" : "optional_pending",
      },
      events: ["view_item", "add_to_cart", "begin_checkout", "purchase", "whatsapp_click"],
    }),
    { varyCookie: true }
  );
}
