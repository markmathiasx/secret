import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["playwright", "test", "tests/mdh-smart-store.spec.ts"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    PLAYWRIGHT_USE_SYSTEM_CHROME: process.env.PLAYWRIGHT_USE_SYSTEM_CHROME || "1",
  },
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
