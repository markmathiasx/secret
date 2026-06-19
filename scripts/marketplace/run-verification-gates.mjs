#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportDir = path.join(root, "reports");

const commands = [
  { command: "npm run db:generate", timeoutMs: 5 * 60 * 1000 },
  { command: "npm run typecheck", timeoutMs: 8 * 60 * 1000 },
  { command: "npm run lint:check", timeoutMs: 8 * 60 * 1000 },
  { command: "npm run build", timeoutMs: 12 * 60 * 1000 },
  { command: "npm run validate:industrial-ui", timeoutMs: 5 * 60 * 1000 },
  { command: "npm run validate:auth", timeoutMs: 5 * 60 * 1000 },
  { command: "npm run validate:db-storage", timeoutMs: 5 * 60 * 1000 },
  { command: "npm run validate:private-routes", timeoutMs: 5 * 60 * 1000 },
  { command: "npm run validate:public-regressions", timeoutMs: 8 * 60 * 1000 },
  { command: "npm run security:audit", timeoutMs: 5 * 60 * 1000 },
  { command: "npm audit --audit-level=low", timeoutMs: 5 * 60 * 1000 },
];

function git(args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : "";
}

function normalizeOutput(value) {
  return String(value || "").replace(/\r/g, "");
}

function tail(value, maxLines = 80) {
  const lines = normalizeOutput(value).split("\n");
  return lines.slice(Math.max(0, lines.length - maxLines)).join("\n").trim();
}

function run(command, timeoutMs) {
  const startedAt = Date.now();
  console.log(`[marketplace-gate] running: ${command}`);
  const result = spawnSync(command, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    timeout: timeoutMs,
    maxBuffer: 80 * 1024 * 1024,
    env: { ...process.env, CI: process.env.CI || "1" },
  });

  const durationMs = Date.now() - startedAt;
  const exitCode = result.error?.code === "ETIMEDOUT" ? 124 : result.status ?? 1;
  const entry = {
    command,
    exitCode,
    durationMs,
    timedOut: result.error?.code === "ETIMEDOUT",
    stdoutTail: tail(result.stdout),
    stderrTail: tail(result.stderr),
  };

  const status = exitCode === 0 ? "PASS" : "FAIL";
  console.log(`[marketplace-gate] ${status}: ${command} (${Math.round(durationMs / 1000)}s, exit ${exitCode})`);
  if (exitCode !== 0) {
    const evidence = tail(`${result.stderr}\n${result.stdout}`, 20);
    if (evidence) console.log(evidence);
  }

  return entry;
}

function ensureReportDir() {
  if (!existsSync(reportDir)) mkdirSync(reportDir, { recursive: true });
}

function writeReports(report) {
  ensureReportDir();
  writeFileSync(path.join(reportDir, "marketplace-verification-gates.json"), `${JSON.stringify(report, null, 2)}\n`);

  const md = [];
  md.push("# Marketplace Verification Gates");
  md.push("");
  md.push(`Generated at: ${report.generatedAt}`);
  md.push(`Branch: ${report.branch}`);
  md.push(`Commit: ${report.commit}`);
  md.push("");
  md.push("| Command | Exit code | Duration | Result |");
  md.push("| --- | ---: | ---: | --- |");
  for (const command of report.commands) {
    const result = command.exitCode === 0 ? "PASS" : command.timedOut ? "TIMEOUT" : "FAIL";
    md.push(`| \`${command.command}\` | ${command.exitCode} | ${Math.round(command.durationMs / 1000)}s | ${result} |`);
  }
  md.push("");
  md.push("## Evidence tails");
  for (const command of report.commands) {
    md.push("");
    md.push(`### ${command.command}`);
    md.push("");
    md.push(`Exit code: ${command.exitCode}`);
    md.push("");
    md.push("```text");
    md.push(command.exitCode === 0 ? command.stdoutTail || command.stderrTail || "(no output)" : `${command.stderrTail}\n${command.stdoutTail}`.trim() || "(no output)");
    md.push("```");
  }
  md.push("");
  while (md.at(-1) === "") md.pop();
  writeFileSync(path.join(reportDir, "marketplace-verification-gates.md"), `${md.join("\n")}\n`);
}

function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    branch: git(["branch", "--show-current"]) || "unknown",
    commit: git(["rev-parse", "--short", "HEAD"]) || "unknown",
    commands: [],
  };

  for (const item of commands) {
    report.commands.push(run(item.command, item.timeoutMs));
  }

  writeReports(report);
  const failed = report.commands.filter((command) => command.exitCode !== 0);
  if (failed.length) {
    console.error(`[marketplace-gate] ${failed.length} command(s) failed. Report written to reports/marketplace-verification-gates.md`);
    process.exitCode = 1;
    return;
  }

  console.log("[marketplace-gate] all commands passed");
}

main();
