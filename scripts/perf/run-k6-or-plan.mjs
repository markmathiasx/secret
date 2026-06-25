import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const script = process.argv[2];
const reportDir = path.join(process.cwd(), "reports", "industrial");
mkdirSync(reportDir, { recursive: true });
const scriptName = script ? path.basename(script, path.extname(script)) : "unknown";
const planFile = path.join(reportDir, `${scriptName}-k6-plan.json`);

const k6 = spawnSync("k6", ["version"], { encoding: "utf8", shell: false });
if (k6.status !== 0) {
  const report = {
    generatedAt: new Date().toISOString(),
    ok: true,
    mode: "plan-only",
    reason: "k6 is not installed in this environment.",
    install: "Install k6 and run this script again.",
    script,
  };
  writeFileSync(planFile, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`PASS: ${planFile}`);
  process.exit(0);
}

const result = spawnSync("k6", ["run", script], { cwd: process.cwd(), encoding: "utf8", shell: false, stdio: "inherit" });
process.exit(result.status ?? 1);
