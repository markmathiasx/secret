import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

function check(condition, code) {
  if (!condition) errors.push(code);
}

const csv = read("data/produtos.csv");
const requiredHeaders = [
  "Identificador URL",
  "Nome",
  "Categorias",
  "Preço",
  "Preço promocional",
  "Peso (kg)",
  "Altura (cm)",
  "Largura (cm)",
  "Comprimento (cm)",
  "Estoque",
  "SKU",
  "Descrição",
  "Tags",
  "Título para SEO",
  "Descrição para SEO",
  "Marca",
  "Produto Físico",
];

for (const header of requiredHeaders) {
  check(csv.includes(header), `missing_header:${header}`);
}

check(/Link Nuvemshop/.test(csv), "missing_optional_nuvemshop_link_column");
check(/https:\/\/mdh3d\.lojavirtualnuvem\.com\.br/.test(csv) || /;"\/produtos\//.test(csv), "missing_product_with_nuvemshop_link");
check(/;"";"\/catalog-assets\//.test(csv), "missing_product_without_nuvemshop_link");

const sourceChecks = {
  "lib/mdh-store/products.ts": [
    "parseProductsCsv",
    "nuvemshopUrl",
    "getNuvemshopBaseUrl",
    "promotionalPrice",
    "cardPrice",
  ],
  "lib/mdh-store/links.ts": [
    "buildWhatsappUrl",
    "Olá, vim pelo site da MDH3D e quero orçamento/comprar:",
    "encodeURIComponent",
  ],
  "components/mdh-store/SmartStorefront.tsx": [
    "data-smart-search",
    "data-smart-category",
    "Finalizar pelo WhatsApp",
    "click_buy_nuvemshop",
    "click_whatsapp_budget",
    "search_product",
  ],
  "components/mdh-store/EcommerceAnalytics.tsx": [
    "gtmId",
    "metaPixelId",
    "PageView",
  ],
  "lib/mdh-store/config.ts": [
    "VITE_WHATSAPP_NUMBER",
    "VITE_GTM_ID",
    "VITE_META_PIXEL_ID",
    "VITE_NUVEMSHOP_BASE_URL",
  ],
};

for (const [file, needles] of Object.entries(sourceChecks)) {
  const source = read(file);
  for (const needle of needles) {
    check(source.includes(needle), `missing_source:${file}:${needle}`);
  }
}

for (const file of [
  "app/loja/page.tsx",
  "app/produto/[slug]/page.tsx",
  "app/feeds/google-shopping.xml/route.ts",
  "app/feeds/meta-catalog.csv/route.ts",
  "app/feeds/produtos.json/route.ts",
  "app/comprar-na-mdh3d/page.tsx",
  "app/politica-de-envio/page.tsx",
  "app/politica-de-troca/page.tsx",
  "app/termos-de-compra/page.tsx",
  "app/prazo-de-producao/page.tsx",
  "docs/ECOMMERCE_MDH3D.md",
]) {
  check(exists(file), `missing_file:${file}`);
}

const envExample = read(".env.example");
for (const key of ["VITE_WHATSAPP_NUMBER", "VITE_GTM_ID", "VITE_META_PIXEL_ID", "VITE_NUVEMSHOP_BASE_URL"]) {
  check(envExample.includes(key), `missing_env_example:${key}`);
}

const docs = read("docs/ECOMMERCE_MDH3D.md");
for (const term of ["produtos.csv", "Nuvemshop", "WhatsApp", "GTM", "Meta", "Google Shopping"]) {
  check(docs.includes(term), `missing_docs:${term}`);
}

const forbidden = [
  "NUVEMSHOP_ACCESS_TOKEN",
  "nuvemshop_token",
  "api.nuvemshop.com.br",
];
const touchedSources = [
  "lib/mdh-store/products.ts",
  "components/mdh-store/SmartStorefront.tsx",
  "app/loja/page.tsx",
  "app/produto/[slug]/page.tsx",
].map(read).join("\n");
for (const term of forbidden) {
  check(!touchedSources.toLowerCase().includes(term.toLowerCase()), `forbidden_credential_or_api:${term}`);
}

if (errors.length) {
  console.error(`FAIL: loja inteligente com ${errors.length} problema(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("OK: loja inteligente MDH3D validada.");
