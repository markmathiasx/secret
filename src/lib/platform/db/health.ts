import { performance } from "node:perf_hooks";
import type { PlatformHealthCheck } from "@/src/lib/platform/health/types";
import { getSafeDatabaseConfig } from "@/src/lib/platform/db/config";
import { getPlatformDatabaseClient } from "@/src/lib/platform/db/client";
import { sanitizeDatabaseError } from "@/src/lib/platform/db/errors";
import { getDatabasePlatformConfig } from "@/src/lib/platform/db/config";
import { isBuildTimeRuntime } from "@/src/lib/platform/db/runtime";

export async function getDatabaseHealth(): Promise<PlatformHealthCheck> {
  const startedAt = performance.now();
  const config = getDatabasePlatformConfig();

  if (!config.runtimeUrl) {
    return {
      name: "database",
      status: config.required ? "failed" : "optional_missing",
      required: config.required,
      durationMs: Math.round(performance.now() - startedAt),
      message: config.required ? "Runtime database URL missing while database is required." : "Runtime database URL missing; file/Product Master fallback is active.",
      metadata: getSafeDatabaseConfig(),
    };
  }

  if (isBuildTimeRuntime()) {
    return {
      name: "database",
      status: "degraded",
      required: config.required,
      durationMs: Math.round(performance.now() - startedAt),
      message: "Database probe skipped during build.",
      metadata: getSafeDatabaseConfig(),
    };
  }

  try {
    const client = getPlatformDatabaseClient();
    await Promise.race([
      client.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("database_health_timeout")), config.connectTimeoutMs)),
    ]);

    return {
      name: "database",
      status: "ok",
      required: config.required,
      durationMs: Math.round(performance.now() - startedAt),
      message: "Pooled runtime database is reachable.",
      metadata: getSafeDatabaseConfig(),
    };
  } catch (error) {
    return {
      name: "database",
      status: config.required ? "failed" : "degraded",
      required: config.required,
      durationMs: Math.round(performance.now() - startedAt),
      message: "Database unavailable; fallback remains active when optional.",
      metadata: {
        ...getSafeDatabaseConfig(),
        error: sanitizeDatabaseError(error),
      },
    };
  }
}
