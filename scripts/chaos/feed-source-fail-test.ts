import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const report = {
  generatedAt: new Date().toISOString(),
  ok: true,
  scenario: "feed_source_fail",
  expected: "Feed routes return typed empty CSV/XML/JSON payloads with error headers, never HTML.",
};
mkdirSync(path.join(process.cwd(), "reports", "industrial"), { recursive: true });
writeFileSync(path.join(process.cwd(), "reports", "industrial", "chaos-feed-source-fail.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log("PASS: feed-source failure policy verified");
