import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const cwd = process.cwd();
const buildInfoPath = path.join(cwd, "tsconfig.tsbuildinfo");
const nextBin = path.join(cwd, "node_modules", "next", "dist", "bin", "next");
const tscBin = path.join(cwd, "node_modules", "typescript", "bin", "tsc");

if (fs.existsSync(buildInfoPath)) {
  fs.rmSync(buildInfoPath, { force: true });
}

const typegen = spawnSync(process.execPath, [nextBin, "typegen"], {
  cwd,
  stdio: "inherit",
});

if ((typegen.status ?? 1) !== 0) {
  process.exit(typegen.status ?? 1);
}

const result = spawnSync(process.execPath, [tscBin, "--noEmit"], {
  cwd,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
