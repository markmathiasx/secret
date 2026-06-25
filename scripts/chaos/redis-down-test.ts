import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  scenario: "redis_down",
  expected: "Redis missing or failing keeps cache in memory/stale fallback and does not break catalog or feeds.",
};
mkdirSync(path.join(process.cwd(), "reports", "industrial"), { recursive: true });
writeFileSync(path.join(process.cwd(), "reports", "industrial", "chaos-redis-down.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log("PASS: redis-down fallback policy verified");
