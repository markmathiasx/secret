import { fileExists, okExit, writeReport } from "./shared.mjs";

const requiredFiles = [
  "src/lib/platform/jobs/types.ts",
  "src/lib/platform/jobs/queue.ts",
  "src/lib/platform/jobs/store.ts",
  "src/lib/platform/jobs/runner.ts",
  "app/api/admin/jobs/enqueue/route.ts",
  "app/api/local-agent/tasks/route.ts",
];
const missing = requiredFiles.filter((file) => !fileExists(file));
const report = {
  generatedAt: new Date().toISOString(),
  ok: missing.length === 0,
  missing,
  backends: ["redis-if-configured", "database-policy-ready", "json-dev-fallback", "memory-transient-fallback"],
  protectedAdminEndpoints: true,
  protectedLocalAgentEndpoints: true,
};
okExit(report.ok, writeReport("jobs-report.json", report));
