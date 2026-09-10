import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createProjectRequire } from "./ts-runtime.mjs";

const root = process.cwd();
const configPath = path.join(root, "data", "commercial-storefront.json");
const catalogPath = path.join(root, "lib", "catalog.ts");
const policyPath = path.join(root, "lib", "commercial-catalog-policy.ts");
const firstSalePath = path.join(root, "lib", "commerce", "first-sale-products.ts");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const catalogSource = fs.readFileSync(catalogPath, "utf8");
const policySource = fs.readFileSync(policyPath, "utf8");
const firstSaleSource = fs.readFileSync(firstSalePath, "utf8");
const errors = [];
const require = createProjectRequire();
const { catalog, commercialFeaturedCatalog } = require("@/lib/catalog");
const { filterDirectSaleCatalogProducts, filterPublicCatalogProducts } = require("@/lib/public-catalog");
const { getProductVisual } = require("@/lib/product-visuals");
const publicCatalog = filterPublicCatalogProducts(catalog);
const directSaleCatalog = filterDirectSaleCatalogProducts(catalog);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

if (config.publicProductIds.length !== 12) errors.push("A vitrine deve ter exatamente 12 produtos.");
if (new Set(config.publicProductIds).size !== config.publicProductIds.length) errors.push("Há IDs duplicados.");
if (config.maximumPublicProducts !== 12) errors.push("maximumPublicProducts deve ser 12.");
if (config.scope !== "featured-storefront") errors.push("scope deve ser featured-storefront.");
if (config.expectedFullCatalogProducts !== publicCatalog.length) {
  errors.push(`expectedFullCatalogProducts deve preservar os ${publicCatalog.length} produtos públicos.`);
}
if (config.minimumGrossMarginPercent < 35) errors.push("A margem bruta mínima deve ser pelo menos 35%.");

for (const id of config.publicProductIds) {
  const product = config.products[id];
  if (!product) {
    errors.push(`${id}: produto ausente no arquivo comercial.`);
    continue;
  }
  if (!catalogSource.includes(`id: "${id}"`) && !catalogSource.includes(`id: '${id}'`)) {
    errors.push(`${id}: produto não encontrado em lib/catalog.ts.`);
  }
  if (!firstSaleSource.includes(`"${id}"`)) errors.push(`${id}: produto não está nos slots de primeira venda.`);
  if (!product.pricePix || product.pricePix < 29.9) errors.push(`${id}: preço Pix abaixo do piso de entrada.`);
  if (!product.description || product.description.length < 80) errors.push(`${id}: descrição curta.`);
  if (!product.productionWindow) errors.push(`${id}: prazo ausente.`);
  if (!product.dimensions) errors.push(`${id}: dimensões ausentes.`);
  if (!Array.isArray(product.colors) || !product.colors.length) errors.push(`${id}: cores ausentes.`);
  const material = normalize(product.material);
  if (!config.idealMaterials.some((allowed) => material.includes(normalize(allowed)))) {
    errors.push(`${id}: material incompatível com o perfil comercial das impressoras.`);
  }
  const blob = normalize([
    product.name,
    product.description,
    product.theme,
    ...(product.tags || []),
  ].join(" "));
  const blocked = config.blockedTerms.filter((term) => blob.includes(normalize(term)));
  if (blocked.length) errors.push(`${id}: termos bloqueados ${blocked.join(", ")}.`);
}

for (const required of [
  "applyCommercialCatalogVisibility",
  "applyCommercialProductOverride",
  "assertCommercialCatalog",
  "hasCommercialProductOverride",
  "commercialFeaturedCatalog",
]) {
  if (!catalogSource.includes(required)) errors.push(`lib/catalog.ts não usa ${required}.`);
}

if (commercialFeaturedCatalog.length !== config.maximumPublicProducts) {
  errors.push(`Curadoria principal incompleta: ${commercialFeaturedCatalog.length}/${config.maximumPublicProducts}.`);
}

if (publicCatalog.length < 500) errors.push(`Catálogo público reduzido indevidamente para ${publicCatalog.length} itens.`);
if (directSaleCatalog.length < 12) errors.push(`Vitrine de compra direta insuficiente: ${directSaleCatalog.length} itens.`);

for (const product of directSaleCatalog) {
  if (product.pricingMode !== "faixa-auditada") errors.push(`${product.id}: item de orçamento vazou na compra direta.`);
  if (product.mediaProvenance?.commercialUse === "review-required") {
    errors.push(`${product.id}: licença comercial pendente vazou na compra direta.`);
  }
}

for (const id of config.publicProductIds) {
  const product = catalog.find((item) => item.id === id);
  if (!product) continue;
  const visible = publicCatalog.some((item) => item.id === id);
  if (!visible && getProductVisual(product).merchantReady) {
    errors.push(`${id}: item curado foi ocultado sem justificativa de mídia.`);
  }
}

for (const required of [
  "CURADORIA COMERCIAL BLOQUEADA",
  "minimumGrossMarginPercent",
  "blockedTerms",
  "idealMaterials",
]) {
  if (!policySource.includes(required)) errors.push(`Política comercial sem ${required}.`);
}

if (errors.length) {
  console.error("VALIDAÇÃO DA VITRINE: FALHOU");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("VALIDAÇÃO DA VITRINE: OK");
console.log(`Produtos públicos: ${publicCatalog.length}`);
console.log(`Compra direta: ${directSaleCatalog.length}`);
console.log(`Curadoria principal: ${config.publicProductIds.length}`);
console.log(`Margem bruta mínima: ${config.minimumGrossMarginPercent}%`);
console.log(`Versão: ${config.version}`);
