import { spawnSync } from "node:child_process";

const result = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
