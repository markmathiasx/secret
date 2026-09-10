import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT, writeJson } from "./catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { getFirstSaleProducts } = require("@/lib/commerce/first-sale-products");
const { calculateCardPrice } = require("@/lib/payment-pricing");

const home = [
  "app/page.tsx",
  "components/commerce/BestSellersSection.tsx",
  "components/commerce/IntentShoppingSection.tsx",
  "components/commerce/TrustProofSection.tsx",
  "components/commerce/HowItWorksSection.tsx",
  "components/commerce/WhatsAppQuoteCta.tsx",
].map((relative) => fs.readFileSync(path.join(ROOT, relative), "utf8")).join("\n");
const curated = getFirstSaleProducts();
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

expect(curated.length === 12, `esperado 12 produtos campeoes, encontrado ${curated.length}`);
expect(new Set(curated.map((item) => item.product.id)).size === curated.length, "curadoria tem produto duplicado");

for (const item of curated) {
  const product = catalog.find((entry) => entry.id === item.product.id);
  expect(Boolean(product), `produto inexistente na curadoria: ${item.product.id}`);
  expect(item.product.pricePix > 0, `produto sem Pix valido: ${item.product.id}`);
  expect(item.product.priceCard === calculateCardPrice(item.product.pricePix), `cartao nao e Pix + R$1: ${item.product.id}`);
  expect(Boolean(item.image) && !/placeholder/i.test(item.image), `produto campeao com placeholder: ${item.product.id}`);
  expect(Boolean(item.product.productionWindow), `produto sem prazo: ${item.product.id}`);
}

[
  "Pequenos objetos.",
  "Grandes ideias.",
  "Encontrar minha peça",
  "Criar algo meu",
  "Prazo explicado",
  "Pedir peça sob medida",
  "Escolher bem começa sem dúvidas.",
  "Atendimento humano",
].forEach((copy) => expect(home.includes(copy), `home sem copy obrigatoria: ${copy}`));

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  curated: curated.map((item) => ({
    slot: item.slot,
    id: item.product.id,
    name: item.product.name,
    pricePix: item.product.pricePix,
    priceCard: item.product.priceCard,
  })),
  errors,
};

writeJson("reports/first-sale-copy-validation-report.json", report);

if (errors.length) {
  console.error("Falha em validate-first-sale-copy:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK: primeira venda validada com ${curated.length} produtos campeoes.`);
