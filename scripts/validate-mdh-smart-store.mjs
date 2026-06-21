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
  "Custo de produção",
  "Custo do filamento/kg",
  "Lucro (%)",
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
    "copaThemeRows",
    "copaThemeRowToProduct",
    "nuvemshopUrl",
    "getNuvemshopBaseUrl",
    "promotionalPrice",
    "cardPrice",
    "productionCost",
    "filamentCost",
    "profitPercent",
    "material",
    "colors",
    "gallery",
  ],
  "lib/mdh-store/links.ts": [
    "buildWhatsappUrl",
    "buildCustomQuoteWhatsappUrl",
    "Olá, vim pelo site da MDH3D e quero orçamento/comprar:",
    "encodeURIComponent",
  ],
  "components/mdh-store/SmartStorefront.tsx": [
    "data-smart-search",
    "data-smart-category",
    "data-smart-material",
    "data-smart-sort",
    "Finalizar pelo WhatsApp",
    "coupon_apply",
    "click_buy_nuvemshop",
    "click_whatsapp_budget",
    "search_product",
    "Custo",
  ],
  "components/mdh-store/StoreAnimatedBackground.tsx": [
    "store-live-background",
    "store-live-background__printer",
  ],
  "components/mdh-store/ProductExperience.tsx": [
    "ProductMediaGallery",
    "ProductShippingEstimator",
    "LocalReviewsAndQuestions",
    "Zoom",
  ],
  "components/mdh-store/CustomQuoteForm.tsx": [
    ".stl",
    ".obj",
    ".3mf",
    "buildCustomQuoteWhatsappUrl",
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
    "VITE_TIKTOK_PIXEL_ID",
    "VITE_NUVEMSHOP_BASE_URL",
  ],
  "app/globals.css": [
    "store-animated-shell",
    "storeGridFlow",
    "storePrintHead",
  ],
  "lib/mdh-store/feeds.ts": [
    "buildTiktokCatalogCsv",
    "shipping_weight",
    "material",
    "color",
  ],
  "lib/copa-theme-expansion-catalog.ts": [
    "copaThemeExpansionCatalog",
    "profitTargetPercent",
    "Custo estimado",
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
  "app/feeds/tiktok-catalog.csv/route.ts",
  "app/feeds/produtos.json/route.ts",
  "app/sitemap-products.xml/route.ts",
  "app/ofertas/page.tsx",
  "app/sob-medida/page.tsx",
  "app/orcamento-personalizado/page.tsx",
  "app/como-funciona/page.tsx",
  "components/mdh-store/StoreAnimatedBackground.tsx",
  "app/comprar-na-mdh3d/page.tsx",
  "app/politica-de-envio/page.tsx",
  "app/politica-de-troca/page.tsx",
  "app/termos-de-compra/page.tsx",
  "app/prazo-de-producao/page.tsx",
  "data/mdh-store-reviews.json",
  "data/mdh-store-questions.json",
  "data/copa-theme-expansion-300.json",
  "lib/copa-theme-expansion-catalog.ts",
  "docs/AUDITORIA_ECOMMERCE_MDH3D.md",
  "docs/COMO_EDITAR_PRODUTOS.md",
  "docs/INTEGRACOES_MARKETING.md",
  "docs/ECOMMERCE_MDH3D.md",
]) {
  check(exists(file), `missing_file:${file}`);
}

const envExample = read(".env.example");
for (const key of ["VITE_WHATSAPP_NUMBER", "VITE_GTM_ID", "VITE_META_PIXEL_ID", "VITE_TIKTOK_PIXEL_ID", "VITE_NUVEMSHOP_BASE_URL", "MDH_FILAMENT_PRICE_PER_KG"]) {
  check(envExample.includes(key), `missing_env_example:${key}`);
}

const docs = read("docs/ECOMMERCE_MDH3D.md");
for (const term of ["produtos.csv", "Nuvemshop", "WhatsApp", "GTM", "Meta", "Google Shopping", "Copa", "30%"]) {
  check(docs.includes(term), `missing_docs:${term}`);
}

const auditDocs = read("docs/AUDITORIA_ECOMMERCE_MDH3D.md");
for (const term of ["/ofertas", "/sob-medida", "/orcamento-personalizado", "TikTok", "sitemap-products.xml"]) {
  check(auditDocs.includes(term), `missing_audit_docs:${term}`);
}

const copaExpansion = JSON.parse(read("data/copa-theme-expansion-300.json"));
check(Array.isArray(copaExpansion) && copaExpansion.length === 300, "invalid_copa_theme_expansion_count");
check(copaExpansion.every((item) => item.priceCard === Number((item.pricePix + 1).toFixed(2))), "invalid_copa_theme_card_price");
check(copaExpansion.every((item) => item.profitMarkupPercent === 30), "invalid_copa_theme_profit_markup");

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
  "app/ofertas/page.tsx",
  "app/orcamento-personalizado/page.tsx",
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
