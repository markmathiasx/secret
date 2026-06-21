const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const readJson = (file, fallback = null) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch {
    return fallback;
  }
};

const ensureDir = (dir) => fs.mkdirSync(path.join(root, dir), { recursive: true });

const phaseAudit = readJson("reports/marketplace-phase-audit.json", {});
const publicRegression = readJson("reports/public-regressions-validation-report.json", {});
const feed = readJson("reports/meta-commerce-feed-report.json", {});
const security = readJson("reports/security-audit-report.json", {});
const secretScan = readJson("reports/git-secret-scan-report.json", {});
const pricing = readJson("reports/pricing-validation-report.json", {});
const catalog = readJson("reports/marketplace-catalog-integrity-report.json", {});

const phasePercent = Number(phaseAudit.generalPercent || 0);
const ecommerceScore = Math.min(
  100,
  Math.round(
    (Number(publicRegression.ok) * 18 +
      Number(pricing.ok) * 18 +
      Number(catalog.ok) * 18 +
      Number(feed.ok) * 14 +
      Math.min(phasePercent, 100) * 0.32) *
      100
  ) / 100
);
const catalogWhatsappScore = Math.min(
  100,
  Math.round(
    (Number(publicRegression.catalogCount === 848) * 20 +
      Number(publicRegression.games?.length === 11) * 8 +
      Number(feed.productsInFeed >= 844) * 18 +
      Number(pricing.productsChecked >= 848) * 18 +
      Number(catalog.publicPicsumCount === 0) * 18 +
      Number(catalog.smartPicsumCount === 0) * 18) *
      100
  ) / 100
);
const omnichannelScore = Math.min(
  100,
  Math.round(
    (Number(feed.ok) * 24 +
      Number(security.ok) * 20 +
      Number(secretScan.ok) * 20 +
      Math.min(phasePercent, 100) * 0.26 +
      Number(Array.isArray(phaseAudit.blocked) && phaseAudit.blocked.length === 0) * 10) *
      100
  ) / 100
);

const blockers = [
  ...(phaseAudit.blocked || []).map((item) => `${item.phase}: ${item.blocker}`),
  ...(!feed.ok ? ["Feed Meta nao passou no validador atual."] : []),
  ...(!security.ok ? ["Security audit nao passou."] : []),
  ...(!secretScan.ok ? ["Secret scan encontrou achados."] : []),
];
const scores = {
  generatedAt: new Date().toISOString(),
  scores: {
    ecommerceOperational: ecommerceScore,
    catalogVisualWhatsapp: catalogWhatsappScore,
    omnichannelMarketplace: omnichannelScore,
  },
  requiredPerfectScore: 100,
  pass: ecommerceScore >= 100 && catalogWhatsappScore >= 100 && omnichannelScore >= 100 && blockers.length === 0,
  evidence: {
    phaseGeneralPercent: phasePercent,
    publicCatalogCount: publicRegression.catalogCount,
    games: publicRegression.games?.length,
    metaProducts: feed.productsInFeed,
    pricingProductsChecked: pricing.productsChecked,
    publicPicsumCount: catalog.publicPicsumCount,
    smartPicsumCount: catalog.smartPicsumCount,
    securityOk: security.ok,
    secretScanOk: secretScan.ok,
  },
  blockers,
};

ensureDir("data/reports");
fs.writeFileSync(path.join(root, "data/reports/score-commerce-os.json"), `${JSON.stringify(scores, null, 2)}\n`);

const scoreDoc = `# Score Commerce OS MDH3D

Gerado em: ${scores.generatedAt}

| Pilar | Score |
| --- | ---: |
| E-commerce operacional | ${ecommerceScore}/100 |
| Catalogo visual + WhatsApp | ${catalogWhatsappScore}/100 |
| Omnichannel marketplace | ${omnichannelScore}/100 |

Status final: ${scores.pass ? "PASSOU" : "NAO PASSOU"}

## Evidencias usadas

- Marketplace geral atual: ${phasePercent}%
- Catalogo publico: ${publicRegression.catalogCount ?? "n/d"} produtos
- Jogos publicos: ${publicRegression.games?.length ?? "n/d"}
- Feed Meta: ${feed.productsInFeed ?? "n/d"} produtos, ${feed.skippedProducts ?? "n/d"} ignorados
- Pricing: ${pricing.productsChecked ?? "n/d"} produtos validados
- Picsum publico/smart: ${catalog.publicPicsumCount ?? "n/d"} / ${catalog.smartPicsumCount ?? "n/d"}
- Security audit: ${security.ok ? "ok" : "falhou"}
- Secret scan: ${secretScan.ok ? "ok" : "falhou"}

## Gaps para 100/100/100

${blockers.length ? blockers.map((item) => `- ${item}`).join("\n") : "- Nenhum gap registrado nos relatorios atuais."}
`;

fs.writeFileSync(path.join(root, "docs/SCORE_COMMERCE_OS.md"), scoreDoc);

if (!scores.pass) {
  console.error("Commerce OS score below 100. See docs/SCORE_COMMERCE_OS.md");
  process.exitCode = 1;
} else {
  console.log("Commerce OS score reached 100/100/100.");
}
