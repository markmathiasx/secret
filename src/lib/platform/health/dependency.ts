import { getCacheHealth } from "@/src/lib/platform/cache/health";
import { getDatabaseHealth } from "@/src/lib/platform/db/health";
import type { PlatformHealthCheck } from "@/src/lib/platform/health/types";

export async function getOptionalDependencyChecks(): Promise<PlatformHealthCheck[]> {
  return Promise.all([getDatabaseHealth(), getCacheHealth()]);
}
