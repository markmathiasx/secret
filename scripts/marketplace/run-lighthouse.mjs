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
  { key: "home", label: "home", path: "/", indexable: true },
  { key: "category", label: "categoria", path: "/catalogo/categoria/geek-colecionaveis", indexable: true },
  { key: "product", label: "produto", path: "/catalogo/mdh-016-chaveiro-3d-personalizado-com-nome-ou-logo", indexable: true },
  { key: "catalog", label: "catalogo", path: "/catalogo", indexable: true },
  { key: "checkout", label: "checkout", path: "/checkout", indexable: false, expectedRobots: "noindex" },
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
      metaDescription: auditValue(lhr, "meta-description"),
      isCrawlable: auditValue(lhr, "is-crawlable"),
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

function pageTargets(page, result) {
  const lcpValue = result.audits?.lcp?.numericValue ?? Number.POSITIVE_INFINITY;
  const clsValue = result.audits?.cls?.numericValue ?? Number.POSITIVE_INFINITY;
  const crawlableScore = result.audits?.isCrawlable?.score;
  const performance = Boolean(
    result.ok &&
      result.categories?.performance >= 95 &&
      lcpValue <= 2500 &&
      clsValue <= 0.1
  );
  const accessibility = Boolean(result.ok && result.categories?.accessibility >= 95);
  const bestPractices = Boolean(result.ok && result.categories?.bestPractices >= 95);
  const seo = page.indexable === false
    ? Boolean(crawlableScore === 0)
    : Boolean(result.ok && result.categories?.seo >= 95 && crawlableScore !== 0);

  return {
    performance,
    accessibility,
    bestPractices,
    seo,
    all: performance && accessibility && bestPractices && seo,
    policy: page.indexable === false ? "checkout-noindex" : "indexable",
  };
}

function targetFailures(item) {
  const failures = [];
  const categories = item.categories || {};
  const lcpValue = item.audits?.lcp?.numericValue ?? Number.POSITIVE_INFINITY;
  const clsValue = item.audits?.cls?.numericValue ?? Number.POSITIVE_INFINITY;

  if (!(item.ok && categories.performance >= 95)) failures.push("performance");
  if (!(lcpValue <= 2500)) failures.push("LCP");
  if (!(clsValue <= 0.1)) failures.push("CLS");
  if (!(item.ok && categories.accessibility >= 95)) failures.push("a11y");
  if (!(item.ok && categories.bestPractices >= 95)) failures.push("best");
  if (!item.targets?.seo) failures.push(item.indexable === false ? "checkout noindex" : "seo indexavel");

  return failures;
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
      const baseResult = {
        ...page,
        url,
        ok: hasValidScores(parsed),
        warning: hasValidScores(parsed) ? undefined : "Lighthouse did not load a valid application page.",
        durationMs: Date.now() - startedAt,
        reportPath: path.relative(root, outputPath).replaceAll("\\", "/"),
        ...parsed,
      };
      return {
        ...baseResult,
        targets: pageTargets(page, baseResult),
      };
    }

    lastError = result.error?.message || result.stderr || result.stdout || "lighthouse failed";
  }

  if (existsSync(outputPath)) {
    const parsed = readResult(outputPath);
    const baseResult = {
      ...page,
      url,
      ok: hasValidScores(parsed),
      warning: lastError.slice(-1000),
      durationMs: Date.now() - startedAt,
      reportPath: path.relative(root, outputPath).replaceAll("\\", "/"),
      ...parsed,
    };
    return {
      ...baseResult,
      targets: pageTargets(page, baseResult),
    };
  }

  const failedResult = {
    ...page,
    url,
    ok: false,
    durationMs: Date.now() - startedAt,
    error: lastError.slice(-3000),
  };
  return {
    ...failedResult,
    targets: pageTargets(page, failedResult),
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
    "| Page | Perf | A11y | Best practices | SEO | LCP | CLS | TBT | Targets | Status |",
    "| --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |",
  ];

  for (const item of report.pages) {
    const seoCell = item.indexable === false ? `${item.categories?.seo ?? "-"} (noindex esperado)` : (item.categories?.seo ?? "-");
    const failures = targetFailures(item);
    const targetCell = failures.length ? failures.join(", ") : "OK";
    lines.push(
      `| ${item.label} | ${item.categories?.performance ?? "-"} | ${item.categories?.accessibility ?? "-"} | ${item.categories?.bestPractices ?? "-"} | ${seoCell} | ${item.audits?.lcp?.displayValue ?? "-"} | ${item.audits?.cls?.displayValue ?? "-"} | ${item.audits?.tbt?.displayValue ?? "-"} | ${targetCell || "-"} | ${item.ok ? "OK" : `FAIL: ${(item.error || "").replace(/\s+/g, " ").slice(0, 120)}`} |`
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
  report.allTargetsMet = report.pages.every((page) => page.targets?.all);
  report.allPerformanceTargetsMet = report.pages.every((page) => page.targets?.performance);
  report.allSeoTargetsMet = report.pages.every((page) => page.targets?.seo);

  writeReports(report);
  console.log(`Lighthouse audit written to ${path.relative(root, summaryMd).replaceAll("\\", "/")}`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

main();
