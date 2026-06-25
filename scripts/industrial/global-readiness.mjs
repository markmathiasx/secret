import { okExit, writeReport } from "./shared.mjs";

const baseUrl = process.env.INDUSTRIAL_BASE_URL || process.env.PRODUCTION_VALIDATE_BASE_URL || "https://www.mdh3d.com.br";
const routes = ["/", "/loja", "/ofertas", "/catalogo", "/atendimento", "/jogue", "/meta/catalog.csv", "/feeds/google-shopping.xml", "/feeds/products.json", "/sitemap-products.xml", "/api/health", "/api/health/liveness", "/api/health/readiness"];

const results = [];
for (const route of routes) {
  try {
    const response = await fetch(new URL(route, baseUrl), { redirect: "follow", signal: AbortSignal.timeout(20_000) });
    const contentType = response.headers.get("content-type") || "";
    results.push({ route, status: response.status, contentType, ok: response.status >= 200 && response.status < 400 });
  } catch (error) {
    results.push({ route, status: 0, ok: false, error: error instanceof Error ? error.message : "unknown" });
  }
}

const report = { generatedAt: new Date().toISOString(), baseUrl, ok: results.every((item) => item.ok), results };
okExit(report.ok, writeReport("global-readiness.json", report));
