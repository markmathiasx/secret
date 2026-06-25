import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function verifyPlatformBackup(dir: string) {
  const manifestPath = path.join(dir, "manifest.json");
  const payloadPath = path.join(dir, "payload.json");
  return {
    ok: existsSync(manifestPath) && existsSync(payloadPath),
    manifest: existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : null,
  };
}
