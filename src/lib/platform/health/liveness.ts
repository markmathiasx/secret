import type { PlatformHealthReport } from "@/src/lib/platform/health/types";

export function getLivenessReport(): PlatformHealthReport {
  return {
    ok: true,
    status: "ok",
    generatedAt: new Date().toISOString(),
    durationMs: 0,
    checks: [
      {
        name: "process",
        status: "ok",
        required: true,
        durationMs: 0,
        message: "Next.js runtime is alive.",
        metadata: {
          node: process.version,
          uptimeSeconds: Math.round(process.uptime()),
        },
      },
    ],
  };
}
