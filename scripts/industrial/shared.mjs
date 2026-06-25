import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const root = process.cwd();

export function ensureReportDir() {
  const dir = path.join(root, "reports", "industrial");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeReport(name, data) {
  const file = path.join(ensureReportDir(), name);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return file;
}

export function fileExists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

export function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    shell: false,
    maxBuffer: 50 * 1024 * 1024,
    ...options,
  });
}

export function okExit(ok, reportPath) {
  if (!ok) {
    console.error(`FAIL: ${reportPath}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: ${reportPath}`);
}
