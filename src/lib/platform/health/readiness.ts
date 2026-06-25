import { performance } from "node:perf_hooks";
import { buildMetaCommerceFeedData } from "@/lib/meta-commerce-feed";
import { getCatalogDiagnostics } from "@/lib/catalog-repository";
import { getOptionalDependencyChecks } from "@/src/lib/platform/health/dependency";
import { isHealthReportOk, summarizeDependencyStatus, type PlatformHealthCheck, type PlatformHealthReport } from "@/src/lib/platform/health/types";

export async function getReadinessReport(): Promise<PlatformHealthReport> {
  const startedAt = performance.now();
  const checks: PlatformHealthCheck[] = [];

  const catalogStarted = performance.now();
  try {
    const diagnostics = await getCatalogDiagnostics();
    checks.push({
      name: "product-master",
      status: diagnostics.publicCount > 0 ? "ok" : "failed",
      required: true,
      durationMs: Math.round(performance.now() - catalogStarted),
      message: `${diagnostics.publicCount} public products available from ${diagnostics.servedSource}.`,
      metadata: { publicCount: diagnostics.publicCount, servedSource: diagnostics.servedSource },
    });
  } catch {
    checks.push({
      name: "product-master",
      status: "failed",
      required: true,
      durationMs: Math.round(performance.now() - catalogStarted),
      message: "Product Master failed.",
    });
  }

  const feedStarted = performance.now();
  try {
    const feed = buildMetaCommerceFeedData();
    checks.push({
      name: "critical-feeds",
      status: feed.included > 0 ? "ok" : "failed",
      required: true,
      durationMs: Math.round(performance.now() - feedStarted),
      message: `${feed.included} Meta feed products generated.`,
      metadata: { included: feed.included, skipped: feed.skipped.length },
    });
  } catch {
    checks.push({
      name: "critical-feeds",
      status: "failed",
      required: true,
      durationMs: Math.round(performance.now() - feedStarted),
      message: "Critical feed generation failed.",
    });
  }

  checks.push({
    name: "whatsapp",
    status: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER ? "ok" : "degraded",
    required: false,
    durationMs: 0,
    message: "Public contact config checked.",
  });

  checks.push(...(await getOptionalDependencyChecks()));

  const status = summarizeDependencyStatus(checks);
  return {
    ok: isHealthReportOk(checks),
    status,
    generatedAt: new Date().toISOString(),
    durationMs: Math.round(performance.now() - startedAt),
    checks,
  };
}
