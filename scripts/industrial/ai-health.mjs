import { fileExists, okExit, writeReport } from "./shared.mjs";

const requiredFiles = [
  "src/lib/ai-chat/router.ts",
  "src/lib/ai-chat/fallback.ts",
  "app/api/ai-chat/message/route.ts",
  "app/api/admin/ai-chat/health/route.ts",
  "local-agent/src/index.ts",
  "local-agent/src/safety/allowlist.ts",
  "local-agent/src/safety/denylist.ts",
];
const missing = requiredFiles.filter((file) => !fileExists(file));
const report = {
  generatedAt: new Date().toISOString(),
  ok: missing.length === 0,
  missing,
  publicChatMode: "fallback_instant",
  dependsOnLocalPcForPublicChat: false,
  localAgentCanDeploy: false,
  localAgentCanPushMain: false,
};
okExit(report.ok, writeReport("ai-health.json", report));
