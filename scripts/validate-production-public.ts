const fs = require("node:fs");
const path = require("node:path");
const { XMLParser } = require("fast-xml-parser");

const ROOT = process.cwd();
const DEFAULT_BASE_URL = "https://www.mdh3d.com.br";
const requiredMenuLabels = ["Loja", "Ofertas", "Catálogo", "Sob medida", "Jogue", "Como funciona", "Blog", "Atendimento"];

const htmlRoutes = [
  "/",
  "/loja",
  "/ofertas",
  "/catalogo",
  "/sob-medida",
  "/jogue",
  "/como-funciona",
  "/blog",
  "/atendimento",
];

const feedRoutes = [
  { path: "/meta/catalog.csv", kind: "csv", minRows: 1 },
  { path: "/feeds/google-shopping.xml", kind: "xml", minItems: 1 },
  { path: "/feeds/products.json", kind: "json", minProducts: 1 },
  { path: "/sitemap-products.xml", kind: "sitemap", minItems: 1 },
];

function ensureReportDir() {
  fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
}

function normalizeBaseUrl(value) {
  const raw = String(value || "").trim().replace(/\/$/, "");
  return raw;
}

function getBaseUrls() {
  const baseUrls = [
    process.env.PRODUCTION_VALIDATE_BASE_URL || DEFAULT_BASE_URL,
    process.env.PRODUCTION_VALIDATE_EXTRA_BASE_URL,
  ]
    .filter((value) => String(value || "").trim())
    .map(normalizeBaseUrl)
    .filter(Boolean);
  return Array.from(new Set(baseUrls));
}

function hasHtml(contentType, body) {
  return /text\/html/i.test(contentType || "") || /^\s*<!doctype html/i.test(body) || /<html[\s>]/i.test(body);
}

function hasInternalError(body) {
  return /internal error|application error|server error|erro interno/i.test(body);
}

function parseOfficialCount(body) {
  const match = body.match(/data-official-product-count=["']?(\d+)["']?/i);
  return match ? Number(match[1]) : null;
}

function csvRowCount(body) {
  return body.trim().split(/\r?\n/).filter(Boolean).length - 1;
}

function getArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function validateXml(body, route) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(body);
  if (route.kind === "sitemap") {
    return getArray(parsed?.urlset?.url).length;
  }
  return getArray(parsed?.rss?.channel?.item).length;
}

function validateJson(body) {
  const parsed = JSON.parse(body);
  if (!parsed || parsed.ok !== true) return 0;
  return Array.isArray(parsed.products) ? parsed.products.length : Number(parsed.total || 0);
}

async function fetchRoute(baseUrl, routePath) {
  const url = `${baseUrl}${routePath}`;
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "MDH3D-public-validator/1.0",
      Accept: "*/*",
    },
  });
  const body = await response.text();
  const contentType = response.headers.get("content-type") || "";
  return {
    url,
    status: response.status,
    redirected: response.redirected,
    finalUrl: response.url,
    contentType,
    body,
  };
}

