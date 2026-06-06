import fs from "node:fs";
import path from "node:path";
import { writeJson } from "./catalog/ts-runtime.mjs";

const ROOT = process.cwd();

const requiredFiles = [
  "lib/design/industrial-tokens.ts",
  "components/ui/IndustrialShell.tsx",
  "components/ui/IndustrialHeader.tsx",
  "components/ui/IndustrialFooter.tsx",
  "components/ui/IndustrialCard.tsx",
  "components/ui/IndustrialButton.tsx",
  "components/ui/IndustrialInput.tsx",
  "components/ui/IndustrialBadge.tsx",
  "components/ui/IndustrialSection.tsx",
  "components/ui/IndustrialEmptyState.tsx",
  "components/ui/IndustrialLoading.tsx",
  "components/ui/IndustrialError.tsx",
  "app/admin/quotes/page.tsx",
  "app/admin/storage/page.tsx",
  "app/admin/audit/page.tsx",
  "app/admin/support/page.tsx",
];

const errors = [];
const files = requiredFiles.map((file) => {
  const exists = fs.existsSync(path.join(ROOT, file));
  if (!exists) errors.push({ code: "missing_file", file });
  return { file, exists };
});

const globals = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
for (const className of [
  ".industrial-page",
  ".industrial-shell",
  ".industrial-card",
  ".industrial-button",
  ".industrial-input",
  ".industrial-badge",
]) {
  if (!globals.includes(className)) {
    errors.push({ code: "missing_css_class", className });
  }
}

for (const page of ["app/admin/quotes/page.tsx", "app/admin/storage/page.tsx", "app/admin/audit/page.tsx", "app/admin/support/page.tsx"]) {
  const source = fs.readFileSync(path.join(ROOT, page), "utf8");
  if (!source.includes("IndustrialShell") || !source.includes("IndustrialHeader")) {
    errors.push({ code: "admin_page_not_using_industrial_ui", page });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  files,
  errors,
};

writeJson("reports/industrial-ui-validation-report.json", report);

if (errors.length) {
  console.error(`Falha: ${errors.length} erro(s) na fundacao visual industrial.`);
  process.exit(1);
}

console.log("OK: fundacao visual industrial validada.");
