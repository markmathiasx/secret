import { createHash } from "node:crypto";

export function buildBackupManifest(scope: string, payload: unknown) {
  const serialized = JSON.stringify(payload);
  return {
    scope,
    generatedAt: new Date().toISOString(),
    sha256: createHash("sha256").update(serialized).digest("hex"),
    bytes: Buffer.byteLength(serialized),
  };
}
