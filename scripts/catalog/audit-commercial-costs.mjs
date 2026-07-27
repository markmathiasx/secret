import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const configPath = path.join(root, "data", "commercial-storefront.json");
const outputDir = path.join(root, "output");
const jsonOutput = path.join(outputDir, "catalog-commercial-audit.json");
const markdownOutput = path.join(outputDir, "catalog-commercial-audit.md");
const strict = process.argv.includes("--strict");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const defaults = {
  spoolPricePerKg: 100,
  machineHourlyRate: 4.5,
  laborHourlyRate: 15,
  smallPackaging: 1.5,
  mediumPackaging: 2.5,
  smallShippingSupplies: 0.85,
  mediumShippingSupplies: 1.5,
  failureReservePercent: 10,
  overheadPercent: 10,
  grossMarginPercent: config.minimumGrossMarginPercent,
};

function money(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function roundCommercialNinety(value) {
  const safe = Math.max(0.01, Number(value));
  const whole = Math.floor(safe);
  const sameReal = whole + 0.9;
  return money(sameReal + 0.000001 >= safe ? sameReal : whole + 1.9);
}

function calculate(product) {
  const grams = Number(product.estimatedGrams ?? product.grams ?? 0);
  const hours = Number(product.estimatedHours ?? product.hours ?? 0);
  const postProcessMinutes = Number(product.postProcessMinutes ?? 0);
  const packagingCost = Number(
    product.packagingCost ?? (grams > 80 ? defaults.mediumPackaging : defaults.smallPackaging)
  );
  const shippingSuppliesCost = Number(
    product.shippingSuppliesCost ?? (grams > 80 ? defaults.mediumShippingSupplies : defaults.smallShippingSupplies)
  );
  const hardwareCost = Number(product.hardwareCost ?? 0);
  const retailPackagingCost = Number(product.retailPackagingCost ?? 0);
  const designSetupCost = Number(product.designSetupCost ?? 0);
  const failurePercent = Number(product.failureReservePercent ?? defaults.failureReservePercent);
  const overheadPercent = Number(product.overheadPercent ?? defaults.overheadPercent);

  const filament = money(grams * (defaults.spoolPricePerKg / 1000));
  const machine = money(hours * defaults.machineHourlyRate);
  const labor = money((postProcessMinutes / 60) * defaults.laborHourlyRate);
  const production = money(filament + machine + labor + packagingCost);
  const directSubtotal = money(
    production + shippingSuppliesCost + hardwareCost + retailPackagingCost + designSetupCost
  );
  const failureReserve = money(directSubtotal * (failurePercent / 100));
  const overheadBase = money(directSubtotal + failureReserve);
  const overhead = money(overheadBase * (overheadPercent / 100));
  const totalCost = money(overheadBase + overhead);
  const minimumPrice = money(totalCost / (1 - defaults.grossMarginPercent / 100));
  const recommendedPrice = roundCommercialNinety(minimumPrice);
  const configuredPrice = money(product.pricePix);
  const grossMarginPercent = configuredPrice > 0
    ? money(((configuredPrice - totalCost) / configuredPrice) * 100)
    : 0;

  return {
    filament,
    machine,
    labor,
    packagingCost,
    shippingSuppliesCost,
    hardwareCost,
    retailPackagingCost,
    designSetupCost,
    failureReserve,
    overhead,
    totalCost,
    minimumPrice,
    recommendedPrice,
    configuredPrice,
    grossMarginPercent,
  };
}

const issues = [];
const ids = config.publicProductIds;
const uniqueIds = new Set(ids);

if (ids.length !== config.maximumPublicProducts) {
  issues.push(`Quantidade configurada ${ids.length}; esperado ${config.maximumPublicProducts}.`);
}
if (uniqueIds.size !== ids.length) issues.push("Há IDs duplicados na vitrine comercial.");

const rows = ids.map((id) => {
  const product = config.products[id];
  if (!product) {
    issues.push(`${id}: configuração ausente.`);
    return { id, issues: ["configuração ausente"] };
  }

  const rowIssues = [];
  const text = normalize([
    product.name,
    product.description,
    product.category,
    product.subcategory,
    product.theme,
    product.collection,
    ...(product.tags || []),
  ].filter(Boolean).join(" "));
  const material = normalize(product.material);
  const blocked = config.blockedTerms.filter((term) => text.includes(normalize(term)));
  const compatibleMaterial = config.idealMaterials.some((item) => material.includes(normalize(item)));
  const cost = calculate(product);

  if (!product.name || product.name.length < 12) rowIssues.push("nome incompleto");
  if (!product.description || product.description.length < 80) rowIssues.push("descrição incompleta");
  if (!compatibleMaterial) rowIssues.push("material fora do perfil A1/A1 Mini");
  if (blocked.length) rowIssues.push(`termos bloqueados: ${blocked.join(", ")}`);
  if (!(product.grams > 0)) rowIssues.push("gramas inválidos");
  if (!(product.hours > 0)) rowIssues.push("horas inválidas");
  if (!(product.postProcessMinutes >= 0)) rowIssues.push("acabamento inválido");
  if (cost.configuredPrice < cost.recommendedPrice) {
    rowIssues.push(`preço R$ ${cost.configuredPrice.toFixed(2)} abaixo do recomendado R$ ${cost.recommendedPrice.toFixed(2)}`);
  }
  if (cost.grossMarginPercent + 0.01 < config.minimumGrossMarginPercent) {
    rowIssues.push(`margem ${cost.grossMarginPercent.toFixed(2)}% abaixo de ${config.minimumGrossMarginPercent}%`);
  }

  for (const issue of rowIssues) issues.push(`${id}: ${issue}.`);
  return { id, name: product.name, ...cost, issues: rowIssues };
});

const report = {
  generatedAt: new Date().toISOString(),
  source: path.relative(root, configPath),
  version: config.version,
  publicProducts: ids.length,
  productsWithIssues: rows.filter((row) => row.issues?.length).length,
  issueCount: issues.length,
  policy: defaults,
  issues,
  products: rows,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const markdown = [
  "# Auditoria comercial MDH 3D",
  "",
  `- Versão: ${config.version}`,
  `- Produtos públicos: ${report.publicProducts}`,
  `- Produtos com problemas: ${report.productsWithIssues}`,
  `- Margem bruta mínima: ${config.minimumGrossMarginPercent}%`,
  "",
  "| Produto | Custo completo | Preço Pix | Margem | Situação |",
  "|---|---:|---:|---:|---|",
  ...rows.map((row) => `| ${row.name || row.id} | R$ ${(row.totalCost || 0).toFixed(2)} | R$ ${(row.configuredPrice || 0).toFixed(2)} | ${(row.grossMarginPercent || 0).toFixed(2)}% | ${row.issues?.length ? row.issues.join("; ") : "OK"} |`),
  "",
  issues.length ? `## Bloqueios\n\n${issues.map((issue) => `- ${issue}`).join("\n")}` : "## Resultado\n\nAPROVADO: nenhum bloqueio comercial.",
  "",
].join("\n");
fs.writeFileSync(markdownOutput, markdown, "utf8");

console.log(JSON.stringify({
  publicProducts: report.publicProducts,
  productsWithIssues: report.productsWithIssues,
  issueCount: report.issueCount,
  jsonOutput: path.relative(root, jsonOutput),
  markdownOutput: path.relative(root, markdownOutput),
}, null, 2));

if (strict && issues.length) process.exit(1);
