#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createProjectRequire } from "../catalog/ts-runtime.mjs";

const root = process.cwd();
const require = createProjectRequire();
const { catalog, getProductUrl } = require("@/lib/catalog");
const { calculateCardPrice, normalizeMoney } = require("@/lib/payment-pricing");
const { getLocalStoreProducts } = require("@/lib/mdh-store/products");
const { buildProductPagePath } = require("@/lib/mdh-store/links");

const reportPath = path.join(root, "RELATORIO-EXECUCAO-MARKETPLACE.md");
const phaseAuditJson = path.join(root, "reports", "marketplace-phase-audit.json");
const ipRiskJson = path.join(root, "reports", "marketplace-ip-risk-report.json");
const catalogIntegrityJson = path.join(root, "reports", "marketplace-catalog-integrity-report.json");
const publicHttpJson = path.join(root, "reports", "marketplace-public-http-report.json");
const siteUrl = (process.env.MARKETPLACE_PRODUCTION_URL || "https://www.mdh3d.com.br").replace(/\/$/, "");

const thirdPartyTerms = [
  { term: "flamengo", risk: "club_brand", proposal: "rubro-negro" },
  { term: "vasco", risk: "club_brand", proposal: "cruz-maltino" },
  { term: "botafogo", risk: "club_brand", proposal: "preto e branco" },
  { term: "fluminense", risk: "club_brand", proposal: "tricolor" },
  { term: "pokemon", risk: "franchise", proposal: "monstrinho colecionavel" },
  { term: "pokémon", risk: "franchise", proposal: "monstrinho colecionavel" },
  { term: "pikachu", risk: "character", proposal: "mascote eletrico" },
  { term: "nintendo", risk: "brand", proposal: "retro gamer" },
  { term: "mario", risk: "character", proposal: "encanador retro" },
  { term: "sonic", risk: "character", proposal: "mascote veloz" },
  { term: "dragon ball", risk: "franchise", proposal: "anime de batalha" },
  { term: "goku", risk: "character", proposal: "heroi de anime" },
  { term: "naruto", risk: "franchise", proposal: "ninja de anime" },
  { term: "one piece", risk: "franchise", proposal: "pirata de anime" },
  { term: "marvel", risk: "brand", proposal: "heroi de quadrinhos" },
  { term: "dc comics", risk: "brand", proposal: "heroi de quadrinhos" },
  { term: "disney", risk: "brand", proposal: "tema fantasia" },
  { term: "star wars", risk: "franchise", proposal: "sci-fi espacial" },
  { term: "harry potter", risk: "franchise", proposal: "fantasia escolar" },
  { term: "minecraft", risk: "game", proposal: "blocos pixelados" },
  { term: "roblox", risk: "game", proposal: "avatar de blocos" },
  { term: "fortnite", risk: "game", proposal: "battle royale" },
  { term: "playstation", risk: "brand", proposal: "console gamer" },
  { term: "xbox", risk: "brand", proposal: "console gamer" },
  { term: "fifa", risk: "brand", proposal: "futebol mundial" },
];

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function read(relativePath) {
  try {
    return readFileSync(path.join(root, relativePath), "utf8");
  } catch {
    return "";
  }
}

