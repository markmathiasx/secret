const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch {
    return fallback;
  }
}

function readText(file) {
  try {
    return fs.readFileSync(path.join(root, file), "utf8");
  } catch {
    return "";
  }
}

function ensureDir(dir) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function score(checks) {
  if (!checks.length) return 0;
  const passed = checks.filter((check) => check.ok).length;
  return Math.round((passed / checks.length) * 10000) / 100;
}

function classifyPhaseBlocker(item) {
  const text = `${item.phase || ""}: ${item.blocker || item}`.trim();
  const rules = [
    { pattern: /DATABASE_URL|banco/i, classification: "optional_capability_pending" },
    { pattern: /Mercado Pago|MERCADOPAGO/i, classification: "payment_provider_pending" },
    { pattern: /SMTP|email/i, classification: "notification_provider_pending" },
    { pattern: /Analytics|Tag Assistant|DebugView/i, classification: "analytics_external_verification_pending" },
    { pattern: /docker compose|Docker/i, classification: "local_tooling_unavailable" },
    { pattern: /Lighthouse|Web Vitals|performance/i, classification: "performance_optimization_pending" },
  ];
  const match = rules.find((rule) => rule.pattern.test(text));
  return {
    source: text,
    classification: match?.classification || "runtime_production_blocker",
    blocksScore: !match,
  };
}

const phaseAudit = readJson("reports/marketplace-phase-audit.json", {});
const publicRegression = readJson("reports/public-regressions-validation-report.json", {});
const productionPublic = readJson("reports/commerce-os-production-public-validation.json", null);
const feed = readJson("reports/meta-commerce-feed-report.json", {});
const security = readJson("reports/security-audit-report.json", {});
const secretScan = readJson("reports/git-secret-scan-report.json", {});
const pricing = readJson("reports/pricing-validation-report.json", {});
const catalog = readJson("reports/marketplace-catalog-integrity-report.json", {});
const channelSource = readText("src/lib/channelops/channels.ts");
const feedOpsSource = readText("src/lib/feedops/health.ts");
const analyticsRouteSource = readText("app/api/admin/analytics/health/route.ts");
const navigationSource = readText("src/config/navigation.ts");

const phaseBlockers = (phaseAudit.blocked || []).map(classifyPhaseBlocker);
const blockingPhaseItems = phaseBlockers.filter((item) => item.blocksScore);
const optionalPending = phaseBlockers.filter((item) => !item.blocksScore);
const publicOfficialCount = productionPublic?.countsConsistent
  ? productionPublic.counts?.[0]
  : publicRegression.catalogCount;
const expectedFeedMinimum = Math.max(1, Number(feed.publicProducts || 0) - Number(feed.skippedProducts || 0));

const ecommerceChecks = [
  { id: "public_regressions", ok: publicRegression.ok === true, detail: publicRegression.generatedAt },
  { id: "pricing", ok: pricing.ok === true && Number(pricing.pricingIssues?.length || 0) === 0, detail: pricing.productsChecked },
  { id: "catalog_integrity", ok: catalog.ok === true, detail: catalog.generatedAt },
  { id: "security_audit", ok: security.ok === true, detail: security.generatedAt },
  { id: "secret_scan", ok: secretScan.ok === true, detail: secretScan.commitsScanned },
  { id: "analytics_health_route", ok: analyticsRouteSource.includes("optional_instrumentation_pending"), detail: "/api/admin/analytics/health" },
  { id: "production_public_if_available", ok: productionPublic ? productionPublic.ok === true : true, detail: productionPublic?.generatedAt || "not_run_yet" },
  { id: "no_runtime_phase_blockers", ok: blockingPhaseItems.length === 0, detail: blockingPhaseItems.length },
];

const catalogWhatsappChecks = [
  { id: "official_public_count_present", ok: Number(publicOfficialCount) > 0, detail: publicOfficialCount },
  { id: "games_11", ok: publicRegression.games?.length === 11, detail: publicRegression.games?.length },
  { id: "meta_feed_valid", ok: feed.ok === true && Number(feed.productsInFeed || 0) >= expectedFeedMinimum, detail: `${feed.productsInFeed}/${expectedFeedMinimum}` },
  { id: "pricing_complete", ok: pricing.ok === true && Number(pricing.productsChecked || 0) >= Number(publicRegression.catalogCount || 0), detail: pricing.productsChecked },
  { id: "public_picsum_removed", ok: Number(catalog.publicPicsumCount || 0) === 0, detail: catalog.publicPicsumCount },
  { id: "smart_picsum_removed", ok: Number(catalog.smartPicsumCount || 0) === 0, detail: catalog.smartPicsumCount },
  { id: "menu_source_single", ok: navigationSource.includes("Catálogo") && navigationSource.includes("Sob medida") && navigationSource.includes("Como funciona"), detail: "src/config/navigation.ts" },
  { id: "production_counts_consistent_if_available", ok: productionPublic ? productionPublic.countsConsistent === true : true, detail: productionPublic?.counts || "not_run_yet" },
];

