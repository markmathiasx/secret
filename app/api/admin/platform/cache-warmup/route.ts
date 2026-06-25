import { getCatalogProductsDal, getCatalogStatsDal } from "@/src/lib/platform/data/catalog-dal";
import { getGoogleFeedDal, getMetaFeedDal, getProductsFeedDal } from "@/src/lib/platform/data/feed-dal";
import { platformJson } from "@/src/lib/platform/http/response";
import { requireAdminPlatformAuth } from "@/src/lib/platform/security/admin-auth";
import { recordAuditEvent } from "@/src/lib/platform/security/audit-log";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireAdminPlatformAuth(request);
  if (denied) return denied;

  const [catalog, stats, meta, google, products] = await Promise.all([
    getCatalogProductsDal(),
    getCatalogStatsDal(),
    getMetaFeedDal(),
    getGoogleFeedDal(),
    getProductsFeedDal(),
  ]);
  const result = {
    ok: true,
    warmed: {
      catalogProducts: catalog.length,
      catalogPublicCount: stats.publicCount,
      metaProducts: meta.data.included,
      googleBytes: google.length,
      productsFeedItems: products.length,
    },
  };
  recordAuditEvent({ action: "cache.warmup", metadata: result.warmed });
  return platformJson(result);
}
