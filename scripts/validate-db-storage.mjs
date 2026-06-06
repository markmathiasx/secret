import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function exists(file) {
  const ok = fs.existsSync(path.join(ROOT, file));
  if (!ok) errors.push({ code: "missing_file", file });
  return ok;
}

const schema = read("prisma/schema.prisma");
for (const model of ["UserProfile", "ProductOverride", "FileAsset", "SupportConversation", "SupportMessage", "AuditLog"]) {
  if (!schema.includes(`model ${model}`)) {
    errors.push({ code: "missing_prisma_model", model });
  }
}

for (const field of ["lastLoginAt", "disabledAt", "sessionId", "paymentStatus", "referenceFileId"]) {
  if (!schema.includes(field)) {
    errors.push({ code: "missing_schema_field", field });
  }
}

const migrationDir = path.join(ROOT, "prisma/migrations/20260606090000_industrial_auth_db_storage");
if (!fs.existsSync(path.join(migrationDir, "migration.sql"))) {
  errors.push({ code: "missing_prisma_migration" });
}

for (const file of [
  "lib/storage/storage-provider.ts",
  "lib/storage/local-storage-provider.ts",
  "lib/storage/supabase-storage-provider.ts",
  "app/api/files/upload/route.ts",
  "app/api/files/[id]/route.ts",
  "supabase/migrations/20260606063633_mdh_storage_rls_policies.sql",
]) {
  exists(file);
}

const storageProvider = exists("lib/storage/storage-provider.ts") ? read("lib/storage/storage-provider.ts") : "";
if (!storageProvider.includes("canConnectToDatabase") || !storageProvider.includes("Persistência de arquivos não configurada em produção")) {
  errors.push({ code: "storage_metadata_guard_missing" });
}

const supabaseStorageProvider = exists("lib/storage/supabase-storage-provider.ts")
  ? read("lib/storage/supabase-storage-provider.ts")
  : "";
if (!supabaseStorageProvider.includes("createBucket") || !supabaseStorageProvider.includes("public: false")) {
  errors.push({ code: "supabase_private_bucket_ensure_missing" });
}

const supabaseSql = exists("supabase/migrations/20260606063633_mdh_storage_rls_policies.sql")
  ? read("supabase/migrations/20260606063633_mdh_storage_rls_policies.sql")
  : "";
if (!supabaseSql.includes("alter table storage.objects enable row level security") || !supabaseSql.includes("mdh-private-assets")) {
  errors.push({ code: "supabase_storage_rls_missing" });
}

const envExample = read(".env.example");
for (const envName of ["DATABASE_URL", "DIRECT_URL", "AUTH_CUSTOMER_SESSION_SECRET", "SUPABASE_STORAGE_BUCKET"]) {
  if (!envExample.includes(envName)) errors.push({ code: "env_placeholder_missing", envName });
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  errors,
};

writeJson("reports/db-storage-validation-report.json", report);

if (errors.length) {
  console.error(`Falha: ${errors.length} erro(s) em DB/storage.`);
  process.exit(1);
}

console.log("OK: DB/storage validado.");
