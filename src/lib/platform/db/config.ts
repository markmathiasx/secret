import { maskUrl } from "@/src/lib/platform/security/secrets";

export type DatabasePlatformConfig = {
  provider: "postgres";
  runtimeUrl: string | null;
  directUrl: string | null;
  poolingEnabled: boolean;
  required: boolean;
  statementTimeoutMs: number;
  connectTimeoutMs: number;
};

function bool(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function numberEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getDatabasePlatformConfig(): DatabasePlatformConfig {
  return {
    provider: "postgres",
    runtimeUrl: process.env.DATABASE_URL?.trim() || null,
    directUrl: process.env.DIRECT_URL?.trim() || null,
    poolingEnabled: bool(process.env.DATABASE_POOLING_ENABLED, true),
    required: bool(process.env.DATABASE_REQUIRED, false),
    statementTimeoutMs: numberEnv("DATABASE_STATEMENT_TIMEOUT_MS", 3000),
    connectTimeoutMs: numberEnv("DATABASE_CONNECT_TIMEOUT_MS", 1500),
  };
}

export function getSafeDatabaseConfig() {
  const config = getDatabasePlatformConfig();
  return {
    provider: config.provider,
    runtimeUrlConfigured: Boolean(config.runtimeUrl),
    runtimeUrl: maskUrl(config.runtimeUrl || undefined),
    directUrlConfigured: Boolean(config.directUrl),
    directUrlRuntimeAllowed: false,
    poolingEnabled: config.poolingEnabled,
    required: config.required,
    statementTimeoutMs: config.statementTimeoutMs,
    connectTimeoutMs: config.connectTimeoutMs,
  };
}
