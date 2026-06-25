export const platformSloTargets = {
  homepageP95TtfbMs: 800,
  catalogP95TtfbMs: 1000,
  feedGenerationSuccessRate: 0.99,
  chatFallbackSuccessRate: 0.99,
  cacheHitRate: 0.5,
  errorRate: 0.01,
  jobSuccessRate: 0.95,
} as const;

export function getSloReport() {
  return {
    generatedAt: new Date().toISOString(),
    targets: platformSloTargets,
    status: "instrumented",
  };
}
