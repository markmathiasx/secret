export type DependencyStatus = "ok" | "degraded" | "optional_missing" | "failed" | "timeout";

export type PlatformHealthCheck = {
  name: string;
  status: DependencyStatus;
  required: boolean;
  durationMs: number;
  message?: string;
  metadata?: Record<string, unknown>;
};

export type PlatformHealthReport = {
  ok: boolean;
  status: DependencyStatus;
  generatedAt: string;
  durationMs: number;
  checks: PlatformHealthCheck[];
};

const statusRank: Record<DependencyStatus, number> = {
  ok: 0,
  optional_missing: 1,
  degraded: 2,
  timeout: 3,
  failed: 4,
};

export function summarizeDependencyStatus(checks: PlatformHealthCheck[]): DependencyStatus {
  const requiredFailure = checks.find((check) => check.required && (check.status === "failed" || check.status === "timeout"));
  if (requiredFailure) return requiredFailure.status;

  return checks.reduce<DependencyStatus>((current, check) => {
    return statusRank[check.status] > statusRank[current] ? check.status : current;
  }, "ok");
}

export function isHealthReportOk(checks: PlatformHealthCheck[]) {
  return !checks.some((check) => check.required && (check.status === "failed" || check.status === "timeout"));
}
