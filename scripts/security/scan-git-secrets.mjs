#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "reports", "git-secret-scan-report.json");

const detectors = [
  { id: "openai_key", pattern: /\b(?:sk-proj-[A-Za-z0-9_-]{24,}|sk-[A-Za-z0-9]{32,})\b/g, gitPattern: "(sk-proj-[A-Za-z0-9_-]{24,}|sk-[A-Za-z0-9]{32,})" },
  { id: "github_pat", pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/g, gitPattern: "gh[pousr]_[A-Za-z0-9_]{30,}" },
  { id: "aws_access_key", pattern: /\bAKIA[0-9A-Z]{16}\b/g, gitPattern: "AKIA[0-9A-Z]{16}" },
  { id: "slack_token", pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/g, gitPattern: "xox[baprs]-[A-Za-z0-9-]{20,}" },
  { id: "google_api_key", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g, gitPattern: "AIza[0-9A-Za-z_-]{35}" },
  { id: "private_key_block", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g, gitPattern: "BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY" },
  { id: "mercadopago_token", pattern: /\bAPP_USR-[0-9A-Za-z_-]{20,}\b/g, gitPattern: "APP_USR-[0-9A-Za-z_-]{20,}" },
];

const ignoredPath = /(^|\/)(node_modules|\.next|\.vercel|test-results|reports|coverage)\//;
const ignoredFile = /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|tsconfig\.typecheck\.tsbuildinfo|estrutura\.txt)$/;

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 80 * 1024 * 1024 }).trim();
}

function redacted(match) {
  if (!match) return "";
  if (match.length <= 10) return "***";
  return `${match.slice(0, 5)}...${match.slice(-4)}`;
}

function isPlaceholderLine(line) {
  return /(<[^>]+>|x{4,}|placeholder|example|dummy|sample|seu-|sua-)/i.test(line);
}

function trackedFiles() {
  return git(["ls-files", "-z"])
    .split("\0")
    .filter(Boolean)
    .filter((file) => !ignoredPath.test(file.replaceAll("\\", "/")) && !ignoredFile.test(file));
}

function scanCurrent() {
  const findings = [];
  for (const file of trackedFiles()) {
    const absolute = path.join(root, file);
    if (!existsSync(absolute)) continue;
    if (statSync(absolute).isDirectory()) continue;
    const source = readFileSync(absolute, "utf8");
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const detector of detectors) {
        detector.pattern.lastIndex = 0;
        if (isPlaceholderLine(line)) continue;
        const matches = [...line.matchAll(detector.pattern)];
        for (const match of matches) {
          findings.push({
            scope: "current",
            detector: detector.id,
            file: file.replaceAll("\\", "/"),
            line: index + 1,
            sample: redacted(match[0]),
          });
        }
      }
    });
  }
  return findings;
}

function scanHistory() {
  const findings = [];
  const commits = git(["rev-list", "--all"]).split(/\r?\n/).filter(Boolean);
  const combinedPattern = detectors.map((detector) => `(${detector.gitPattern})`).join("|");
  const result = spawnSync("git", ["grep", "-I", "-n", "-E", combinedPattern, ...commits, "--", "."], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 80 * 1024 * 1024,
  });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`.trim();
  if (!output) return { findings, truncated: false, commitsScanned: commits.length };

  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^([0-9a-f]{7,40}):(.+?):(\d+):(.*)$/);
    if (!match) continue;
    const file = match[2].replaceAll("\\", "/");
    const sourceLine = match[4] || "";
    if (ignoredPath.test(file) || ignoredFile.test(file) || isPlaceholderLine(sourceLine)) continue;
    for (const detector of detectors) {
      detector.pattern.lastIndex = 0;
      const found = sourceLine.match(detector.pattern)?.[0];
      if (!found) continue;
      findings.push({
        scope: "history",
        detector: detector.id,
        commit: match[1].slice(0, 12),
        file,
        line: Number(match[3]),
        sample: redacted(found),
      });
      break;
    }
    if (findings.length >= 200) return { findings, truncated: true, commitsScanned: commits.length };
  }
  return { findings, truncated: false, commitsScanned: commits.length };
}

function main() {
  const currentFindings = scanCurrent();
  const history = scanHistory();
  const report = {
    generatedAt: new Date().toISOString(),
    detectors: detectors.map((detector) => detector.id),
    currentFindings,
    historyFindings: history.findings,
    historyTruncated: history.truncated,
    commitsScanned: history.commitsScanned,
    ok: currentFindings.length === 0 && history.findings.length === 0,
  };

  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (!report.ok) {
    console.error(`Secret scan found ${currentFindings.length} current and ${history.findings.length} historical high-confidence finding(s).`);
    console.error(`Report: ${path.relative(root, reportPath).replaceAll("\\", "/")}`);
    process.exitCode = 1;
    return;
  }

  console.log(`OK: secret scan found 0 current and 0 historical high-confidence findings (${history.commitsScanned} commits scanned).`);
}

main();
