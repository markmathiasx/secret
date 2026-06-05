import fs from "node:fs";
import path from "node:path";
import { createProjectRequire, ROOT, writeJson } from "./catalog/ts-runtime.mjs";

const require = createProjectRequire();
const { intentPageConfigs, getIntentProducts } = require("@/lib/commerce/first-sale-products");

const required = [
  "chaveiros-personalizados",
  "presentes-ate-50",
  "organizadores",
  "setup-gamer",
  "brindes-e-lotes",
  "peca-sob-medida",
];

const errors = [];
const pages = required.map((key) => {
  const config = intentPageConfigs[key];
  const pagePath = path.join(ROOT, "app", config.slug.replace(/^\//, ""), "page.tsx");
  const exists = fs.existsSync(pagePath);
  const products = getIntentProducts(config.intent, 12);
  if (!exists) errors.push(`pagina ausente: ${config.slug}`);
  if (products.length < 6) errors.push(`${config.slug} tem menos de 6 produtos reais`);
  if (!config.title || !config.description || !config.faq?.length) errors.push(`${config.slug} sem SEO/FAQ`);
  return {
    slug: config.slug,
    title: config.title,
    products: products.length,
  };
});

const sitemap = fs.readFileSync(path.join(ROOT, "app/sitemap.ts"), "utf8");
for (const key of required) {
  const slug = intentPageConfigs[key].slug;
  if (!sitemap.includes(slug)) errors.push(`sitemap sem ${slug}`);
}

writeJson("reports/intent-pages-validation-report.json", {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  pages,
  errors,
});

if (errors.length) {
  console.error("Falha em validate-intent-pages:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK: ${required.length} paginas por intencao validadas.`);
