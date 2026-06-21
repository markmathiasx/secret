import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const policyPath = path.join(root, "data/backupops/backup-policy.json");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupRoot = path.join(root, policy.backupDir, stamp);
fs.mkdirSync(backupRoot, { recursive: true });

const files = [];
for (const relative of policy.catalogFiles) {
  const source = path.join(root, relative);
  if (!fs.existsSync(source)) {
    files.push({ source: relative, copied: false, reason: "missing" });
    continue;
  }
  const target = path.join(backupRoot, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  files.push({
    source: relative,
    target: path.relative(root, target).replaceAll("\\", "/"),
    copied: true,
    bytes: fs.statSync(source).size,
  });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  backupId: stamp,
  mode: "manual-safe",
  files,
  ok: files.some((file) => file.copied),
};

const manifestPath = path.join(backupRoot, "manifest.json");
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports/commerce-os-backup-report.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Backup catalog generated: ${path.relative(root, manifestPath).replaceAll("\\", "/")}`);
