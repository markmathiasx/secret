#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const startedAt = new Date().toISOString();
const reportPath = path.join(ROOT, "reports", "vercel-deploy-report.json");
const token = String(process.env.VERCEL_TOKEN || "").trim();
const smokeBaseUrl = String(process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.mdh3d.com.br").trim();

function commandFor(rawCommand, args) {
  if (process.platform === "win32" && rawCommand === "npm") {
    return ["cmd.exe", ["/d", "/s", "/c", rawCommand, ...args]];
  }
  return [rawCommand, args];
}

function vercelArgs(args) {
  return token ? [...args, `--token=${token}`] : args;
}

function run(name, rawCommand, args, options = {}) {
  console.log(`\n${name}`);
  const [command, finalArgs] = commandFor(rawCommand, args);
  const result = spawnSync(command, finalArgs, {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  return {
    name,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error?.message || "",
    ok: result.status === 0,
  };
}

function stepFor(result) {
  return {
    name: result.name,
    status: result.status,
    ...(result.error ? { error: result.error } : {}),
  };
}

function writeReport(report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function extractDeploymentUrl(output) {
  const urls = output.match(/https:\/\/[^\s]+/g) || [];
  const deployment = [...urls].reverse().find((url) => /\.vercel\.app(?:\/)?$/i.test(url.replace(/[),.]+$/, "")));
  return deployment ? deployment.replace(/[),.]+$/, "") : null;
}

const steps = [];

const cli = run("Vercel CLI preflight", "vercel", ["--version"], { capture: true });
process.stdout.write(cli.stdout);
process.stderr.write(cli.stderr);
steps.push(stepFor(cli));
if (!cli.ok) {
  writeReport({
    generatedAt: new Date().toISOString(),
    startedAt,
    ok: false,
    blockedAt: "vercel cli",
    deploymentUrl: null,
    smokeBaseUrl,
    rollbackAttempted: false,
    steps,
  });
  process.exit(cli.status || 1);
}

const pull = run("Vercel pull production env", "vercel", vercelArgs(["pull", "--yes", "--environment=production"]));
steps.push(stepFor(pull));
if (!pull.ok) {
  writeReport({
    generatedAt: new Date().toISOString(),
    startedAt,
    ok: false,
    blockedAt: "vercel pull",
    deploymentUrl: null,
    smokeBaseUrl,
    rollbackAttempted: false,
    steps,
  });
  process.exit(pull.status || 1);
}

const readiness = run("Production readiness", "npm", ["run", "production:readiness"]);
steps.push(stepFor(readiness));
if (!readiness.ok) {
  writeReport({
    generatedAt: new Date().toISOString(),
    startedAt,
    ok: false,
    blockedAt: "production:readiness",
    deploymentUrl: null,
    smokeBaseUrl,
    rollbackAttempted: false,
    steps,
  });
  process.exit(readiness.status || 1);
}

const build = run("Vercel build production", "vercel", vercelArgs(["build", "--prod"]));
steps.push(stepFor(build));
if (!build.ok) {
  writeReport({
    generatedAt: new Date().toISOString(),
    startedAt,
    ok: false,
    blockedAt: "vercel build",
    deploymentUrl: null,
    smokeBaseUrl,
    rollbackAttempted: false,
    steps,
  });
  process.exit(build.status || 1);
}

const deploy = run("Vercel deploy production", "vercel", vercelArgs(["deploy", "--prebuilt", "--prod"]), { capture: true });
process.stdout.write(deploy.stdout);
process.stderr.write(deploy.stderr);
steps.push(stepFor(deploy));
const deploymentUrl = extractDeploymentUrl(`${deploy.stdout}\n${deploy.stderr}`);

if (!deploy.ok) {
  writeReport({
    generatedAt: new Date().toISOString(),
    startedAt,
    ok: false,
    blockedAt: "vercel deploy",
    deploymentUrl,
    smokeBaseUrl,
    rollbackAttempted: false,
    steps,
  });
  process.exit(deploy.status || 1);
}

const smoke = run("Production smoke test", "npm", ["run", "test:smoke:prod"], {
  env: { SMOKE_BASE_URL: smokeBaseUrl || deploymentUrl || "" },
});
steps.push(stepFor(smoke));

let rollback = null;
if (!smoke.ok) {
  const rollbackArgs = deploymentUrl
    ? ["rollback", deploymentUrl, "--yes", "--timeout", "120s"]
    : ["rollback", "--yes", "--timeout", "120s"];
  rollback = run("Vercel rollback after failed smoke", "vercel", vercelArgs(rollbackArgs), { capture: true });
  process.stdout.write(rollback.stdout);
  process.stderr.write(rollback.stderr);
  steps.push(stepFor(rollback));
}

const ok = deploy.ok && smoke.ok;
writeReport({
  generatedAt: new Date().toISOString(),
  startedAt,
  ok,
  deploymentUrl,
  smokeBaseUrl,
  rollbackAttempted: Boolean(rollback),
  rollbackExitCode: rollback?.status ?? null,
  steps,
});

if (!ok) {
  console.error("Production deploy failed post-deploy smoke; rollback was requested.");
  process.exit(smoke.status || 1);
}

console.log(`Production deploy verified: ${deploymentUrl || smokeBaseUrl}`);
