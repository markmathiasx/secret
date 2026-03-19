import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const buildInfoPath = path.join(cwd, "tsconfig.tsbuildinfo");
const tscBin = path.join(cwd, "node_modules", "typescript", "bin", "tsc");

if (fs.existsSync(buildInfoPath)) {
  fs.rmSync(buildInfoPath, { force: true });
}

const result = spawnSync(process.execPath, [tscBin, "--noEmit", "-p", "tsconfig.typecheck.json"], {
  cwd,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
