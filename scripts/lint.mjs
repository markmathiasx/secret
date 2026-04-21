import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const eslintBin = path.join(cwd, "node_modules", "eslint", "bin", "eslint.js");
const fix = process.argv.includes("--fix");
const targets = [
  "app",
  "components",
  "lib",
  "scripts",
  "tests",
  "types",
  "auth.ts",
  "middleware.ts",
  "instrumentation.ts",
  "next.config.ts",
  "tailwind.config.ts",
  "postcss.config.mjs",
];

const result = spawnSync(
  process.execPath,
  [eslintBin, ...targets, "--ext", ".js,.jsx,.ts,.tsx", "--no-error-on-unmatched-pattern", ...(fix ? ["--fix"] : [])],
  {
  cwd,
  stdio: "inherit",
    env: {
      ...process.env,
    },
  }
);

process.exit(result.status ?? 1);
