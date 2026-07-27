import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const systemChromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const useSystemChrome = process.env.PLAYWRIGHT_USE_SYSTEM_CHROME !== "0" && existsSync(systemChromePath);
const shouldStartLocalServer = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(BASE_URL);
const webServerCommand = process.platform === "win32" ? "cmd.exe /d /s /c npm run start" : "npm run start";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/smoke-results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: shouldStartLocalServer
    ? {
        command: webServerCommand,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          AUTH_SECRET: process.env.AUTH_SECRET || "local-playwright-auth-secret-do-not-use-in-production",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "local-playwright-auth-secret-do-not-use-in-production",
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || BASE_URL,
        },
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" } : {}) },
    },
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
});
