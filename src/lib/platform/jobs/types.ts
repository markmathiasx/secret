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
  "order_post_purchase",
  "order_status_notification",
  "delivery_confirmation",
  "verified_review_request",
  "cart_recovery",
  "browse_recovery",
  "re_engagement",
  "growth_b2b_batch",
  "ops_digest",
] as const;

export type PlatformJobType = (typeof platformJobTypes)[number];
export type PlatformJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "dead_letter";
export type PlatformJobHistoryEntry = {
  status: PlatformJobStatus;
  at: string;
  error?: string;
};

export type PlatformJob = {
  id: string;
  type: PlatformJobType;
  status: PlatformJobStatus;
  idempotencyKey: string;
  lockKey: string;
  payload: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  nextAttemptAt?: string | null;
  result?: Record<string, unknown>;
  error?: string;
  history?: PlatformJobHistoryEntry[];
};

export function isPlatformJobType(value: string): value is PlatformJobType {
  return platformJobTypes.includes(value as PlatformJobType);
}
