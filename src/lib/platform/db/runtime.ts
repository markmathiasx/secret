import { getDatabasePlatformConfig } from "@/src/lib/platform/db/config";
import { PlatformDatabaseError } from "@/src/lib/platform/db/errors";

export function assertRuntimeDatabasePolicy() {
  const config = getDatabasePlatformConfig();
  if (!config.runtimeUrl && config.required) {
    throw new PlatformDatabaseError("database_required_missing", "DATABASE_URL is required for runtime.");
  }

  if (config.directUrl && config.runtimeUrl && config.directUrl === config.runtimeUrl && config.poolingEnabled) {
    throw new PlatformDatabaseError("direct_url_equals_runtime_url", "DIRECT_URL must not be used as runtime pooled URL.");
  }

  return config;
}

export function isBuildTimeRuntime() {
  const phase = `${process.env.NEXT_PHASE ?? ""} ${process.env.npm_lifecycle_event ?? ""}`;
  return /build/i.test(phase);
}