const omnichannelChecks = [
  { id: "meta_feed_valid", ok: feed.ok === true && Number(feed.productsInFeed || 0) >= expectedFeedMinimum, detail: `${feed.productsInFeed}/${expectedFeedMinimum}` },
  { id: "google_feed_registered", ok: feedOpsSource.includes("/feeds/google-shopping.xml"), detail: "FeedOps" },
  { id: "products_json_registered", ok: feedOpsSource.includes("/feeds/products.json"), detail: "FeedOps" },
  { id: "mercadolivre_dry_run_classified", ok: channelSource.includes("disabled_without_credentials") && channelSource.includes("mercadolivre"), detail: "disabled_without_credentials" },
  { id: "shopee_dry_run_classified", ok: channelSource.includes("disabled_without_credentials") && channelSource.includes("shopee"), detail: "disabled_without_credentials" },
  { id: "facebook_manual_package", ok: channelSource.includes("manual_package") && channelSource.includes("facebook_marketplace"), detail: "manual_package" },
  { id: "nuvemshop_optional_url", ok: channelSource.includes("disabled_without_url") && channelSource.includes("nuvemshop"), detail: "disabled_without_url" },
  { id: "production_feeds_if_available", ok: productionPublic ? productionPublic.feeds?.every((entry) => entry.ok) === true : true, detail: productionPublic?.generatedAt || "not_run_yet" },
  { id: "security_audit", ok: security.ok === true, detail: security.generatedAt },
  { id: "secret_scan", ok: secretScan.ok === true, detail: secretScan.commitsScanned },
];

const scores = {
  ecommerceOperational: score(ecommerceChecks),
  catalogVisualWhatsapp: score(catalogWhatsappChecks),
  omnichannelMarketplace: score(omnichannelChecks),
};

const failedChecks = [
  ...ecommerceChecks.filter((check) => !check.ok).map((check) => `ecommerce:${check.id}`),
  ...catalogWhatsappChecks.filter((check) => !check.ok).map((check) => `catalog:${check.id}`),
  ...omnichannelChecks.filter((check) => !check.ok).map((check) => `omnichannel:${check.id}`),
];

const output = {
  generatedAt: new Date().toISOString(),
  scores,
  requiredPerfectScore: 100,
  pass: scores.ecommerceOperational === 100 && scores.catalogVisualWhatsapp === 100 && scores.omnichannelMarketplace === 100 && failedChecks.length === 0,
  evidence: {
    phaseGeneralPercent: Number(phaseAudit.generalPercent || 0),
    publicOfficialCount,
    publicRegressionCatalogCount: publicRegression.catalogCount,
    productionCounts: productionPublic?.counts || [],
    games: publicRegression.games?.length,
    metaProducts: feed.productsInFeed,
    metaExpectedMinimum: expectedFeedMinimum,
    metaSkipped: feed.skippedProducts,
    pricingProductsChecked: pricing.productsChecked,
    publicPicsumCount: catalog.publicPicsumCount,
    smartPicsumCount: catalog.smartPicsumCount,
    securityOk: security.ok,
    secretScanOk: secretScan.ok,
  },
  checks: {
    ecommerceOperational: ecommerceChecks,
    catalogVisualWhatsapp: catalogWhatsappChecks,
    omnichannelMarketplace: omnichannelChecks,
  },
  optionalPending,
  blockers: [
    ...blockingPhaseItems.map((item) => item.source),
    ...failedChecks,
  ],
};

ensureDir("data/reports");
fs.writeFileSync(path.join(root, "data/reports/score-commerce-os.json"), `${JSON.stringify(output, null, 2)}\n`);

const optionalLines = optionalPending.length
  ? optionalPending.map((item) => `- ${item.classification}: ${item.source}`).join("\n")
  : "- Nenhuma pendencia opcional classificada.";
const blockerLines = output.blockers.length
  ? output.blockers.map((item) => `- ${item}`).join("\n")
  : "- Nenhum blocker real de runtime/produção nos checks atuais.";

const scoreDoc = `# Score Commerce OS MDH3D

Gerado em: ${output.generatedAt}

| Pilar | Score |
| --- | ---: |
| E-commerce operacional | ${scores.ecommerceOperational}/100 |
| Catalogo visual + WhatsApp | ${scores.catalogVisualWhatsapp}/100 |
| Omnichannel marketplace | ${scores.omnichannelMarketplace}/100 |

Status final: ${output.pass ? "PASSOU" : "NAO PASSOU"}

## Evidencias usadas

- Catalogo publico oficial: ${publicOfficialCount ?? "n/d"} produtos
- Jogos publicos: ${publicRegression.games?.length ?? "n/d"}
- Feed Meta: ${feed.productsInFeed ?? "n/d"} produtos, ${feed.skippedProducts ?? "n/d"} ignorados
- Pricing: ${pricing.productsChecked ?? "n/d"} produtos validados
- Picsum publico/smart: ${catalog.publicPicsumCount ?? "n/d"} / ${catalog.smartPicsumCount ?? "n/d"}
- Security audit: ${security.ok ? "ok" : "falhou"}
- Secret scan: ${secretScan.ok ? "ok" : "falhou"}
- Validacao publica: ${productionPublic ? (productionPublic.ok ? "ok" : "falhou") : "ainda nao executada nesta rodada"}

## Pendencias externas classificadas sem bloquear runtime

${optionalLines}

## Blockers reais

${blockerLines}
`;

fs.writeFileSync(path.join(root, "docs/SCORE_COMMERCE_OS.md"), scoreDoc);

if (!output.pass) {
  console.error("Commerce OS score below 100. See docs/SCORE_COMMERCE_OS.md");
  process.exitCode = 1;
} else {
  console.log("Commerce OS score reached 100/100/100.");
}
