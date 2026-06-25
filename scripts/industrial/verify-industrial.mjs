import { fileExists, okExit, readJson, run, writeReport } from "./shared.mjs";

const requiredFiles = [
  "src/lib/platform/db/config.ts",
  "src/lib/platform/db/client.ts",
  "src/lib/platform/cache/cache-aside.ts",
  "src/lib/platform/cache/stale.ts",
  "src/lib/platform/data/dal.ts",
  "src/lib/platform/health/readiness.ts",
  "src/lib/platform/jobs/queue.ts",
  "src/lib/platform/observability/logger.ts",
  "src/lib/platform/security/ssrf-guard.ts",
  "src/lib/platform/rollback/rollback.ts",
  "app/api/health/liveness/route.ts",
  "app/api/health/readiness/route.ts",
  "app/api/ai-chat/message/route.ts",
  "app/api/admin/ai-chat/health/route.ts",
  "local-agent/src/index.ts",
  ".github/workflows/industrial-quality-gate.yml",
];
const missing = requiredFiles.filter((file) => !fileExists(file));

let scoreOk = false;
try {
  const score = readJson("data/reports/score-commerce-os.json");
  const scoreValues = score?.scores ? Object.values(score.scores) : [];
  scoreOk =
    score?.pass === true &&
    scoreValues.length >= 3 &&
    scoreValues.every((value) => value === 100);
} catch {
  scoreOk = false;
}

const secretScan = run("node", ["scripts/security/scan-git-secrets.mjs"]);
const secretScanOk = secretScan.status === 0;

const report = {
  generatedAt: new Date().toISOString(),
  ok: missing.length === 0 && scoreOk && secretScanOk,
  missing,
  scoreCommerceOsPreserved: scoreOk,
  secretScanOk,
  secretScanExitCode: secretScan.status,
  invariants: {
    dbOptionalFallback: fileExists("src/lib/platform/db/health.ts"),
    redisOptionalFallback: fileExists("src/lib/platform/cache/health.ts"),
    aiChatIndependentFromPc: fileExists("src/lib/ai-chat/fallback.ts"),
    adminAiProtected: fileExists("app/api/admin/ai-chat/health/route.ts"),
    rollbackDryRun: fileExists("src/lib/platform/rollback/rollback.ts"),
  },
};

okExit(report.ok, writeReport("verify-industrial.json", report));
