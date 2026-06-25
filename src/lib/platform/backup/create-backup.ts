import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { catalog } from "@/lib/catalog";
import { buildBackupManifest } from "@/src/lib/platform/backup/manifest";

export function createPlatformBackup(scope = "industrial") {
  const payload = {
    catalogCount: catalog.length,
    generatedAt: new Date().toISOString(),
    scopes: ["catalog", "prices", "feeds", "channelops", "jobs", "ai_reports"],
  };
  const manifest = buildBackupManifest(scope, payload);
  const dir = path.join(process.cwd(), "data", "platform-backups", manifest.generatedAt.replace(/[:.]/g, "-"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  writeFileSync(path.join(dir, "payload.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { dir, manifest };
}
