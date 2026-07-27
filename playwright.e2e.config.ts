import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || process.env.SMOKE_BASE_URL || "http://localhost:3000";
const systemChromePath = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean).find((candidate) => existsSync(candidate));
const useSystemChrome =
  process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === "1" ||
  (process.env.PLAYWRIGHT_USE_SYSTEM_CHROME !== "0" && Boolean(systemChromePath));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/e2e-results.json" }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" } : {}) },
    },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1"
    ? undefined
    : {
        command: "npm run start",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          AUTH_SECRET: process.env.AUTH_SECRET || "local-e2e-auth-secret-at-least-32-characters",
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "local-e2e-auth-secret-at-least-32-characters",
          AUTH_CUSTOMER_SESSION_SECRET:
            process.env.AUTH_CUSTOMER_SESSION_SECRET || "local-e2e-customer-secret-at-least-32-characters",
          ADMIN_SESSION_SECRET:
            process.env.ADMIN_SESSION_SECRET || "local-e2e-admin-secret-at-least-32-characters",
          AUTH_URL: process.env.AUTH_URL || BASE_URL,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL || BASE_URL,
        },
      },
  timeout: 30_000,
  expect: { timeout: 10_000 },
});
