#!/usr/bin/env node
/**
 * scripts/backup-db.mjs
 * Backs up the Supabase/PostgreSQL database via pg_dump.
 * Usage: node scripts/backup-db.mjs
 * Requires: DATABASE_URL or DIRECT_URL env var, pg_dump installed.
 *
 * Outputs: backups/backup-YYYY-MM-DD_HH-MM-SS.sql.gz
 */

import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const OUT_DIR = resolve(ROOT, "backups");

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌  Set DATABASE_URL or DIRECT_URL before running this script.");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outFile = resolve(OUT_DIR, `backup-${ts}.sql.gz`);

console.log(`📦  Backing up database → ${outFile}`);

try {
  execSync(`pg_dump "${dbUrl}" | gzip > "${outFile}"`, { stdio: "inherit", shell: true });
  console.log("✅  Backup complete.");
} catch (err) {
  console.error("❌  Backup failed:", err.message);
  process.exit(1);
}
