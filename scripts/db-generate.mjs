import { spawnSync } from "node:child_process";

const result = spawnSync(process.execPath, ["scripts/prisma-local-cli.mjs", "generate"], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);
