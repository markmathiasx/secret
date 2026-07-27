#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = process.cwd();
const baseUrl = (process.env.MARKETPLACE_BASE_URL || process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const localSecrets = {
  AUTH_SECRET: process.env.AUTH_SECRET || "local-browser-gate-auth-secret-at-least-32-characters",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "local-browser-gate-auth-secret-at-least-32-characters",
  AUTH_CUSTOMER_SESSION_SECRET:
    process.env.AUTH_CUSTOMER_SESSION_SECRET || "local-browser-gate-customer-secret-at-least-32-characters",
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET || "local-browser-gate-admin-secret-at-least-32-characters",
  AUTH_URL: process.env.AUTH_URL || baseUrl,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || baseUrl,
  PORT: process.env.PORT || new URL(baseUrl).port || "3000",
};

async function responds() {
  try {
    const response = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(5_000) });
    const text = await response.text();
    return response.ok && text.trim().length > 0;
  } catch {
    return false;
  }
}

function npmInvocation(script) {
  if (process.platform === "win32") {
    return { command: "cmd.exe", args: ["/d", "/s", "/c", "npm", "run", script] };
  }
  return { command: "npm", args: ["run", script] };
}

function runNpmScript(script, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const invocation = npmInvocation(script);
    const child = spawn(invocation.command, invocation.args, {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        ...localSecrets,
        MARKETPLACE_BASE_URL: baseUrl,
        BASE_URL: baseUrl,
        SMOKE_BASE_URL: baseUrl,
        PLAYWRIGHT_SKIP_WEBSERVER: "1",
        ...extraEnv,
      },
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} failed with ${signal || code}`));
    });
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (await responds()) return;
    if (server.exitCode !== null) {
      throw new Error(`npm run start exited before ${baseUrl} responded`);
    }
    await delay(2_000);
  }
  throw new Error(`Timed out waiting for ${baseUrl}`);
}

function stopServer(server) {
  if (!server || server.exitCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  server.kill("SIGTERM");
}

async function main() {
  let server = null;
  let ownsServer = false;

  if (!(await responds())) {
    console.log(`Starting production server for browser gates at ${baseUrl}`);
    const invocation = npmInvocation("start");
    server = spawn(invocation.command, invocation.args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, ...localSecrets, MARKETPLACE_BASE_URL: baseUrl, BASE_URL: baseUrl },
    });
    ownsServer = true;
    await waitForServer(server);
  } else {
    console.log(`Reusing existing server at ${baseUrl}`);
  }

  try {
    await runNpmScript("marketplace:axe");
    await runNpmScript("marketplace:lighthouse");
    await runNpmScript("test:images");
    await runNpmScript("test:e2e");
  } finally {
    if (ownsServer) stopServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
