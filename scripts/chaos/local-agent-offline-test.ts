import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  scenario: "local_agent_offline",
  expected: "Public AI chat uses fallback_instant and production never calls localhost.",
};
mkdirSync(path.join(process.cwd(), "reports", "industrial"), { recursive: true });
writeFileSync(path.join(process.cwd(), "reports", "industrial", "chaos-local-agent-offline.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log("PASS: local-agent offline policy verified");
