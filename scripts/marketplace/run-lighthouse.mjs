#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const reportDir = path.join(root, "reports", "lighthouse");
const summaryJson = path.join(root, "reports", "marketplace-lighthouse-summary.json");
const summaryMd = path.join(root, "reports", "marketplace-lighthouse-summary.md");
const baseUrl = (process.env.MARKETPLACE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

const pages = [
  { key: "home", label: "home", path: "/" },
  { key: "category", label: "categoria", path: "/catalogo/categoria/geek-colecionaveis" },
  { key: "product", label: "produto", path: "/catalogo/mdh-016-chaveiro-3d-personalizado-com-nome-ou-logo" },
  { key: "catalog", label: "catalogo", path: "/catalogo" },
  { key: "checkout", label: "checkout", path: "/checkout" },
];

function chromePath() {
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

function score(value) {
  return typeof value === "number" ? Math.round(value * 100) : null;
}

function auditValue(lhr, id) {
  const audit = lhr.audits?.[id];
  if (!audit) return null;
  return {
    title: audit.title,
    score: audit.score,
    numericValue: typeof audit.numericValue === "number" ? audit.numericValue : null,
    displayValue: audit.displayValue || "",
  };
}

function readResult(file) {
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  return {
    finalUrl: lhr.finalUrl,
    fetchTime: lhr.fetchTime,
    categories: {
      performance: score(lhr.categories?.performance?.score),
      accessibility: score(lhr.categories?.accessibility?.score),
      bestPractices: score(lhr.categories?.["best-practices"]?.score),
      seo: score(lhr.categories?.seo?.score),
    },
    audits: {
      lcp: auditValue(lhr, "largest-contentful-paint"),
      cls: auditValue(lhr, "cumulative-layout-shift"),
      tbt: auditValue(lhr, "total-blocking-time"),
      inp: auditValue(lhr, "experimental-interaction-to-next-paint"),
    },
  };
}

function hasValidScores(result) {
  return (
    result.finalUrl &&
    !String(result.finalUrl).startsWith("chrome-error:") &&
    typeof result.categories?.performance === "number" &&
    typeof result.categories?.accessibility === "number" &&
    typeof result.categories?.bestPractices === "number" &&
    typeof result.categories?.seo === "number"
  );
}

function runPage(page, chrome) {
  const outputPath = path.join(reportDir, `${page.key}.json`);
  const url = `${baseUrl}${page.path}`;
  const startedAt = Date.now();

  const attempts = [
    path.join(root, "tmp", `lighthouse-${page.key}`),
    path.join(tmpdir(), `mdh-lighthouse-${page.key}-${Date.now()}`),
  ];
  let lastError = "lighthouse failed";

  for (const tempDir of attempts) {
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });
    const args = [
      "--yes",
      "--package",
      "lighthouse",
      "lighthouse",
      url,
      "--quiet",
      "--output=json",
      `--output-path=${outputPath}`,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
    ];
    if (chrome) args.push(`--chrome-path=${chrome}`);
    const command = [npxBin, ...args.map((arg) => `"${String(arg).replaceAll('"', '\\"')}"`)].join(" ");
    const result = spawnSync(command, {
      cwd: root,
      encoding: "utf8",
      shell: true,
      timeout: 180_000,
      maxBuffer: 20 * 1024 * 1024,
      env: { ...process.env, TMP: tempDir, TEMP: tempDir },
    });

    if (result.status === 0 && existsSync(outputPath)) {
      const parsed = readResult(outputPath);
      return {
        ...page,
        url,
        ok: hasValidScores(parsed),
        warning: hasValidScores(parsed) ? undefined : "Lighthouse did not load a valid application page.",
        durationMs: Date.now() - startedAt,
        reportPath: path.relative(root, outputPath).replaceAll("\\", "/"),
        ...parsed,
      };
    }

    lastError = result.error?.message || result.stderr || result.stdout || "lighthouse failed";
  }

  if (existsSync(outputPath)) {
    const parsed = readResult(outputPath);
    return {
      ...page,
      url,
      ok: hasValidScores(parsed),
      warning: lastError.slice(-1000),
      durationMs: Date.now() - startedAt,
      reportPath: path.relative(root, outputPath).replaceAll("\\", "/"),
      ...parsed,
    };
  }

  return {
    ...page,
    url,
    ok: false,
    durationMs: Date.now() - startedAt,
    error: lastError.slice(-3000),
  };
}

function writeReports(report) {
  mkdirSync(path.dirname(summaryJson), { recursive: true });
  writeFileSync(summaryJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const lines = [
    "# Marketplace Lighthouse Summary",
    "",
    `Generated at: ${report.generatedAt}`,
    `Base URL: ${report.baseUrl}`,
    `Chrome: ${report.chromePath || "auto"}`,
    "",
    "| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | Status |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |",
  ];

  for (const item of report.pages) {
    lines.push(
      `| ${item.label} | ${item.categories?.performance ?? "-"} | ${item.categories?.accessibility ?? "-"} | ${item.categories?.bestPractices ?? "-"} | ${item.categories?.seo ?? "-"} | ${item.audits?.lcp?.displayValue ?? "-"} | ${item.audits?.cls?.displayValue ?? "-"} | ${item.audits?.tbt?.displayValue ?? "-"} | ${item.ok ? "OK" : `FAIL: ${(item.error || "").replace(/\s+/g, " ").slice(0, 120)}`} |`
    );
  }

  lines.push("");
  writeFileSync(summaryMd, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  mkdirSync(reportDir, { recursive: true });
  const chrome = chromePath();
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    chromePath: chrome || null,
    pages: pages.map((page) => runPage(page, chrome)),
  };
  report.ok = report.pages.every((page) => page.ok);
  report.allTargetsMet = report.pages.every((page) =>
    page.ok &&
    page.categories.performance >= 95 &&
    page.categories.accessibility >= 95 &&
    page.categories.bestPractices >= 95 &&
    page.categories.seo >= 95 &&
    (page.audits.lcp?.numericValue ?? Number.POSITIVE_INFINITY) <= 2500 &&
    (page.audits.cls?.numericValue ?? Number.POSITIVE_INFINITY) <= 0.1
  );

  writeReports(report);
  console.log(`Lighthouse audit written to ${path.relative(root, summaryMd).replaceAll("\\", "/")}`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

main();
