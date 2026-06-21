import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestArg = process.argv.find((arg) => arg.startsWith("--manifest="));

function latestManifest() {
  const backupsDir = path.join(root, "data/priceops/backups");
  if (!fs.existsSync(backupsDir)) return null;
  const candidates = fs
    .readdirSync(backupsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(backupsDir, entry.name, "manifest.json"))
    .filter((file) => fs.existsSync(file))
    .sort();
  return candidates.at(-1) || null;
}

const dryRun = process.argv.includes("--dry-run");
const manifestPath = manifestArg
  ? path.resolve(root, manifestArg.slice("--manifest=".length))
  : latestManifest();
if (!manifestPath) {
  console.error("No backup manifest found. Run npm run commerce-os:backup first.");
  process.exit(1);
}
if (!manifestPath.startsWith(path.resolve(root, "data/priceops/backups"))) {
  console.error("Rollback manifest must be inside data/priceops/backups.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const actions = [];

for (const file of manifest.files || []) {
  if (!file.copied || !file.target) continue;
  const source = path.resolve(root, file.target);
  const target = path.resolve(root, file.source);
  if (!source.startsWith(path.resolve(root, "data/priceops/backups"))) {
    actions.push({ source: file.target, target: file.source, ok: false, reason: "unsafe source" });
    continue;
  }
  if (!target.startsWith(path.resolve(root, "data"))) {
    actions.push({ source: file.target, target: file.source, ok: false, reason: "unsafe target" });
    continue;
  }
  actions.push({ source: file.target, target: file.source, ok: true, applied: !dryRun });
  if (!dryRun) {
    fs.copyFileSync(source, target);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  manifest: path.relative(root, manifestPath).replaceAll("\\", "/"),
  dryRun,
  actions,
  ok: actions.every((action) => action.ok),
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/commerce-os-rollback-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`${dryRun ? "Dry-run" : "Rollback"} report: reports/commerce-os-rollback-report.json`);

if (!report.ok) process.exit(1);
