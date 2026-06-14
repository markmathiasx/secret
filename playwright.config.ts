import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const useSystemChrome = process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === "1";

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
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(useSystemChrome ? { channel: "chrome" } : {}) },
    },
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
});
