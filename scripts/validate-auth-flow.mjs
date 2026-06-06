import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function requireFile(file) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    errors.push({ code: "missing_file", file });
    return "";
  }
  return read(file);
}

const files = {
  login: requireFile("app/api/auth/login/route.ts"),
  register: requireFile("app/api/auth/register/route.ts"),
  logout: requireFile("app/api/auth/logout/route.ts"),
  me: requireFile("app/api/auth/me/route.ts"),
  authStore: requireFile("lib/auth-store.ts"),
  audit: requireFile("lib/auth/audit.ts"),
  loginPage: requireFile("app/login/page.tsx"),
  cadastro: requireFile("app/cadastro/page.tsx"),
};

if (!files.login.includes("recordAuthAudit") || !files.register.includes("recordAuthAudit") || !files.logout.includes("recordAuthAudit")) {
  errors.push({ code: "auth_audit_not_wired" });
}

if (!files.register.includes("Não foi possível criar a conta com os dados informados.")) {
  errors.push({ code: "register_duplicate_error_not_generic" });
}

if (!files.authStore.includes("assertDevFallbackAllowed") || !files.authStore.includes("isProductionRuntime")) {
  errors.push({ code: "production_fallback_guard_missing" });
}

if (!files.authStore.includes("authenticatePrismaCustomer") || !files.authStore.includes("createPrismaAuthUser")) {
  errors.push({ code: "prisma_customer_auth_missing" });
}

if (!files.loginPage.includes("initialMode") || !files.cadastro.includes('initialMode="register"')) {
  errors.push({ code: "cadastro_route_not_forced_to_register" });
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  checkedFiles: Object.keys(files),
  errors,
};

writeJson("reports/auth-flow-validation-report.json", report);

if (errors.length) {
  console.error(`Falha: ${errors.length} erro(s) no fluxo de auth.`);
  process.exit(1);
}

console.log("OK: fluxo de auth validado.");
