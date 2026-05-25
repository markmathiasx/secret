import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REPORT_PATH = path.join(ROOT, "reports", "security-audit-report.json");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules", "test-results", "reports", ".vercel"].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(absolute, files);
    } else if (/\.(ts|tsx|js|jsx|mjs|json|md|yml|yaml)$/i.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files;
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function checkContains(source, tokens) {
  return tokens.map((token) => ({ token, ok: source.includes(token) }));
}

function exportedMethods(source) {
  return [...source.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS)\b/g)].map((match) => match[1]);
}

function stripStringLiterals(source) {
  return source
    .replace(/`(?:\\.|[^`])*`/gs, "``")
    .replace(/"(?:\\.|[^"])*"/gs, "\"\"")
    .replace(/'(?:\\.|[^'])*'/gs, "''");
}

function hasPayloadValidation(source) {
  const stripped = stripStringLiterals(source);
  return (
    /z\.object|safeParse|parse\(|validateUploadFile|normalizeAddressInput/.test(source) ||
    /sanitize(?:TextInput|PlainText|Email)|isValidEmail|isValidPhone|isValidCpf|isValidZip/.test(source) ||
    /typeof\s+[A-Za-z0-9_.$[\]]+\s*===\s*["'](?:string|number|boolean|object)["']/.test(source) ||
    /Array\.isArray|Number\.isFinite|Number\.isNaN|Math\.max|Math\.min/.test(source) ||
    /if\s*\([^)]*(?:body|payload|parsed|input|data|formData)[^)]*\)\s*\{?\s*return\s+/.test(stripped)
  );
}

const middleware = read("middleware.ts");
const nextConfig = read("next.config.ts");
const securityLib = read("lib/security.ts");
const projectFiles = walk(ROOT);

const headerChecks = [
  ...checkContains(middleware, [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "frame-ancestors",
  ]),
  ...checkContains(nextConfig, [
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "frame-ancestors",
  ]),
];

const uploadChecks = checkContains(securityLib, [
  "MODEL_EXTENSIONS",
  "stl",
  "3mf",
  "obj",
  "step",
  "iges",
  "MODEL_MIME_TYPES",
  "maxBytes",
  "isAllowedModelSignature",
]);

const adminRoutes = projectFiles.filter((file) => file.includes(`${path.sep}app${path.sep}api${path.sep}admin${path.sep}`));
const adminRouteFindings = adminRoutes.map((file) => {
  const source = fs.readFileSync(file, "utf8");
  return {
    file: path.relative(ROOT, file).replace(/\\/g, "/"),
    protected: /isAdminSession|getServerSessionUser|requireAdmin|adminConfig/.test(source),
    mutates: /export async function (POST|PUT|PATCH|DELETE)/.test(source),
  };
});

const sensitiveApiFindings = projectFiles
  .filter((file) => file.includes(`${path.sep}app${path.sep}api${path.sep}`))
  .map((file) => {
    const source = fs.readFileSync(file, "utf8");
    const relative = path.relative(ROOT, file).replace(/\\/g, "/");
    const sensitive = /checkout|orders|webhooks|auth|admin|quote|upload|pix|mercadopago/i.test(relative);
    const methods = exportedMethods(source);
    const readsBody = /(?:req|request)\.json\(|(?:req|request)\.formData\(/.test(source);
    const protectedAdmin = relative.startsWith("app/api/admin/") && /isAdminSession|getServerSessionUser|requireAdmin|adminConfig/.test(source);
    return {
      file: relative,
      sensitive,
      methods,
      readsBody,
      readsQuery: /searchParams|get\(["'][A-Za-z0-9_-]+["']\)/.test(source),
      protectedAdmin,
      hasValidation: !readsBody || hasPayloadValidation(source),
      hasRateLimit: /rateLimit|checkRateLimit|rateLimitRequest/.test(source) || /webhooks/i.test(relative),
    };
  })
  .filter((item) => item.sensitive);

const secretPatterns = [
  /\bsk-proj-[A-Za-z0-9_-]{20,}/,
  /\bsk-[A-Za-z0-9]{24,}/,
  /\bghp_[A-Za-z0-9]{30,}/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\b(?:access_token|secret|password|private_key)\s*[:=]\s*["'][^"']{12,}["']/i,
];

const secretFindings = [];
const sensitiveLogFindings = [];

for (const file of projectFiles) {
  const relative = path.relative(ROOT, file).replace(/\\/g, "/");
  if (/package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$|data\/real-image-status\.json$/.test(relative)) continue;
  const source = fs.readFileSync(file, "utf8");
  for (const pattern of secretPatterns) {
    if (pattern.test(source)) {
      secretFindings.push({ file: relative, pattern: String(pattern) });
      break;
    }
  }
  const consoleLines = source.split(/\r?\n/).filter((line) => /console\.(log|warn|error)\(/.test(line));
  for (const line of consoleLines) {
    const stripped = stripStringLiterals(line);
    if (/\b(token|cookie|secret|password|authorization)\b/i.test(stripped)) {
      sensitiveLogFindings.push({ file: relative });
      break;
    }
  }
}

const failures = [
  ...headerChecks.filter((item) => !item.ok).map((item) => `missing_header:${item.token}`),
  ...uploadChecks.filter((item) => !item.ok).map((item) => `missing_upload_check:${item.token}`),
  ...adminRouteFindings.filter((item) => item.mutates && !item.protected).map((item) => `unprotected_admin_route:${item.file}`),
  ...sensitiveApiFindings.filter((item) => item.readsBody && !item.hasValidation).map((item) => `missing_validation:${item.file}`),
  ...secretFindings.map((item) => `possible_secret:${item.file}`),
  ...sensitiveLogFindings.map((item) => `sensitive_console:${item.file}`),
];

const report = {
  generatedAt: new Date().toISOString(),
  ok: failures.length === 0,
  headers: headerChecks,
  uploads: uploadChecks,
  adminRoutes: adminRouteFindings,
  sensitiveApis: sensitiveApiFindings,
  possibleSecrets: secretFindings,
  sensitiveLogs: sensitiveLogFindings,
  failures,
};

writeReport(report);

if (failures.length) {
  console.error(`Falha na auditoria de seguranca: ${failures.length} achados criticos.`);
  failures.slice(0, 20).forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("OK: auditoria de seguranca sem achados criticos.");
