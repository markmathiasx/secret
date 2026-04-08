import { spawnSync } from "node:child_process";

const migrationName = process.env.PRISMA_MIGRATION_NAME || "marketplace_sync";
const args = ["prisma", "migrate", "dev", "--name", migrationName];

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
