#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const failures = [];
const warnings = [];
const evidence = {
  checkedEnvFiles: [],
  envSources: {},
  cli: {},
  rlsTables: [],
};

const PLACEHOLDER_MARKERS = [
  "<",
  ">",
  "example",
  "placeholder",
  "change-me",
  "changeme",
  "your_",
  "your-",
  "user:pass",
  "username",
  "password",
];

const MOJIBAKE_PATTERN = /(?:Ã£|Ã§|Ã¡|Ã©|Ãª|Ã³|Ãº|Ã­|Ãµ|Ã¢|Ã´|Âª|Âº|�)/;

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function read(relativePath, required = true) {
  const file = absolute(relativePath);
  if (!fs.existsSync(file)) {
    if (required) failures.push({ code: "missing_file", file: relativePath });
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function parseEnvFile(relativePath) {
  const file = absolute(relativePath);
  if (!fs.existsSync(file)) return null;

  const values = {};
  const source = fs.readFileSync(file, "utf8");
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !/^[A-Za-z_][A-Za-z0-9_]*=/.test(line)) continue;
    const index = line.indexOf("=");
    const key = line.slice(0, index);
    let value = line.slice(index + 1).trim();
    value = value.replace(/^(['"])(.*)\1$/, "$2");
    values[key] = value;
  }

  evidence.checkedEnvFiles.push(relativePath);
  return { relativePath, values };
}

const envFiles = [
  ".vercel/.env.production.local",
  ".env.production.local",
  ".env.vercel.production",
  ".env.local",
  ".env",
]
  .map(parseEnvFile)
  .filter(Boolean);

function valueFor(key) {
  const fromProcess = String(process.env[key] || "").trim();
  if (fromProcess) {
    evidence.envSources[key] = "process";
    return fromProcess;
  }

  for (const envFile of envFiles) {
    const value = String(envFile.values[key] || "").trim();
    if (value) {
      evidence.envSources[key] = envFile.relativePath;
      return value;
    }
  }

  evidence.envSources[key] = "missing";
  return "";
}

function hasPlaceholderValue(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return false;
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker));
}

function requireKey(key, options = {}) {
  const value = valueFor(key);
  if (!value) {
    failures.push({ code: "missing_env", key, group: options.group || "required" });
    return "";
  }
  if (hasPlaceholderValue(value)) {
    failures.push({ code: "placeholder_env", key, group: options.group || "required" });
  }
  if (options.minLength && value.length < options.minLength) {
    failures.push({ code: "short_env", key, minimum: options.minLength });
  }
  return value;
}

function requireAny(label, keys, options = {}) {
  for (const key of keys) {
    const value = valueFor(key);
    if (value && !hasPlaceholderValue(value)) return { key, value };
  }

  failures.push({ code: "missing_env_group", label, keys, group: options.group || "required" });
  return { key: null, value: "" };
}

function parseUrl(key, value, options = {}) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (options.protocols && !options.protocols.includes(parsed.protocol)) {
      failures.push({ code: "invalid_env_protocol", key, expected: options.protocols, actual: parsed.protocol });
    }
    const host = parsed.hostname.toLowerCase();
    if (options.productionHost) {
      if (["localhost", "127.0.0.1", "0.0.0.0"].includes(host)) {
        failures.push({ code: "local_production_url", key, host });
      }
      if (/\.vercel\.app$/i.test(host)) {
        failures.push({ code: "vercel_default_canonical_url", key, host });
      }
    }
    return parsed;
  } catch {
    failures.push({ code: "invalid_env_url", key });
    return null;
  }
}

