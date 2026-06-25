import { verifyRollbackReadiness } from "@/src/lib/platform/rollback/verify-rollback";

export function rollbackDryRun() {
  const readiness = verifyRollbackReadiness();
  return {
    ok: readiness.ok,
    dryRun: true,
    readiness,
    message: readiness.ok ? "Rollback dry-run passed; no production mutation executed." : "Rollback script missing.",
  };
}
