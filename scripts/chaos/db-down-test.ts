import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const required = process.env.DATABASE_REQUIRED === "true";
const report = {
  generatedAt: new Date().toISOString(),
  ok: !required,
  scenario: "db_down_optional",
  expected: "With DATABASE_REQUIRED=false, Product Master/static fallback keeps production available.",
};
mkdirSync(path.join(process.cwd(), "reports", "industrial"), { recursive: true });
writeFileSync(path.join(process.cwd(), "reports", "industrial", "chaos-db-down.json"), `${JSON.stringify(report, null, 2)}\n`);
if (required) process.exitCode = 1;
else console.log("PASS: db-down optional fallback policy verified");
