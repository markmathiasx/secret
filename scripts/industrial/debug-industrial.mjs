import { run, writeReport } from "./shared.mjs";

const commands = [
  ["git", ["status", "--short"]],
  ["node", ["scripts/industrial/db-health.mjs"]],
  ["node", ["scripts/industrial/cache-health.mjs"]],
  ["node", ["scripts/industrial/ai-health.mjs"]],
  ["node", ["scripts/industrial/jobs-report.mjs"]],
];

const results = commands.map(([cmd, args]) => {
  const result = run(cmd, args);
  return { cmd, args, status: result.status, stdout: result.stdout.slice(0, 4000), stderr: result.stderr.slice(0, 4000) };
});

console.log(`Wrote ${writeReport("debug-industrial.json", { generatedAt: new Date().toISOString(), results })}`);
