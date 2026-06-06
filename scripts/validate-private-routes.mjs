import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function exists(file) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    errors.push({ code: "missing_file", file });
    return false;
  }
  return true;
}

for (const file of [
  "app/perfil/page.tsx",
  "app/pedidos/page.tsx",
  "app/pedidos/[id]/page.tsx",
  "app/admin/quotes/page.tsx",
  "app/admin/storage/page.tsx",
  "app/admin/audit/page.tsx",
  "app/admin/support/page.tsx",
  "app/api/files/upload/route.ts",
  "app/api/files/[id]/route.ts",
]) {
  exists(file);
}

const middleware = read("middleware.ts");
for (const prefix of ['"/perfil"', '"/pedidos"', '"/api/files"']) {
  if (!middleware.includes(prefix)) {
    errors.push({ code: "middleware_prefix_missing", prefix });
  }
}

for (const page of ["app/admin/quotes/page.tsx", "app/admin/storage/page.tsx", "app/admin/audit/page.tsx", "app/admin/support/page.tsx"]) {
  if (!exists(page)) continue;
  const source = read(page);
  if (!source.includes("getServerSessionUser") || !source.includes("isAdminSession") || !source.includes('redirect("/admin/login")')) {
    errors.push({ code: "admin_page_not_protected", page });
  }
}

const uploadRoute = exists("app/api/files/upload/route.ts") ? read("app/api/files/upload/route.ts") : "";
const fileRoute = exists("app/api/files/[id]/route.ts") ? read("app/api/files/[id]/route.ts") : "";
if (!uploadRoute.includes("getServerSessionUser") || !uploadRoute.includes("validateUploadFile")) {
  errors.push({ code: "file_upload_not_protected_or_validated" });
}
if (!fileRoute.includes("getServerSessionUser") || !fileRoute.includes("Forbidden")) {
  errors.push({ code: "file_metadata_route_not_protected" });
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  errors,
};

writeJson("reports/private-routes-validation-report.json", report);

if (errors.length) {
  console.error(`Falha: ${errors.length} erro(s) em rotas privadas.`);
  process.exit(1);
}

console.log("OK: rotas privadas validadas.");
