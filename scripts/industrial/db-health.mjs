import { okExit, writeReport } from "./shared.mjs";

const required = process.env.DATABASE_REQUIRED === "true";
const runtimeUrl = Boolean(process.env.DATABASE_URL);
const directUrl = Boolean(process.env.DIRECT_URL);
const ok = runtimeUrl || !required;
const report = {
  generatedAt: new Date().toISOString(),
  ok,
  status: runtimeUrl ? "configured" : required ? "failed_required_missing" : "optional_missing_with_file_fallback",
  provider: process.env.DATABASE_PROVIDER || "postgres",
  poolingEnabled: process.env.DATABASE_POOLING_ENABLED !== "false",
  runtimeUrlConfigured: runtimeUrl,
  directUrlConfigured: directUrl,
  directUrlAllowedInRuntime: false,
  fallback: !runtimeUrl && !required,
};
okExit(ok, writeReport("db-health.json", report));
