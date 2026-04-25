#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const port = new URL(baseUrl).port || "3000";
const hostname = new URL(baseUrl).hostname || "127.0.0.1";

const preServerChecks = [
  ["lint:check", ["npm", ["run", "lint:check"]]],
  ["typecheck", ["npm", ["run", "typecheck"]]],
  ["build", ["npm", ["run", "build"]]],
  ["validate:assets", ["npm", ["run", "validate:assets"]]],
];

const requiredFiles = [
  "app/page.tsx",
  "app/catalogo/page.tsx",
  "app/checkout/page.tsx",
  "app/admin/page.tsx",
  "app/robots.ts",
  "app/sitemap.ts",
  "scripts/validate-assets.mjs",
  "tests/storefront-images.spec.ts",
];

const requiredEnv = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "MERCADOPAGO_ACCESS_TOKEN",
  "NEXT_PUBLIC_MP_PUBLIC_KEY",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_ACCESS_TOKEN",
];

let failures = 0;

function runCommand(name, command, options = {}) {
  console.log(`\nRunning ${name}...`);
  const [rawCmd, args] = command;
  const cmd = process.platform === "win32" && rawCmd === "npm" ? "cmd.exe" : rawCmd;
  const finalArgs = process.platform === "win32" && rawCmd === "npm" ? ["/d", "/s", "/c", rawCmd, ...args] : args;
  const result = spawnSync(cmd, finalArgs, {
    stdio: "inherit",
    env: { ...process.env, ...options.env },
  });

  if (result.status !== 0) {
    failures += 1;
    if (result.error) console.error(result.error.message);
    console.error(`FAILED ${name}`);
    return false;
  }

  console.log(`OK ${name}`);
  return true;
}

async function isServerHealthy() {
  try {
    const res = await fetch(baseUrl, { method: "HEAD" });
    return res.ok || res.status === 405;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isServerHealthy()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function withServer(callback) {
  if (await isServerHealthy()) {
    console.log(`Using existing server at ${baseUrl}`);
    return callback();
  }

  console.log(`Starting local server at ${baseUrl}...`);
  const startCmd = process.platform === "win32" ? "cmd.exe" : "npm";
  const startArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", "run", "start"] : ["run", "start"];
  const child = spawn(startCmd, startArgs, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: port,
      HOSTNAME: hostname,
      AUTH_SECRET: process.env.AUTH_SECRET || "local-smoke-auth-secret-do-not-use-in-production",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "local-smoke-nextauth-secret-do-not-use-in-production",
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "local-smoke-admin-secret-do-not-use-in-production",
      AUTH_CUSTOMER_SESSION_SECRET:
        process.env.AUTH_CUSTOMER_SESSION_SECRET || "local-smoke-customer-secret-do-not-use-in-production",
    },
  });

  try {
    const healthy = await waitForServer();
    if (!healthy) {
      failures += 1;
      console.error(`FAILED local server did not become healthy at ${baseUrl}`);
      return false;
    }

    return await callback();
  } finally {
    if (process.platform === "win32" && child.pid) {
      spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
    } else if (!child.killed) {
      child.kill("SIGTERM");
    }
  }
}

console.log("MDH 3D Store - Ultimate pre-deploy check\n");

for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`OK file ${file}`);
  } else {
    failures += 1;
    console.error(`MISSING file ${file}`);
  }
}

for (const key of requiredEnv) {
  if (process.env[key]) {
    console.log(`OK env ${key}`);
  } else {
    console.warn(`WARN env ${key} not set in this shell`);
  }
}

for (const [name, command] of preServerChecks) {
  if (!runCommand(name, command)) break;
}

if (failures === 0) {
  await withServer(async () =>
    runCommand("test:images", ["npm", ["run", "test:images"]], {
      env: { SMOKE_BASE_URL: baseUrl },
    })
  );
}

if (failures > 0) {
  console.error(`\nPre-deploy blocked: ${failures} failing check(s).`);
  process.exit(1);
}

console.log("\nPre-deploy passed. Ready for a controlled deploy.");
