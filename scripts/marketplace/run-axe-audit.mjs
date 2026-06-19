#!/usr/bin/env node
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportJson = path.join(root, "reports", "marketplace-axe-report.json");
const reportMd = path.join(root, "reports", "marketplace-axe-report.md");
const baseUrl = (process.env.MARKETPLACE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const pages = [
  { key: "home", path: "/" },
  { key: "catalog", path: "/catalogo" },
  { key: "smart_store", path: "/loja" },
  { key: "product", path: "/produto/chaveiro-rubro-negro-3d" },
  { key: "checkout", path: "/checkout" },
  { key: "games", path: "/jogue" },
];

const viewports = [
  { key: "mobile", width: 390, height: 844 },
  { key: "desktop", width: 1366, height: 900 },
];

function chromeExecutablePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: "chrome", headless: true });
  } catch {
    const executablePath = chromeExecutablePath();
    if (executablePath) return chromium.launch({ executablePath, headless: true });
    return chromium.launch({ headless: true });
  }
}

async function checkSkipLink(page) {
  const skip = page.locator('a[href="#main-content"]').first();
  const exists = (await skip.count()) > 0;
  if (!exists) return { exists: false, firstTabFocusesSkip: false, enterMovesToMain: false };

  await page.keyboard.press("Tab");
  const firstTabFocusesSkip = await skip.evaluate((node) => document.activeElement === node).catch(() => false);
  await page.keyboard.press("Enter");
  const enterMovesToMain = await page.evaluate(() => document.activeElement?.id === "main-content").catch(() => false);
  return { exists, firstTabFocusesSkip, enterMovesToMain };
}

async function auditPage(browser, pageSpec, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const url = `${baseUrl}${pageSpec.path}`;
  const result = {
    page: pageSpec.key,
    viewport: viewport.key,
    url,
    ok: false,
    status: null,
    bodyTextLength: 0,
    frameworkOverlay: false,
    skipLink: null,
    violationCount: 0,
    seriousOrCritical: 0,
    violations: [],
    error: null,
  };

  try {
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    result.status = response?.status() ?? null;
    result.bodyTextLength = await page.evaluate(() => document.body.innerText.trim().length);
    result.frameworkOverlay = await page.evaluate(() => Boolean(document.querySelector("[data-nextjs-dialog], .nextjs-toast, .vite-error-overlay")));
    result.skipLink = await checkSkipLink(page);
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    result.violationCount = axe.violations.length;
    result.seriousOrCritical = axe.violations.filter((item) => item.impact === "serious" || item.impact === "critical").length;
    result.violations = axe.violations.map((item) => ({
      id: item.id,
      impact: item.impact,
      description: item.description,
      nodes: item.nodes.length,
      helpUrl: item.helpUrl,
    }));
    result.ok = result.status === 200 && result.bodyTextLength > 0 && !result.frameworkOverlay;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  } finally {
    await page.close().catch(() => undefined);
    await context.close().catch(() => undefined);
  }

  return result;
}

function writeReports(report) {
  mkdirSync(path.dirname(reportJson), { recursive: true });
  writeFileSync(reportJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    "# Marketplace Axe Report",
    "",
    `Generated at: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    "",
    "| Page | Viewport | Status | Body | Violations | Serious/Critical | Skip link |",
    "| --- | --- | ---: | ---: | ---: | ---: | --- |",
  ];
  for (const item of report.results) {
    const skip = item.skipLink
      ? `${item.skipLink.exists ? "exists" : "missing"}/${item.skipLink.firstTabFocusesSkip ? "tab-ok" : "tab-fail"}/${item.skipLink.enterMovesToMain ? "enter-ok" : "enter-fail"}`
      : "-";
    lines.push(`| ${item.page} | ${item.viewport} | ${item.status ?? "-"} | ${item.bodyTextLength} | ${item.violationCount} | ${item.seriousOrCritical} | ${skip} |`);
  }
  lines.push("");
  const top = report.results.flatMap((item) => item.violations.map((violation) => ({ ...violation, page: item.page, viewport: item.viewport }))).slice(0, 20);
  if (top.length) {
    lines.push("## First violations");
    for (const violation of top) {
      lines.push(`- ${violation.page}/${violation.viewport}: ${violation.id} (${violation.impact}, nodes ${violation.nodes})`);
    }
  }
  writeFileSync(reportMd, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const browser = await launchBrowser();
  const results = [];
  try {
    for (const viewport of viewports) {
      for (const page of pages) {
        results.push(await auditPage(browser, page, viewport));
      }
    }
  } finally {
    await browser.close().catch(() => undefined);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    results,
    ok: results.every((item) => item.ok),
    totalViolations: results.reduce((sum, item) => sum + item.violationCount, 0),
    seriousOrCritical: results.reduce((sum, item) => sum + item.seriousOrCritical, 0),
    skipLinkOk: results.filter((item) => item.page === "home").every((item) => item.skipLink?.exists && item.skipLink?.firstTabFocusesSkip && item.skipLink?.enterMovesToMain),
  };

  writeReports(report);
  console.log(`Axe audit written to ${path.relative(root, reportMd).replaceAll("\\", "/")}`);
  if (!report.ok || report.seriousOrCritical > 0 || !report.skipLinkOk) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