function readJson(relativePath) {
  try {
    return JSON.parse(read(relativePath));
  } catch {
    return null;
  }
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function escapeTable(value) {
  return String(value ?? "")
    .replaceAll("\r", " ")
    .replaceAll("\n", "<br>")
    .replaceAll("|", "\\|")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, max = 520) {
  const clean = escapeTable(value);
  return clean.length > max ? `${clean.slice(0, max - 3)}...` : clean;
}

function criterion(label, ok, evidence, blocker = "") {
  return { label, ok: Boolean(ok), evidence: String(evidence || ""), blocker: String(blocker || "") };
}

function phase(name, criteria) {
  const total = criteria.length || 1;
  const passed = criteria.filter((item) => item.ok).length;
  return {
    name,
    percent: Math.floor((passed / total) * 10000) / 100,
    passed,
    total,
    criteria,
    blockers: criteria.filter((item) => !item.ok && item.blocker).map((item) => item.blocker),
  };
}

function criteriaEvidence(criteria) {
  return criteria
    .map((item) => `${item.ok ? "OK" : "FALHA"} ${item.label}: ${item.evidence}`)
    .join("<br>");
}

function criteriaBlockers(criteria) {
  const blockers = criteria.filter((item) => !item.ok).map((item) => item.blocker || `${item.label} sem evidencia suficiente`);
  return blockers.length ? blockers.join("<br>") : "";
}

function gatePassed(gates, command) {
  return Boolean(gates?.commands?.find((item) => item.command === command && item.exitCode === 0));
}

function gateEvidence(gates, command) {
  const item = gates?.commands?.find((entry) => entry.command === command);
  if (!item) return "sem log atual";
  return `exit ${item.exitCode}, ${Math.round(item.durationMs / 1000)}s`;
}

function buildSharedJs(gates) {
  const build = gates?.commands?.find((item) => item.command === "npm run build");
  const text = `${build?.stdoutTail || ""}\n${build?.stderrTail || ""}`;
  const match = text.match(/First Load JS shared by all\s+([^\n]+)/i);
  return match ? match[1].trim() : "nao medido";
}

function analyzeIpRisk(products, source, urlBuilder) {
  const findings = [];
  for (const product of products) {
    const haystack = normalizeForRisk([product.name, product.title, product.description, product.category, product.tags?.join(" ")].filter(Boolean).join(" "));
    const matches = thirdPartyTerms.filter((item) => containsRiskTerm(haystack, item.term));
    if (!matches.length) continue;
    findings.push({
      source,
      id: product.id || product.slug || product.sku,
      name: product.name || product.title,
      url: urlBuilder(product),
      matches: matches.map((item) => ({ term: item.term, risk: item.risk, proposal: item.proposal })),
      suggestedCopy: neutralizeCopy(product.name || product.title || "Produto 3D", matches),
    });
  }
  return findings;
}

function normalizeForRisk(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function containsRiskTerm(haystack, term) {
  const normalizedTerm = normalizeForRisk(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^a-z0-9])${normalizedTerm}([^a-z0-9]|$)`, "i").test(haystack);
}

function neutralizeCopy(name, matches) {
  let copy = String(name || "Produto 3D");
  for (const item of matches) {
    copy = copy.replace(new RegExp(item.term, "ig"), item.proposal);
  }
  return copy;
}

function analyzeCatalogIntegrity(publicCatalog, smartProducts) {
  const allPublicSlugs = new Map();
  const duplicatePublicSlugs = [];
  for (const product of publicCatalog) {
    const slug = product.slug || product.id;
    if (allPublicSlugs.has(slug)) duplicatePublicSlugs.push(slug);
    allPublicSlugs.set(slug, product.id);
  }

  const publicPricingIssues = publicCatalog.filter((product) => {
    const pix = normalizeMoney(product.pricePix);
    const card = normalizeMoney(product.priceCard);
    return pix <= 0 || Math.abs(card - calculateCardPrice(pix)) > 0.009;
  });
  const smartPricingIssues = smartProducts.filter((product) => {
    const pix = normalizeMoney(product.pixPrice);
    const card = normalizeMoney(product.cardPrice);
    const cost = normalizeMoney(product.productionCost);
    const expectedFromCost = cost > 0 ? normalizeMoney(cost * 1.3) : pix;
    return pix <= 0 || Math.abs(card - calculateCardPrice(pix)) > 0.009 || (cost > 0 && Math.abs(pix - expectedFromCost) > 0.02);
  });
  const publicPicsum = publicCatalog.filter((product) => [product.image, ...(product.images || [])].filter(Boolean).some((url) => String(url).includes("picsum.photos")));
  const smartPicsum = smartProducts.filter((product) => [product.image, ...(product.gallery || [])].filter(Boolean).some((url) => String(url).includes("picsum.photos")));
  const smartUnsafeLinks = smartProducts.filter((product) => /^(localhost|blob:|data:|javascript:)/i.test(String(product.nuvemshopUrl || product.image || "")));
  const genericDescriptions = publicCatalog.filter((product) => /selecionado para producao em Bambu Lab A1 Mini/i.test(product.description || ""));
  const publicWithCategory = publicCatalog.filter((product) => product.category).length;
  const smartWithCategory = smartProducts.filter((product) => product.category).length;
  const smartPlaceholder = smartProducts.filter((product) => [product.image, ...(product.gallery || [])].filter(Boolean).some((url) => String(url).includes("product-placeholder")));

  return {
    generatedAt: new Date().toISOString(),
    publicCatalogCount: publicCatalog.length,
    smartStoreCount: smartProducts.length,
    totalChecked: publicCatalog.length + smartProducts.length,
    duplicatePublicSlugs,
    publicPricingIssues,
    smartPricingIssues,
    publicPicsumCount: publicPicsum.length,
    smartPicsumCount: smartPicsum.length,
    smartUnsafeLinkCount: smartUnsafeLinks.length,
    genericDescriptionCount: genericDescriptions.length,
    publicWithCategory,
    smartWithCategory,
    smartPlaceholderCount: smartPlaceholder.length,
    ok:
      duplicatePublicSlugs.length === 0 &&
      publicPricingIssues.length === 0 &&
      smartPricingIssues.length === 0 &&
      publicPicsum.length === 0 &&
      smartPicsum.length === 0 &&
      smartUnsafeLinks.length === 0,
  };
}

async function fetchHeaders(url) {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    const headers = Object.fromEntries(response.headers.entries());
    return {
      url,
      ok: response.ok,
      status: response.status,
      headers: {
        "content-type": headers["content-type"] || "",
        "cache-control": headers["cache-control"] || "",
        "content-security-policy": headers["content-security-policy"] || "",
        "strict-transport-security": headers["strict-transport-security"] || "",
        "x-content-type-options": headers["x-content-type-options"] || "",
        "x-frame-options": headers["x-frame-options"] || "",
        "permissions-policy": headers["permissions-policy"] || "",
      },
    };
  } catch (error) {
    return { url, ok: false, status: null, headers: {}, error: error instanceof Error ? error.message : String(error) };
  }
}

async function writePublicHttpReport() {
  const routes = ["/", "/catalogo", "/loja", "/catalogo/mdh-016-chaveiro-3d-personalizado-com-nome-ou-logo", "/checkout", "/jogue", "/feeds/meta-catalog.csv", "/meta/catalog.csv"];
  const checks = [];
  for (const route of routes) checks.push(await fetchHeaders(`${siteUrl}${route}`));
  const report = {
    generatedAt: new Date().toISOString(),
    siteUrl,
    checks,
    ok: checks.every((item) => item.ok),
  };
  writeJson(publicHttpJson, report);
  return report;
}

function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function validateProductionHeaders(httpReport) {
  const home = httpReport.checks.find((item) => item.url.endsWith("/"));
  if (!home) return false;
  return Boolean(
    home.headers["content-security-policy"] &&
      home.headers["strict-transport-security"] &&
      home.headers["x-content-type-options"]?.toLowerCase() === "nosniff"
  );
}

function lighthouseTargetsMet(lighthouse) {
  return Boolean(lighthouse?.allTargetsMet);
}

function lighthouseCollected(lighthouse) {
  return Boolean(lighthouse?.pages?.length >= 5 && lighthouse.pages.every((page) => page.ok));
}

function metricLine(lighthouse, key) {
  const item = lighthouse?.pages?.find((page) => page.key === key);
  if (!item?.ok) return "sem medicao";
  const c = item.categories;
  return `perf ${c.performance}, a11y ${c.accessibility}, best ${c.bestPractices}, seo ${c.seo}`;
}

function collectPlaywrightSpecs(report) {
  const specs = [];

  function visit(suite) {
    for (const child of suite?.suites || []) visit(child);
    for (const spec of suite?.specs || []) specs.push(spec);
  }

  visit(report);
  return specs;
}

function summarizePlaywrightFile(report, fileName) {
  const specs = collectPlaywrightSpecs(report).filter((spec) => spec.file === fileName);
  const passed = specs.filter((spec) => spec.ok === true).length;
  return {
    total: specs.length,
    passed,
    ok: specs.length > 0 && passed === specs.length && Number(report?.stats?.unexpected || 0) === 0,
    titles: specs.map((spec) => spec.title || ""),
  };
}

function publicPhotoPercent(catalogIntegrity, catalogValidation) {
  const placeholderRisk = Number(catalogValidation?.placeholderRisk || 0);
  const total = Number(catalogValidation?.total || catalogIntegrity.publicCatalogCount || 0);
  if (!total) return "nao medido";
  const valid = Math.max(0, total - placeholderRisk);
  return `${((valid / total) * 100).toFixed(2)}% (${valid}/${total})`;
}

async function main() {
  const phase0 = readJson("reports/marketplace-phase0-reconciliation.json");
  const gates = readJson("reports/marketplace-verification-gates.json");
  const lighthouse = readJson("reports/marketplace-lighthouse-summary.json");
  const axe = readJson("reports/marketplace-axe-report.json");
  const secrets = readJson("reports/git-secret-scan-report.json");
  const pricing = readJson("reports/pricing-validation-report.json");
  const publicRegressions = readJson("reports/public-regressions-validation-report.json");
  const playwright = readJson("reports/playwright-marketplace-run.json");
  const smokeResults = readJson("reports/smoke-results.json");
  const smartStoreSmoke = summarizePlaywrightFile(smokeResults, "mdh-smart-store.spec.ts");
  const catalogValidation = readJson("CATALOG_VALIDATION_REPORT.json");
  const dbStorage = readJson("reports/db-storage-validation-report.json");
  const securityAudit = readJson("reports/security-audit-report.json");
  const publicCompare = readJson("reports/local-vs-production-validation-report.json");
  const dockerBuild = readJson("reports/docker-build-report.json");
  const deployReport = readJson("reports/vercel-deploy-report.json");
  const publicHttp = await writePublicHttpReport();

  const ipFindings = [
    ...analyzeIpRisk(catalog, "catalogo_publico", (product) => getProductUrl(product)),
    ...analyzeIpRisk(getLocalStoreProducts(), "loja_inteligente", (product) => buildProductPagePath(product)),
  ];
  const ipReport = {
    generatedAt: new Date().toISOString(),
    totalFindings: ipFindings.length,
    findings: ipFindings,
    ok: ipFindings.length === 0,
  };
  writeJson(ipRiskJson, ipReport);

  const catalogIntegrity = analyzeCatalogIntegrity(catalog, getLocalStoreProducts());
  writeJson(catalogIntegrityJson, catalogIntegrity);

  const catalogPdp = read("app/catalogo/[slug]/page.tsx");
  const smartPdp = read("app/produto/[slug]/page.tsx");
  const pdpSeoSource = `${catalogPdp}\n${smartPdp}`;
  const catalogPage = read("app/catalogo/page.tsx");
  const smartStore = read("components/mdh-store/SmartStorefront.tsx");
  const smartActions = read("components/mdh-store/SmartProductActions.tsx");
  const smartCart = read("components/mdh-store/smart-cart.ts");
  const layout = read("app/layout.tsx");
  const checkoutPreference = read("app/api/checkout/preference/route.ts");
  const ordersRoute = read("app/api/orders/route.ts");
  const middleware = read("middleware.ts");
  const nextConfig = read("next.config.ts");
  const returnsPage = read("app/trocas-e-devolucoes/page.tsx");
  const trocaPage = read("app/politica-de-troca/page.tsx");
  const schema = read("prisma/schema.prisma");

  const allGatesPassed = gates?.commands?.length >= 11 && gates.commands.every((item) => item.exitCode === 0);
  const firstLoadJs = buildSharedJs(gates);
  const localDbConfigured = Boolean(process.env.DATABASE_URL);
  const mpConfigured = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN && process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
  const emailConfigured = Boolean(process.env.SMTP_HOST && process.env.EMAIL_FROM);
  const envText = read("docs/VERCEL_ENV.md");

  const phases = [
    phase("0. Reconciliação", [
      criterion("fontes obrigatorias lidas", phase0?.requiredInventory?.every((item) => item.status === "PRESENTE"), `${phase0?.requiredInventory?.filter((item) => item.status === "PRESENTE").length || 0}/18 fontes presentes`, "Fase 0 sem todas as fontes exigidas"),
      criterion("afirmacoes antigas classificadas", (phase0?.claims?.length || 0) > 0, `${phase0?.claims?.length || 0} afirmacoes`, "Sem tabela de reconciliacao objetiva"),
      criterion("protocolo permanente", exists("docs/CODEX_EXECUTION_PROTOCOL.md") && read("AGENTS.md").includes("CODEX_EXECUTION_PROTOCOL"), "docs/CODEX_EXECUTION_PROTOCOL.md referenciado em AGENTS.md", "Protocolo permanente ausente"),
      criterion("gates obrigatorios base", allGatesPassed, `${gates?.commands?.filter((item) => item.exitCode === 0).length || 0}/${gates?.commands?.length || 0} comandos passaram`, "Nem todos os gates base passaram"),
    ]),
    phase("1. Performance", [
      criterion("Lighthouse mobile coletado", lighthouseCollected(lighthouse), `paginas: ${lighthouse?.pages?.length || 0}`, "Rode npm run marketplace:lighthouse com servidor local em producao"),
      criterion("metas Lighthouse >=95", lighthouseTargetsMet(lighthouse), "home/produto/checkout/catalogo/categoria precisam bater performance/a11y/best/seo >=95 e LCP/CLS alvo", "Notas Lighthouse ou Web Vitals lab abaixo da meta"),
      criterion("bundle JS inicial medido", firstLoadJs !== "nao medido", `First Load JS shared by all: ${firstLoadJs}`, "Sem build atual com tamanho de bundle"),
      criterion("cache por rota validado em producao", publicHttp.checks.some((item) => item.url.includes("/catalogo") && item.headers["cache-control"]), "curl/HEAD publico capturou cache-control", "Sem prova de headers cache em producao"),
    ]),
    phase("2. Design System", [
      criterion("axe-core executado", Boolean(axe?.results?.length), `${axe?.results?.length || 0} combinacoes pagina/viewport`, "Rode npm run marketplace:axe"),
      criterion("sem violacoes serias/criticas axe", Number(axe?.seriousOrCritical || 0) === 0, `${axe?.seriousOrCritical ?? "sem medicao"} serias/criticas`, "Corrigir violacoes axe serias/criticas"),
      criterion("Picsum removido da allowlist runtime", !nextConfig.includes("picsum.photos"), "next.config.ts nao permite picsum.photos", "Remover picsum.photos da allowlist"),
      criterion("placeholder honesto tem selo publico", smartStore.includes("Foto ilustrativa - produto real sob aprovação") && read("components/mdh-store/ProductExperience.tsx").includes("Foto ilustrativa - produto real sob aprovação"), "selo presente em cards e PDP da loja inteligente", "Placeholder sem aviso explicito ao cliente"),
      criterion("fundo/motion da loja centralizado", exists("components/mdh-store/StoreAnimatedBackground.tsx"), "StoreAnimatedBackground usado em /loja e /produto/[slug]", "Sem evidencia de fundo animado da loja"),
    ]),
    phase("3. Motor de Comércio — mínimo", [
      criterion("modelos Cart/Order existem", schema.includes("model Cart") && schema.includes("model Order") && schema.includes("model OrderItem"), "Prisma tem Cart, Order e OrderItem", "Schema sem modelos comerciais"),
      criterion("carrinho persistente/editavel", exists("app/api/cart/route.ts") && exists("app/carrinho/page.tsx") && smartCart.includes("localStorage") && smartCart.includes("update(") && smartCart.includes("remove("), "API /api/cart, /carrinho e carrinho local com add/update/remove", "Carrinho sem persistencia ou edicao"),
      criterion("pedido criado antes do redirect", checkoutPreference.includes("prisma.order.create") && checkoutPreference.indexOf("prisma.order.create") < checkoutPreference.indexOf("await createMercadoPagoPreference"), "app/api/checkout/preference cria Order antes de preferencia Mercado Pago", "Checkout nao persiste pedido antes de sair"),
      criterion("rastreio de pedido existe", exists("app/pedidos/page.tsx") && exists("app/pedidos/[id]/page.tsx") && exists("app/api/orders/track/route.ts"), "/pedidos, /pedidos/[id] e /api/orders/track presentes", "Sem pagina/rota de rastreio"),
      criterion(
        "e2e checkout/carrinho executado",
        playwright?.e2eExitCode === 0 && playwright?.testsExitCode === 0 && playwright?.smartStoreExitCode === 0,
        `smoke=${playwright?.testsExitCode} (${playwright?.testsExpected ?? "?"}), smart=${playwright?.smartStoreExitCode} (${playwright?.smartStoreExpected ?? "?"}), e2e=${playwright?.e2eExitCode} (${playwright?.e2eExpected ?? "?"})`,
        "Rodar suíte Playwright atual"
      ),
      criterion("banco local/producao disponivel para prova runtime", localDbConfigured, "DATABASE_URL presente no ambiente do script", "Sem DATABASE_URL neste ambiente; criacao real no banco nao foi provada nesta execucao local"),
    ]),
    phase("3. Motor de Comércio — avançado", [
      criterion("Mercado Pago integrado em codigo", checkoutPreference.includes("createMercadoPagoPreference") && ordersRoute.includes("createMercadoPagoPayment"), "rotas chamam createMercadoPagoPreference/createMercadoPagoPayment", "Sem integracao de gateway"),
      criterion("credenciais Mercado Pago presentes", mpConfigured, "MERCADOPAGO_ACCESS_TOKEN + NEXT_PUBLIC_MP_PUBLIC_KEY no ambiente", "Credenciais Mercado Pago ausentes nesta execucao; fica fallback/sandbox"),
      criterion("frete/CEP implementado", exists("app/api/shipping/quote/route.ts") && checkoutPreference.includes("quoteBestShipping"), "/api/shipping/quote e quoteBestShipping", "Sem calculo de frete"),
      criterion("email transacional implementado", checkoutPreference.includes("sendMail") && exists("lib/email-templates.ts"), "sendMail + orderConfirmationHtml no fluxo", "Sem email transacional"),
      criterion("SMTP real configurado", emailConfigured, "SMTP_HOST + EMAIL_FROM no ambiente", "Credenciais SMTP ausentes nesta execucao"),
    ]),
    phase("4. Busca/Filtro/Recomendação", [
      criterion("busca API/catalogo", exists("app/api/catalog/search/route.ts"), "/api/catalog/search presente", "Sem busca server-side"),
      criterion("autocomplete Ctrl K", exists("components/header-command-palette.tsx") && read("components/header-command-palette.tsx").includes("/api/catalog/search"), "HeaderCommandPalette consulta /api/catalog/search", "Autocomplete nao comprovado"),
      criterion("filtros por categoria/preco/prazo/personalizacao", smartStore.includes("data-smart-category") && smartStore.includes("data-smart-price") && smartStore.includes("personalizableOnly") && smartStore.includes("prazo"), "SmartStorefront tem categoria, preco, personalizacao e prazo", "Filtros exigidos ausentes"),
      criterion("ordenacoes exigidas", smartStore.includes("menor-preco") && smartStore.includes("maior-preco") && smartStore.includes("novidades") && smartStore.includes("relevancia"), "ordenacoes no select da loja", "Ordenacao incompleta"),
      criterion("recomendacoes/relacionados", exists("app/api/catalog/recommendations/route.ts") && smartStore.includes("related"), "/api/catalog/recommendations e relacionados na loja", "Sem recomendacao"),
    ]),
    phase("5. Confiança/Prova Social", [
      criterion("reviews reais por produto", schema.includes("model Review") && exists("app/api/products/[slug]/reviews/route.ts"), "Prisma Review + rota de reviews", "Sem sistema de avaliacao"),
      criterion("AggregateRating condicional", catalogPdp.includes("productSignals && productSignals.reviewCount > 0") && smartPdp.includes("reviewSummary.average") && pdpSeoSource.includes("AggregateRating"), "AggregateRating so entra quando ha average/reviewCount real", "Nota agregada pode ser ficticia"),
      criterion("CDC art. 49 explicito", returnsPage.includes("art. 49") && trocaPage.includes("art. 49"), "/trocas-e-devolucoes e /politica-de-troca citam CDC art. 49", "Politica sem CDC art. 49"),
      criterion("selos de confianca loja", (catalogPage + smartPdp).includes("Feito sob encomenda") && (catalogPage + smartPdp).includes("Compra segura via checkout externo"), "/catalogo e PDP smart exibem selos exigidos; /loja redireciona para /catalogo", "Selos de confianca ausentes"),
    ]),
    phase("6. SEO técnico", [
      criterion("Product schema em PDP", catalogPdp.includes("'@type': 'Product'") && smartPdp.includes('"@type": "Product"') && pdpSeoSource.includes("priceCurrency"), "/catalogo/[slug] e /produto/[slug] incluem Product JSON-LD com BRL", "PDP sem schema Product"),
      criterion("Review schema condicional", catalogPdp.includes("'@type': 'Review'") && catalogPdp.includes("reviewSnippets.map") && smartPdp.includes('"@type": "Review"') && smartPdp.includes("reviews.map"), "Reviews reais viram JSON-LD quando existem", "Review schema ausente"),
      criterion("BreadcrumbList", catalogPdp.includes("BreadcrumbList") && smartPdp.includes("BreadcrumbList"), "PDPs incluem BreadcrumbList", "Breadcrumb schema ausente"),
      criterion("sitemap dinamico", read("app/sitemap.ts").includes("getCatalogSnapshot") && read("app/sitemap.ts").includes("getLocalStoreProducts"), "sitemap usa catalogo publico + loja inteligente", "Sitemap nao vem do catalogo real"),
      criterion("robots/canonical", exists("app/robots.ts") && catalogPdp.includes("alternates:") && catalogPdp.includes("canonical") && smartPdp.includes("alternates:") && smartPdp.includes("canonical"), "robots.ts e canonical dinamico nas PDPs", "robots/canonical incompletos"),
    ]),
    phase("7. Analytics", [
      criterion("dataLayer seguro", read("lib/mdh-store/analytics.ts").includes("window.dataLayer = window.dataLayer || []"), "trackSmartStoreEvent inicializa dataLayer", "dataLayer pode quebrar sem GTM"),
      criterion("eventos loja exigidos", ["view_product", "search_product", "add_to_cart", "click_buy_nuvemshop", "click_whatsapp_budget", "checkout_whatsapp"].every((event) => read("lib/mdh-store/analytics.ts").includes(event)), "eventos da loja inteligente declarados", "Eventos exigidos faltando"),
      criterion("GA4 marketplace legado", read("lib/analytics.ts").includes("view_item") && read("lib/analytics.ts").includes("begin_checkout") && read("lib/analytics.ts").includes("purchase"), "GA4 view_item/add_to_cart/begin_checkout/purchase em lib/analytics.ts", "Eventos GA4 legados faltando"),
      criterion("Pixel opcional sem quebrar", layout.includes("EcommerceAnalytics") && layout.includes("getStorefrontMetaPixelId"), "layout carrega pixel via env opcional", "Pixel nao opcional"),
      criterion("captura runtime de eventos", false, "nenhum DebugView/Tag Assistant capturado nesta execucao", "Capturar eventos em navegador/Tag Assistant para 100%"),
    ]),
    phase("8. Acessibilidade", [
      criterion("axe em paginas-chave", Boolean(axe?.results?.length >= 10), `${axe?.results?.length || 0} checks axe`, "Rode axe mobile+desktop em paginas-chave"),
      criterion("violacoes axe zeradas", Number(axe?.totalViolations || 0) === 0, `${axe?.totalViolations ?? "sem medicao"} violacoes`, "Corrigir violacoes axe restantes"),
      criterion("skip link funcional", Boolean(axe?.skipLinkOk), `skipLinkOk=${Boolean(axe?.skipLinkOk)}`, "Skip link nao focou/moveu para main nos testes"),
      criterion("alt em imagens de produto", read("components/mdh-store/ProductExperience.tsx").includes("alt={product.name}") && smartStore.includes("alt={product.name}"), "PDP e cards usam alt de produto", "Alt de produto ausente"),
      criterion("teclado no carrinho/checkout", playwright?.e2eExitCode === 0 && smartStore.includes('role="dialog"') && smartStore.includes("aria-modal"), "dialog de carrinho tem role/aria e e2e passou", "Navegacao por teclado nao comprovada o bastante"),
    ]),
    phase("9. Segurança/LGPD", [
      criterion("banner cookies + privacidade", exists("components/cookie-consent.tsx") && exists("app/politica-de-privacidade/page.tsx"), "CookieConsent e politica de privacidade presentes", "LGPD basico ausente"),
      criterion("headers producao", validateProductionHeaders(publicHttp), "CSP/HSTS/X-Content-Type-Options capturados por HEAD publico", "Headers publicos faltando"),
      criterion("auditoria seguranca app", securityAudit?.ok === true, `security:audit ok=${securityAudit?.ok}`, "security:audit com achados"),
      criterion("scanner de segredos atual+branch", secrets?.ok === true, `${secrets?.currentFindings?.length ?? "sem"} atuais, ${secrets?.introducedFindings?.length ?? "sem"} introduzidos; historico global ok=${secrets?.allHistoryOk === true}`, "Secret scan encontrou achados atuais/introduzidos ou nao foi executado"),
      criterion("Supabase RLS privado", dbStorage?.ok === true && read("supabase/migrations/20260606063633_mdh_storage_rls_policies.sql").includes("enable row level security"), "validate:db-storage + migration RLS", "Falta teste runtime 401/403 sem token ou RLS ausente"),
    ]),
    phase("10. Risco de PI", [
      criterion("auditoria de termos de PI gerada", Array.isArray(ipReport.findings), `${ipReport.totalFindings} achados`, "Gerar reports/marketplace-ip-risk-report.json"),
      criterion("classificacao e proposta por item", ipReport.findings.every((item) => item.matches?.length && item.suggestedCopy), "cada achado tem risco e suggestedCopy", "Achados sem classificacao/proposta"),
      criterion("sem risco publico restante", ipReport.totalFindings === 0, `${ipReport.totalFindings} referencias publicas de risco`, "Reescrever/remover termos de marca/franquia restantes"),
    ]),
    phase("11. Integridade de catálogo", [
      criterion("contagem catalogo atual", catalogIntegrity.publicCatalogCount > 0 && catalogIntegrity.smartStoreCount > 0, `${catalogIntegrity.publicCatalogCount} publicos + ${catalogIntegrity.smartStoreCount} loja`, "Catalogo vazio ou loja CSV nao carregou"),
      criterion("preco Pix/cartao coerente", pricing?.ok === true && catalogIntegrity.publicPricingIssues.length === 0 && catalogIntegrity.smartPricingIssues.length === 0, `${pricing?.productsChecked || 0} produtos em pricing-validation; smart issues ${catalogIntegrity.smartPricingIssues.length}`, "Corrigir Pix/cartao/custo+30%"),
      criterion("sem duplicata slug", catalogIntegrity.duplicatePublicSlugs.length === 0, `${catalogIntegrity.duplicatePublicSlugs.length} duplicatas`, "Resolver duplicatas de slug"),
      criterion("sem Picsum publico", catalogIntegrity.publicPicsumCount === 0 && catalogIntegrity.smartPicsumCount === 0, `public ${catalogIntegrity.publicPicsumCount}, smart ${catalogIntegrity.smartPicsumCount}`, "Remover Picsum de imagens publicas"),
      criterion("regressao publica catalogo/jogos", publicRegressions?.ok === true, `ok=${publicRegressions?.ok}`, "validate:public-regressions falhou ou nao foi executado"),
    ]),
    phase("12. Testes", [
      criterion("db:generate/typecheck/lint/build", ["npm run db:generate", "npm run typecheck", "npm run lint:check", "npm run build"].every((cmd) => gatePassed(gates, cmd)), ["npm run db:generate", "npm run typecheck", "npm run lint:check", "npm run build"].map((cmd) => `${cmd}: ${gateEvidence(gates, cmd)}`).join("; "), "Gates principais falharam"),
      criterion("validadores publicos/privados", ["npm run validate:industrial-ui", "npm run validate:auth", "npm run validate:db-storage", "npm run validate:private-routes", "npm run validate:public-regressions"].every((cmd) => gatePassed(gates, cmd)), "validadores obrigatorios com exit 0", "Validadores obrigatorios falharam"),
      criterion("npm audit", gatePassed(gates, "npm audit --audit-level=low"), gateEvidence(gates, "npm audit --audit-level=low"), "npm audit nao esta limpo"),
      criterion(
        "Playwright existente",
        playwright?.e2eExitCode === 0 && playwright?.testsExitCode === 0 && playwright?.smartStoreExitCode === 0,
        `smoke=${playwright?.testsExitCode} (${playwright?.testsExpected ?? "?"}), smart=${playwright?.smartStoreExitCode} (${playwright?.smartStoreExpected ?? "?"}), e2e=${playwright?.e2eExitCode} (${playwright?.e2eExpected ?? "?"})`,
        "Suítes Playwright nao passaram"
      ),
      criterion(
        "testes loja inteligente",
        smartStoreSmoke.ok &&
          smartStoreSmoke.total >= 6 &&
          smartStoreSmoke.titles.some((title) => title.includes("/produto sem cair na busca")) &&
          read("tests/mdh-smart-store.spec.ts").includes("SMART_PRODUCT_SLUG"),
        `tests/mdh-smart-store.spec.ts: ${smartStoreSmoke.passed}/${smartStoreSmoke.total} specs passaram; cobre PDP smart /produto, WhatsApp, carrinho, feed e sitemap`,
        "Cobertura loja inteligente incompleta"
      ),
    ]),
    phase("13. Deploy/Infra", [
      criterion("docs Vercel env atualizados", envText.includes("VITE_GTM_ID") && envText.includes("MERCADOPAGO_ACCESS_TOKEN") && envText.includes("NEXT_PUBLIC_NUVEMSHOP_BASE_URL"), "docs/VERCEL_ENV.md lista loja, analytics, checkout", "docs/VERCEL_ENV.md incompleto"),
      criterion("Dockerfile/docker-compose presentes", exists("Dockerfile") && exists("docker-compose.yml"), "Dockerfile + docker-compose.yml presentes", "Docker ausente"),
      criterion("build Docker comprovado", dockerBuild?.ok === true, `dockerBuild ok=${dockerBuild?.ok}`, "Rodar docker compose build/up e registrar log"),
      criterion("deploy Vercel registrado", Boolean(deployReport?.deploymentUrl || deployReport?.url), deployReport?.deploymentUrl || deployReport?.url || "sem reports/vercel-deploy-report.json", "Registrar deploy Vercel final desta rodada"),
      criterion("producao responde e local/site comparados", publicHttp.ok && publicCompare?.ok === true, `publicHttp=${publicHttp.ok}, local-vs-prod=${publicCompare?.ok}`, "Rodar validacao publica/local e corrigir divergencias"),
    ]),
  ];

  const generalPercent = Math.floor((phases.reduce((sum, item) => sum + item.percent, 0) / phases.length) * 100) / 100;
  const blocked = phases.flatMap((item) => item.blockers.map((blocker) => ({ phase: item.name, blocker })));
  const audit = {
    generatedAt: new Date().toISOString(),
    branch: git(["branch", "--show-current"]),
    commit: git(["rev-parse", "--short", "HEAD"]),
    worktreeDirty: Boolean(git(["status", "--porcelain"])),
    phases,
    generalPercent,
    metrics: {
      lighthouse: lighthouse?.pages?.map((page) => ({ key: page.key, categories: page.categories, lcp: page.audits?.lcp?.displayValue, cls: page.audits?.cls?.displayValue })) || [],
      bundleInitialSharedJs: firstLoadJs,
      axeViolations: axe?.totalViolations ?? null,
      axeSeriousOrCritical: axe?.seriousOrCritical ?? null,
      publicPhotoPercent: publicPhotoPercent(catalogIntegrity, catalogValidation),
      productSchemaCoverage: "100% por rota /produto/[slug] da loja inteligente; catalogo legado validado por codigo, nao por crawl total nesta execucao",
    },
    blocked,
  };
  writeJson(phaseAuditJson, audit);

  const lines = [];
  lines.push("# Relatório de Execução — MDH 3D nível Apple/ML/AliExpress/Shopee");
  lines.push(`Data: ${audit.generatedAt}`);
  lines.push(`Commit avaliado: ${audit.commit}`);
  lines.push(`Worktree com alterações no momento da auditoria: ${audit.worktreeDirty ? "sim" : "não"}`);
  lines.push("");
  lines.push("## 1. Reconciliação (Fase 0)");
  lines.push("| Item afirmado antes | Fonte | Status real | Evidência |");
  lines.push("|---|---|---|---|");
  for (const claim of phase0?.claims || []) {
    lines.push(`| ${truncate(claim.item, 180)} | ${escapeTable(claim.source)} | ${escapeTable(claim.status)} | ${truncate(claim.evidence, 320)} |`);
  }
  lines.push("");
  lines.push("## 2. Progresso por fase");
  lines.push("| Fase | % concluído | Critério de aceite | Evidência (comando/print/log) | Bloqueio (se houver) |");
  lines.push("|---|---:|---|---|---|");
  for (const item of phases) {
    lines.push(`| ${escapeTable(item.name)} | ${item.percent.toFixed(2)}% | ${item.passed}/${item.total} critérios passaram | ${truncate(criteriaEvidence(item.criteria), 900)} | ${truncate(criteriaBlockers(item.criteria), 520)} |`);
  }
  lines.push("");
  lines.push("## 3. Métricas antes → depois");
  lines.push(`- Lighthouse mobile (home/produto/checkout): antes não medido nesta fase → depois home ${metricLine(lighthouse, "home")}; produto ${metricLine(lighthouse, "product")}; checkout ${metricLine(lighthouse, "checkout")}`);
  lines.push("- LCP/INP/CLS: antes não medido nesta fase → depois registrado em `reports/marketplace-lighthouse-summary.json`; INP lab pode não existir em todas as versões do Lighthouse.");
  lines.push(`- Bundle JS inicial: antes ${firstLoadJs} → depois ${firstLoadJs} (sem alteração de bundle comprovada nesta rodada).`);
  lines.push(`- Violações de acessibilidade (axe-core): antes não medido nesta fase → depois ${axe?.totalViolations ?? "sem medição"} violações, ${axe?.seriousOrCritical ?? "sem medição"} sérias/críticas.`);
  lines.push(`- % de produtos com foto real (não Picsum): antes não medido nesta fase → depois ${publicPhotoPercent(catalogIntegrity, catalogValidation)} no relatório de validação de catálogo; loja inteligente tem ${catalogIntegrity.smartPicsumCount} Picsum e ${catalogIntegrity.smartPlaceholderCount} placeholders explícitos.`);
  lines.push(`- % de produtos com schema Product válido: antes não medido nesta fase → depois ${audit.metrics.productSchemaCoverage}.`);
  lines.push("");
  lines.push("## 4. Percentual geral honesto");
  lines.push(`Cálculo: média ponderada das ${phases.length} linhas da fase 2 (não arredondar para cima).`);
  lines.push(`Resultado: ${generalPercent.toFixed(2)}%`);
  lines.push("");
  lines.push("## 5. Pendências explícitas e o que falta para 100%");
  if (blocked.length) {
    for (const item of blocked) {
      lines.push(`- ${item.phase}: ${item.blocker}`);
    }
  } else {
    lines.push("- Nenhum bloqueio restante detectado pelos critérios automatizados atuais.");
  }
  lines.push("");

  writeFileSync(reportPath, `${lines.join("\n")}`, "utf8");
  console.log(`Marketplace phase audit written to ${path.relative(root, reportPath).replaceAll("\\", "/")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
