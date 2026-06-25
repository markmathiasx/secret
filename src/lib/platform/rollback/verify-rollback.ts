import { existsSync } from "node:fs";
import path from "node:path";

export function verifyRollbackReadiness() {
  return {
    ok: existsSync(path.join(process.cwd(), "scripts", "commerce-os", "rollback-catalog.mjs")),
    requiresAi: false,
    dryRunSupported: true,
  };
}
