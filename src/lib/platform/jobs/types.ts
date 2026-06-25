export const platformJobTypes = [
  "catalog_audit",
  "feed_regenerate",
  "feed_validate",
  "cache_warmup",
  "priceops_audit",
  "channelops_sync",
  "seo_copy_review",
  "support_knowledge_reindex",
  "ai_site_review",
  "ai_patch_proposal",
  "ai_daily_report",
  "infra_deep_check",
  "visual_regression",
  "load_test_plan",
  "backup_create",
  "rollback_verify",
] as const;

export type PlatformJobType = (typeof platformJobTypes)[number];
export type PlatformJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "dead_letter";

export type PlatformJob = {
  id: string;
  type: PlatformJobType;
  status: PlatformJobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  result?: Record<string, unknown>;
  error?: string;
};

export function isPlatformJobType(value: string): value is PlatformJobType {
  return platformJobTypes.includes(value as PlatformJobType);
}
