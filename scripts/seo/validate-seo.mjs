import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const reportPath = path.join(ROOT, "reports", "seo-validation-report.json");

const files = {
  layout: path.join(ROOT, "app", "layout.tsx"),
  home: path.join(ROOT, "app", "page.tsx"),
  catalog: path.join(ROOT, "app", "catalogo", "page.tsx"),
  product: path.join(ROOT, "app", "catalogo", "[slug]", "page.tsx"),
  sitemap: path.join(ROOT, "app", "sitemap.ts"),
  robots: path.join(ROOT, "app", "robots.ts"),
  schema: path.join(ROOT, "lib", "schema-org.ts"),
  seoService: path.join(ROOT, "lib", "seo-service.ts"),
};

const text = Object.fromEntries(Object.entries(files).map(([key, file]) => [key, readText(file)]));

const checks = [
  check("organization json-ld", text.layout.includes("Organization") && text.layout.includes("sameAs")),
  check("website searchaction", text.layout.includes("SearchAction") && text.layout.includes("/catalogo?q={search_term_string}")),
  check("catalog breadcrumb", text.catalog.includes("BreadcrumbList")),
  check("product json-ld", text.product.includes("'@type': 'Product'") && text.product.includes("offers")),
  check("product offer uses pix", text.product.includes("price: product.pricePix")),
  check("product image in schema", text.product.includes("image: structuredDataImages")),
  check("product brand", text.product.includes("MDH 3D Store")),
  check("faq json-ld", text.product.includes("FAQPage")),
  check("canonical home", text.home.includes("canonical: \"/\"")),
  check("canonical catalog", text.catalog.includes("canonical: \"/catalogo\"")),
  check("sitemap", text.sitemap.includes("MetadataRoute.Sitemap")),
  check("robots", text.robots.includes("MetadataRoute.Robots")),
  check("instagram current", !Object.values(text).join("\n").includes("instagram.com/mdh3d") && Object.values(text).join("\n").includes("instagram.com/mdh_3d.com.br")),
  check("no false gtin", !Object.values(text).join("\n").match(/\bgtin\b/i)),
];

const report = {
  generatedAt: new Date().toISOString(),
  ok: checks.every((item) => item.ok),
  checks,
};

writeJson(reportPath, report);

if (!report.ok) {
  console.error("[seo:validate] failed");
  for (const item of checks.filter((checkItem) => !checkItem.ok)) console.error(`- ${item.name}`);
  process.exit(1);
}

console.log("[seo:validate] ok");

function check(name, ok) {
  return { name, ok: Boolean(ok) };
}

function readText(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
