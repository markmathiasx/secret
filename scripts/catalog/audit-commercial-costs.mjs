#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "data", "products.json");
const OVERRIDES_INPUT = path.join(ROOT, "data", "admin-product-overrides.json");
const OUTPUT_DIR = path.join(ROOT, "output");
const strict = process.argv.includes("--strict");

const defaults = {
  spoolPricePerKg: 100,
  machineHourlyRate: 4.5,
  laborHourlyRate: 15,
  packagingSmall: 1.5,
  packagingMedium: 2.5,
  shippingSuppliesSmall: 0.7,
  shippingSuppliesMedium: 1.4,
  keychainSplitRing: 0.22,
  keychainChain: 0.18,
  keychainRetailPackaging: 0.25,
  keychainPersonalizationSetup: 5,
  failureReservePercent: 8,
  overheadPercent: 8,
  grossMargin: 30,
};

function money(value) {
  return Number((Number(value) || 0).toFixed(2));
}

function parseHours(value) {
  if (typeof value === "number") return Math.max(0, value);
  const match = String(value || "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function text(product) {
  return normalize([
    product.nome,
    product.categoria,
    product.colecao,
    ...(product.tags || []),
  ].filter(Boolean).join(" "));
}

function isKeychainProduct(product) {
  return /chaveiro|keychain|pingente|tag pet|tag de identificacao/.test(text(product));
}

function inferPackQuantity(product) {
  const blob = text(product);
  const matches = [
    blob.match(/(?:kit|lote|pacote)\s*(?:com\s*)?(\d{1,3})/),
    blob.match(/(\d{1,3})\s*(?:unidades|unidade|un\b|pcs\b|pecas|chaveiros)/),
  ];
  for (const match of matches) {
    const quantity = Number(match?.[1]);
    if (Number.isFinite(quantity) && quantity >= 1 && quantity <= 500) return Math.floor(quantity);
  }
  return 1;
}

function materialIssue(product) {
  const material = normalize(product.material);
  if (/resina|resin/.test(material)) return "material-incompativel-com-bambu-a1-a1-mini";
  return null;
}

function estimate(product, override = {}) {
  const grams = Math.max(0, Number(override.estimatedGrams ?? product.peso) || 0);
  const hours = Math.max(0, Number(override.estimatedHours) || parseHours(product.tempoImpressao));
  const isKeychain = isKeychainProduct(product);
  const packQuantity = isKeychain ? inferPackQuantity(product) : 1;
  const customizable = Boolean(override.customizable) || /personaliz|nome|logo/.test(text(product));
  const laborMinutes = Number(override.postProcessMinutes) || (isKeychain ? 12 : 8);
  const filament = grams * ((Number(override.spoolPricePerKg) || defaults.spoolPricePerKg) / 1000);
  const machine = hours * (Number(override.machineHourlyRate) || defaults.machineHourlyRate);
  const labor = (laborMinutes / 60) * (Number(override.laborHourlyRate) || defaults.laborHourlyRate);
  const packaging = isKeychain
    ? 0
    : Number(override.packagingCost) || (grams > 80 ? defaults.packagingMedium : defaults.packagingSmall);
  const hardware = isKeychain
    ? Number(override.hardwareCost) || (defaults.keychainSplitRing + defaults.keychainChain) * packQuantity
    : 0;
  const retailPackaging = isKeychain
    ? Number(override.retailPackagingCost) || defaults.keychainRetailPackaging * packQuantity
    : 0;
  const shippingSupplies = Number(override.shippingSuppliesCost) ||
    (grams > 80 || packQuantity >= 10 ? defaults.shippingSuppliesMedium : defaults.shippingSuppliesSmall);
  const designSetup = isKeychain && customizable
    ? Number(override.designSetupCost) || defaults.keychainPersonalizationSetup
    : 0;
  const calculatedProduction = filament + machine + labor + packaging;
  const legacyCostFloor = Math.max(
    0,
    Number(override.estimatedUnitCost ?? override.costBase) || 0
  );
  const productionCost = Math.max(calculatedProduction, legacyCostFloor);
  const direct = productionCost + hardware + retailPackaging + shippingSupplies + designSetup;
  const failurePercent = Number(override.failureReservePercent) || defaults.failureReservePercent;
  const failure = direct * (failurePercent / 100);
  const overheadPercent = Number(override.overheadPercent) || defaults.overheadPercent;
  const overhead = (direct + failure) * (overheadPercent / 100);
  const totalCost = direct + failure + overhead;
  const safePrice = totalCost / (1 - defaults.grossMargin / 100);
  return {
    grams,
    hours,
    isKeychain,
    packQuantity,
    totalCost: money(totalCost),
    safePrice: money(safePrice),
  };
}

if (!fs.existsSync(INPUT)) {
  console.error(`Arquivo não encontrado: ${INPUT}`);
  process.exit(2);
}

const products = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const overrides = fs.existsSync(OVERRIDES_INPUT)
  ? JSON.parse(fs.readFileSync(OVERRIDES_INPUT, "utf8"))
  : {};
const issues = [];

for (const product of products) {
  const override = overrides[product.id] || {};
  const estimateResult = estimate(product, override);
  const publicPrice = Number(override.pricePix ?? product.precoPix) || 0;
  const productIssues = [];

  if (/^item\s+\d+\s+from\s+/i.test(String(product.nome || ""))) {
    productIssues.push("nome-gerado");
  }
  if (/^description for item/i.test(String(product.descricao || ""))) {
    productIssues.push("descricao-gerada");
  }
  if (
    product.material &&
    !/pla/i.test(String(product.material)) &&
    /produzido em pla/i.test(String(product.descricao || ""))
  ) {
    productIssues.push("material-divergente-da-descricao");
  }
  const incompatibleMaterial = materialIssue(product);
  if (incompatibleMaterial) productIssues.push(incompatibleMaterial);

  if (publicPrice <= 0) {
    productIssues.push("preco-ausente-ou-zero");
  } else if (publicPrice < estimateResult.totalCost) {
    productIssues.push("preco-abaixo-do-custo-completo");
  } else if (publicPrice < estimateResult.safePrice) {
    productIssues.push("preco-abaixo-da-margem-bruta-minima");
  }

  if (productIssues.length) {
    issues.push({
      id: product.id,
      nome: product.nome,
      material: product.material,
      peso: product.peso,
      tempoImpressao: product.tempoImpressao,
      precoPixCatalogo: Number(product.precoPix) || 0,
      precoPixOverride: Number(override.pricePix) || null,
      precoPublicoAvaliado: publicPrice,
      custoCompletoEstimado: estimateResult.totalCost,
      precoSeguroEstimado: estimateResult.safePrice,
      chaveiro: estimateResult.isKeychain,
      quantidadeInferidaNoKit: estimateResult.packQuantity,
      problemas: productIssues,
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  input: path.relative(ROOT, INPUT),
  overridesInput: fs.existsSync(OVERRIDES_INPUT) ? path.relative(ROOT, OVERRIDES_INPUT) : null,
  policy: defaults,
  totalProducts: products.length,
  productsWithIssues: issues.length,
  issueCounts: issues.reduce((acc, item) => {
    for (const issue of item.problemas) acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {}),
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_DIR, "catalog-commercial-audit.json"),
  JSON.stringify({ summary, issues }, null, 2) + "\n"
);

const md = [
  "# Auditoria comercial do catálogo",
  "",
  `Gerado em: ${summary.generatedAt}`,
  `Produtos analisados: ${summary.totalProducts}`,
  `Produtos com problema: ${summary.productsWithIssues}`,
  "",
  "## Contagem por problema",
  "",
  ...Object.entries(summary.issueCounts).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Primeiros 150 itens para correção",
  "",
  "| ID | Produto | Pix público | Custo completo | Preço seguro | Problemas |",
  "|---|---|---:|---:|---:|---|",
  ...issues.slice(0, 150).map((item) =>
    `| ${item.id || ""} | ${String(item.nome || "").replace(/\|/g, "\\|")} | R$ ${money(item.precoPublicoAvaliado).toFixed(2)} | R$ ${item.custoCompletoEstimado.toFixed(2)} | R$ ${item.precoSeguroEstimado.toFixed(2)} | ${item.problemas.join(", ")} |`
  ),
  "",
  "> O frete cobrado pela transportadora não está incluído. A auditoria inclui argola, corrente, embalagem individual, envelope, etiqueta, fita e proteção de postagem.",
  "",
].join("\n");

fs.writeFileSync(path.join(OUTPUT_DIR, "catalog-commercial-audit.md"), md);
console.log(JSON.stringify(summary, null, 2));

if (strict && issues.some((item) => item.problemas.includes("preco-abaixo-do-custo-completo"))) {
  process.exit(1);
}