async function validateHtmlRoute(baseUrl, routePath) {
  const result = await fetchRoute(baseUrl, routePath);
  const errors = [];
  if (result.status !== 200) errors.push(`status_${result.status}`);
  if (hasInternalError(result.body)) errors.push("internal_error_text");

  const missingMenuLabels = requiredMenuLabels.filter((label) => !result.body.includes(label));
  if (missingMenuLabels.length) errors.push(`missing_menu:${missingMenuLabels.join("|")}`);

  const officialCount = parseOfficialCount(result.body);
  const whatsappLinks = [...result.body.matchAll(/https:\/\/wa\.me\/(\d{12,15})(?:[?"'&<\s]|$)/g)].map((match) => match[1]);
  const invalidWhatsapp = whatsappLinks.filter((number) => !/^55\d{10,13}$/.test(number));
  if (routePath === "/atendimento" && !whatsappLinks.length) errors.push("missing_wa_me");
  if (invalidWhatsapp.length) errors.push(`invalid_wa_me:${invalidWhatsapp.join("|")}`);

  return {
    route: routePath,
    url: result.url,
    finalUrl: result.finalUrl,
    status: result.status,
    contentType: result.contentType,
    officialCount,
    menuLabelsFound: requiredMenuLabels.filter((label) => result.body.includes(label)),
    whatsappLinks: Array.from(new Set(whatsappLinks)),
    ok: errors.length === 0,
    errors,
  };
}

async function validateFeedRoute(baseUrl, route) {
  const result = await fetchRoute(baseUrl, route.path);
  const errors = [];
  let itemCount = 0;
  if (result.status !== 200) errors.push(`status_${result.status}`);
  if (hasInternalError(result.body)) errors.push("internal_error_text");
  if (hasHtml(result.contentType, result.body)) errors.push("unexpected_html");

  try {
    if (route.kind === "csv") {
      if (!/text\/csv/i.test(result.contentType)) errors.push(`invalid_content_type:${result.contentType}`);
      if (!/^id,title,description,/i.test(result.body)) errors.push("invalid_csv_header");
      itemCount = csvRowCount(result.body);
    } else if (route.kind === "json") {
      if (!/application\/json/i.test(result.contentType)) errors.push(`invalid_content_type:${result.contentType}`);
      itemCount = validateJson(result.body);
    } else {
      if (!/(application|text)\/xml/i.test(result.contentType)) errors.push(`invalid_content_type:${result.contentType}`);
      itemCount = validateXml(result.body, route);
    }
  } catch (error) {
    errors.push(`parse_failed:${error instanceof Error ? error.message : "unknown"}`);
  }

  const minimum = route.minRows || route.minProducts || route.minItems || 0;
  if (itemCount < minimum) errors.push(`too_few_items:${itemCount}`);

  return {
    route: route.path,
    url: result.url,
    finalUrl: result.finalUrl,
    status: result.status,
    contentType: result.contentType,
    itemCount,
    ok: errors.length === 0,
    errors,
  };
}

function writeReports(report) {
  ensureReportDir();
  fs.writeFileSync(path.join(ROOT, "reports/commerce-os-production-public-validation.json"), `${JSON.stringify(report, null, 2)}\n`);

  const md = [
    "# Commerce OS Production Public Validation",
    "",
    `Generated at: ${report.generatedAt}`,
    `Overall: ${report.ok ? "PASS" : "FAIL"}`,
    "",
    "## Base URLs",
    ...report.baseUrls.map((baseUrl) => `- ${baseUrl}`),
    "",
    "## HTML routes",
    "",
    "| Base | Route | Status | Count | Result |",
    "| --- | --- | ---: | ---: | --- |",
    ...report.html.map((entry) => `| ${entry.baseUrl} | ${entry.route} | ${entry.status} | ${entry.officialCount ?? ""} | ${entry.ok ? "PASS" : `FAIL: ${entry.errors.join(", ")}`} |`),
    "",
    "## Feeds",
    "",
    "| Base | Route | Status | Items | Content-Type | Result |",
    "| --- | --- | ---: | ---: | --- | --- |",
    ...report.feeds.map((entry) => `| ${entry.baseUrl} | ${entry.route} | ${entry.status} | ${entry.itemCount} | ${entry.contentType} | ${entry.ok ? "PASS" : `FAIL: ${entry.errors.join(", ")}`} |`),
    "",
    "## Count consistency",
    "",
    `Official counts found: ${report.counts.join(", ") || "none"}`,
    `Counts consistent: ${report.countsConsistent ? "yes" : "no"}`,
    "",
  ];

  fs.writeFileSync(path.join(ROOT, "reports/commerce-os-production-public-validation.md"), `${md.join("\n")}\n`);
}

async function main() {
  const baseUrls = getBaseUrls();
  const html = [];
  const feeds = [];

  for (const baseUrl of baseUrls) {
    for (const routePath of htmlRoutes) {
      const result = await validateHtmlRoute(baseUrl, routePath);
      html.push({ baseUrl, ...result });
      console.log(`[public-validate] ${result.ok ? "PASS" : "FAIL"} ${baseUrl}${routePath}`);
    }
    for (const route of feedRoutes) {
      const result = await validateFeedRoute(baseUrl, route);
      feeds.push({ baseUrl, ...result });
      console.log(`[public-validate] ${result.ok ? "PASS" : "FAIL"} ${baseUrl}${route.path}`);
    }
  }

  const counts = html.map((entry) => entry.officialCount).filter((value) => Number.isFinite(value));
  const countsConsistent = counts.length >= 3 && new Set(counts).size === 1;
  const errors = [
    ...html.filter((entry) => !entry.ok).map((entry) => `html:${entry.baseUrl}${entry.route}:${entry.errors.join("|")}`),
    ...feeds.filter((entry) => !entry.ok).map((entry) => `feed:${entry.baseUrl}${entry.route}:${entry.errors.join("|")}`),
    ...(!countsConsistent ? ["counts:not_consistent"] : []),
  ];

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrls,
    ok: errors.length === 0,
    counts,
    countsConsistent,
    html,
    feeds,
    errors,
  };

  writeReports(report);

  if (!report.ok) {
    console.error(`[public-validate] failed with ${errors.length} error(s). See reports/commerce-os-production-public-validation.md`);
    process.exitCode = 1;
    return;
  }

  console.log("[public-validate] all public checks passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