function runCommand(name, command, args) {
  const isNpm = process.platform === "win32" && command === "npm";
  const cmd = isNpm ? "cmd.exe" : command;
  const finalArgs = isNpm ? ["/d", "/s", "/c", command, ...args] : args;
  const result = spawnSync(cmd, finalArgs, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const ok = result.status === 0;
  evidence.cli[name] = {
    ok,
    version: ok ? String(result.stdout || result.stderr).trim().split(/\r?\n/).at(-1) : null,
  };
  return ok;
}

function validateCoreEnv() {
  const siteUrl = requireKey("NEXT_PUBLIC_SITE_URL", { group: "site" });
  parseUrl("NEXT_PUBLIC_SITE_URL", siteUrl, { protocols: ["https:"], productionHost: true });

  const authUrl = requireAny("auth canonical URL", ["AUTH_URL", "NEXTAUTH_URL"], { group: "auth" });
  parseUrl(authUrl.key || "AUTH_URL/NEXTAUTH_URL", authUrl.value, { protocols: ["https:"], productionHost: true });

  requireAny("auth secret", ["AUTH_SECRET", "NEXTAUTH_SECRET"], { group: "auth" });
  const authSecret = valueFor("AUTH_SECRET") || valueFor("NEXTAUTH_SECRET");
  if (authSecret && authSecret.length < 32) failures.push({ code: "short_env", key: "AUTH_SECRET/NEXTAUTH_SECRET", minimum: 32 });

  requireKey("ADMIN_SESSION_SECRET", { group: "auth", minLength: 32 });
  requireKey("AUTH_CUSTOMER_SESSION_SECRET", { group: "auth", minLength: 32 });
}

function validateDatabaseEnv() {
  const databaseUrl = requireKey("DATABASE_URL", { group: "database" });
  const directUrl = requireKey("DIRECT_URL", { group: "database" });
  parseUrl("DATABASE_URL", databaseUrl, { protocols: ["postgres:", "postgresql:"] });
  parseUrl("DIRECT_URL", directUrl, { protocols: ["postgres:", "postgresql:"] });
  if (databaseUrl && directUrl && databaseUrl === directUrl) {
    failures.push({ code: "direct_url_equals_database_url", keys: ["DATABASE_URL", "DIRECT_URL"] });
  }
}

function validateSupabaseEnv() {
  const supabaseUrl = requireAny("Supabase server URL", ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"], { group: "supabase" });
  parseUrl(supabaseUrl.key || "SUPABASE_URL", supabaseUrl.value, { protocols: ["https:"] });
  requireAny("Supabase publishable key", ["SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"], { group: "supabase" });
  requireAny("Supabase service key", ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"], { group: "supabase" });
  requireKey("SUPABASE_STORAGE_BUCKET", { group: "supabase" });
}

function validatePaymentsEnv() {
  const accessToken = requireKey("MERCADOPAGO_ACCESS_TOKEN", { group: "payments" });
  const publicKey = requireAny("Mercado Pago public key", ["NEXT_PUBLIC_MP_PUBLIC_KEY", "NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY"], { group: "payments" });
  requireKey("MERCADOPAGO_WEBHOOK_SECRET", { group: "payments", minLength: 16 });
  requireKey("MERCADOPAGO_FALLBACK_EMAIL", { group: "payments" });
  if (accessToken.startsWith("TEST-")) failures.push({ code: "test_payment_credential_in_production", key: "MERCADOPAGO_ACCESS_TOKEN" });
  if (publicKey.value.startsWith("TEST-")) failures.push({ code: "test_payment_credential_in_production", key: publicKey.key });
}

function validateEmailEnv() {
  const provider = (valueFor("EMAIL_PROVIDER") || "resend").toLowerCase();
  evidence.emailProvider = provider;
  if (!["resend", "sendgrid", "mailgun", "smtp"].includes(provider)) {
    failures.push({ code: "invalid_email_provider", provider });
    return;
  }

  if (provider === "resend") requireKey("RESEND_API_KEY", { group: "email" });
  if (provider === "sendgrid") requireKey("SENDGRID_API_KEY", { group: "email" });
  if (provider === "mailgun") {
    requireKey("MAILGUN_API_KEY", { group: "email" });
    requireKey("MAILGUN_DOMAIN", { group: "email" });
  }
  if (provider === "smtp") {
    const host = requireKey("SMTP_HOST", { group: "email" });
    requireKey("SMTP_PORT", { group: "email" });
    requireKey("SMTP_USER", { group: "email" });
    requireKey("SMTP_PASS", { group: "email" });
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(host.toLowerCase())) {
      failures.push({ code: "local_smtp_in_production", key: "SMTP_HOST", host });
    }
  }
  requireKey("EMAIL_FROM", { group: "email" });
}

function validateRuntimeEnv() {
  const hasRedis = valueFor("REDIS_URL") && !hasPlaceholderValue(valueFor("REDIS_URL"));
  const hasUpstash =
    valueFor("UPSTASH_REDIS_REST_URL") &&
    !hasPlaceholderValue(valueFor("UPSTASH_REDIS_REST_URL")) &&
    valueFor("UPSTASH_REDIS_REST_TOKEN") &&
    !hasPlaceholderValue(valueFor("UPSTASH_REDIS_REST_TOKEN"));
  if (!hasRedis && !hasUpstash) {
    failures.push({ code: "missing_env_group", label: "Redis or Upstash rate-limit backend", keys: ["REDIS_URL", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"], group: "runtime" });
  }
}

function validateVercelLink() {
  const hasProjectFile = fs.existsSync(absolute(".vercel/project.json"));
  const hasProjectEnv = Boolean(valueFor("VERCEL_ORG_ID") && valueFor("VERCEL_PROJECT_ID"));
  evidence.vercelProjectLinked = hasProjectFile || hasProjectEnv;
  if (!evidence.vercelProjectLinked) {
    failures.push({ code: "missing_vercel_project_link", accepted: [".vercel/project.json", "VERCEL_ORG_ID + VERCEL_PROJECT_ID"] });
  }
  if (!runCommand("vercel", "vercel", ["--version"])) {
    failures.push({ code: "missing_cli", command: "vercel --version" });
  }
}

function validateSupabaseCli() {
  if (!runCommand("supabase", "npm", ["exec", "supabase", "--", "--version"])) {
    failures.push({ code: "missing_cli", command: "npm exec supabase -- --version" });
  }
}

function validateSupabaseRls() {
  const migrationDir = absolute("supabase/migrations");
  if (!fs.existsSync(migrationDir)) {
    failures.push({ code: "missing_supabase_migrations" });
    return;
  }

  const sql = fs
    .readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => fs.readFileSync(path.join(migrationDir, file), "utf8"))
    .join("\n");
  const normalized = sql.replace(/\s+/g, " ").toLowerCase();

  if (/auth\.role\s*\(/i.test(sql)) failures.push({ code: "deprecated_auth_role_in_rls" });
  if (/security\s+definer/i.test(sql)) failures.push({ code: "security_definer_in_supabase_migration" });

  const userOwnedTables = [
    "profiles",
    "favorites",
    "quote_requests",
    "user_addresses",
    "order_history_placeholder",
    "social_lead_events",
    "quote_request_items",
    "customer_preferences",
  ];

  for (const table of userOwnedTables) {
    evidence.rlsTables.push(table);
    if (!normalized.includes(`alter table public.${table} enable row level security`)) {
      failures.push({ code: "rls_not_enabled", table: `public.${table}` });
    }
    if (!normalized.includes(`grant select, insert, update, delete on table public.${table} to authenticated`)) {
      failures.push({ code: "authenticated_grant_missing", table: `public.${table}` });
    }
    const policyPattern = new RegExp(`create\\s+policy\\s+"[^"]+"\\s+on\\s+public\\.${table}\\s+for\\s+all\\s+to\\s+authenticated[\\s\\S]*?using\\s*\\([\\s\\S]*?auth\\.uid\\s*\\([\\s\\S]*?with\\s+check`, "i");
    if (!policyPattern.test(sql)) {
      failures.push({ code: "owning_policy_missing_to_authenticated_or_with_check", table: `public.${table}` });
    }
  }

  if (!/create\s+policy\s+"mdh_public_product_assets_are_readable"[\s\S]*?for\s+select[\s\S]*?to\s+anon,\s*authenticated[\s\S]*?product-public/i.test(sql)) {
    failures.push({ code: "public_product_storage_policy_missing" });
  }
  if (!/create\s+policy\s+"mdh_users_update_own_private_assets"[\s\S]*?for\s+update[\s\S]*?to\s+authenticated[\s\S]*?with\s+check/i.test(sql)) {
    failures.push({ code: "private_storage_update_policy_missing_with_check" });
  }
}

function validateRepositoryText() {
  const packageJson = JSON.parse(read("package.json"));
  if (MOJIBAKE_PATTERN.test(String(packageJson.description || ""))) {
    failures.push({ code: "package_description_mojibake" });
  }

  const envExample = read(".env.example");
  for (const key of ["EMAIL_PROVIDER", "RESEND_API_KEY", "DATABASE_URL", "DIRECT_URL", "MERCADOPAGO_WEBHOOK_SECRET", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!envExample.includes(key)) failures.push({ code: "env_example_missing_key", key });
  }

  const gitignore = read(".gitignore");
  for (const ignored of [".env", ".env.local", ".vercel", "supabase/.temp"]) {
    if (!gitignore.includes(ignored)) warnings.push({ code: "gitignore_missing_sensitive_pattern", pattern: ignored });
  }
}

validateCoreEnv();
validateDatabaseEnv();
validateSupabaseEnv();
validatePaymentsEnv();
validateEmailEnv();
validateRuntimeEnv();
validateVercelLink();
validateSupabaseCli();
validateSupabaseRls();
validateRepositoryText();

const report = {
  generatedAt: new Date().toISOString(),
  ok: failures.length === 0,
  failures,
  warnings,
  evidence,
};

const reportPath = absolute("output/production-release-readiness-report.json");
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) {
  console.error(`PRODUCTION READINESS: BLOCKED (${failures.length} failure(s)).`);
  process.exit(1);
}

console.log("PRODUCTION READINESS: OK");
