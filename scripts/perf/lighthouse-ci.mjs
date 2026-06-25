import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const reportDir = path.join(process.cwd(), "reports", "industrial");
mkdirSync(reportDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  mode: "prepared",
  command: "npx lighthouse https://www.mdh3d.com.br --preset=desktop",
};
writeFileSync(path.join(reportDir, "lighthouse-ci-plan.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log("PASS: lighthouse plan prepared");
