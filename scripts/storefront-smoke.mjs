import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const baseUrl = (process.env.STOREFRONT_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const reportPath = process.env.STOREFRONT_REPORT_PATH || path.join("reports", "storefront-smoke-report.json");
const checkoutMode = process.env.STOREFRONT_CHECKOUT_MODE || "full";
const catalogExpected = Number(process.env.STOREFRONT_EXPECTED_CATALOG || 748);
const publicRoutes = [
  "/",
  "/catalogo",
  "/catalogo?mode=real",
  "/catalogo?page=2",
  "/checkout",
  "/conta",
  "/login",
  "/presentes-3d",
  "/brindes-personalizados-3d",
  "/colecionaveis-geek-3d",
  "/decoracao-3d-para-casa",
  "/setup-e-organizacao-3d",
  "/imagem-para-impressao-3d",
  "/faq",
  "/entregas",
  "/seller",
  "/politica-de-privacidade",
  "/termos",
  "/trocas-e-devolucoes",
  "/api/health",
  "/api/catalog/health",
  "/api/payments/status",
];

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toUrl(href) {
  try {
    return new URL(href, baseUrl);
  } catch {
    return null;
  }
}

async function anyVisible(locator) {
  const count = await locator.count().catch(() => 0);
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible().catch(() => false)) {
      return true;
    }
  }
  return false;
}

async function collectActions(page) {
  return page.evaluate(() => {
    function visible(element) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    }

    return [...document.querySelectorAll("a, button, [role='button'], input[type='submit']")]
      .filter(visible)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        role: element.getAttribute("role") || "",
        text: (element.innerText || element.getAttribute("aria-label") || element.getAttribute("value") || "").trim().replace(/\s+/g, " ").slice(0, 140),
        href: element.getAttribute("href") || "",
        type: element.getAttribute("type") || "",
        disabled: Boolean(element.disabled || element.getAttribute("aria-disabled") === "true"),
      }))
      .filter((item) => item.text || item.href);
  });
}

async function testRoute(context, route) {
  const url = route.startsWith("http") ? route : `${baseUrl}${route}`;
  const response = await context.request.get(url, {
    maxRedirects: 0,
    failOnStatusCode: false,
  });
  const body = await response.text().catch(() => "");
  const lower = body.toLowerCase();
  return {
    route,
    status: response.status(),
    location: response.headers().location || "",
    cache: response.headers()["x-vercel-cache"] || response.headers()["x-nextjs-cache"] || "",
    ok:
      response.status() < 400 &&
      !lower.includes("internal server error") &&
      !lower.includes("internal_cache_error") &&
      !lower.includes("application error"),
    internalError: lower.includes("internal server error") || lower.includes("internal_cache_error") || lower.includes("application error"),
  };
}

async function testLink(context, action) {
  const url = toUrl(action.href);
  if (!url) return { ...action, ok: false, status: 0, reason: "invalid_href" };

  if (url.hostname.includes("wa.me")) {
    return { ...action, ok: true, status: 200, external: true, kind: "whatsapp" };
  }

  if (url.origin !== baseUrl) {
    return { ...action, ok: true, status: 200, external: true, kind: "external" };
  }

  const response = await context.request.get(url.toString(), {
    maxRedirects: 2,
    failOnStatusCode: false,
  });

  return {
    ...action,
    ok: response.status() < 400,
    status: response.status(),
    external: false,
    finalUrl: response.url(),
  };
}

async function runCatalogFlow(page) {
  const evidence = [];
  await page.goto(`${baseUrl}/catalogo`, { waitUntil: "domcontentloaded" });
  await page.getByText("Explorador comercial").waitFor({ timeout: 15000 });
  await page.getByLabel("Ir para página do catálogo").fill("2");
  await page.getByRole("button", { name: "Abrir" }).last().click();
  await page.waitForURL(/page=2/, { timeout: 10000, waitUntil: "domcontentloaded" });
  evidence.push({ step: "catalog_page_jump", ok: page.url().includes("page=2"), url: page.url() });

  const productLink = page.locator("a", { hasText: /Comprar|Orçar/ }).first();
  await productLink.click();
  await page.waitForURL(/\/catalogo\/[^/]+/, { timeout: 10000, waitUntil: "domcontentloaded" });
  const productOk = await page.getByRole("heading").first().isVisible();
  evidence.push({ step: "pdp_open", ok: productOk, url: page.url() });

  await page.getByRole("link", { name: /Voltar ao catálogo/ }).click();
  await page.waitForURL(/\/catalogo/, { timeout: 10000, waitUntil: "domcontentloaded" });
  evidence.push({ step: "back_to_catalog", ok: page.url().includes("/catalogo"), url: page.url() });
  return evidence;
}

async function runCheckoutFlow(page) {
  const evidence = [];
  await page.goto(`${baseUrl}/checkout`, { waitUntil: "domcontentloaded" });
  await page.getByText("Produto e contexto").waitFor({ timeout: 15000 });
  evidence.push({ step: "checkout_open", ok: page.url().includes("/checkout") && await page.getByText("Produto e contexto").isVisible() });

  await page.getByLabel("Nome completo").fill("Cliente Teste MDH");
  await page.getByLabel("Email").fill("cliente.teste+codex@mdh3d.local");
  await page.getByRole("textbox", { name: "WhatsApp" }).fill("21999999999");
  await page.getByLabel("Apelido do endereço").fill("Casa");
  await page.getByLabel("Destinatário").fill("Cliente Teste MDH");
  await page.getByRole("textbox", { name: "CEP" }).fill("22041001");
  await page.getByLabel("Telefone do endereço").fill("21999999999");
  await page.getByLabel("Rua e número").fill("Rua Barata Ribeiro, 100");
  await page.getByLabel("Complemento").fill("Teste automatizado");
  await page.getByLabel("Bairro").fill("Copacabana");
  await page.getByLabel("Cidade").fill("Rio de Janeiro");
  await page.getByLabel("Estado").fill("RJ");
  await page.getByRole("button", { name: "Continuar para envio" }).click();
  const continuePayment = page.getByRole("button", { name: "Continuar para pagamento" });
  await continuePayment.waitFor({ state: "visible", timeout: 15000 }).catch(() => null);
  evidence.push({
    step: "checkout_shipping",
    ok:
      (await page.evaluate(() => document.body.innerText.toLowerCase().includes("opções de envio")).catch(() => false)) &&
      (await anyVisible(continuePayment)),
  });

  await continuePayment.click();
  await page.getByText("Pagamento selecionado").waitFor({ timeout: 10000 }).catch(() => null);
  evidence.push({ step: "checkout_payment", ok: await page.getByText("Pagamento selecionado").isVisible().catch(() => false) });

  await page.getByRole("button", { name: "Continuar para confirmação" }).click();
  await page.getByText("Resumo final").waitFor({ timeout: 10000 }).catch(() => null);
  evidence.push({ step: "checkout_confirm", ok: await page.getByText("Resumo final").isVisible().catch(() => false) });

  if (checkoutMode === "full") {
    await page.getByRole("button", { name: /Gerar pedido/ }).click();
    await page.getByText("Pedido criado").waitFor({ timeout: 20000 }).catch(() => null);
    evidence.push({ step: "checkout_order_created", ok: await page.getByText("Pedido criado").isVisible().catch(() => false) });
  }

  return evidence;
}

async function runViewport(browser, viewportName, viewport) {
  const context = await browser.newContext(viewport);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const routeResults = [];
  for (const route of publicRoutes) {
    routeResults.push(await testRoute(context, route));
  }

  const catalogResponse = await context.request.get(`${baseUrl}/api/catalog?scope=all`, { failOnStatusCode: false });
  const catalogJson = await catalogResponse.json().catch(() => ({}));
  const catalogTotal = Number(catalogJson.total || 0);
  const firstProduct = Array.isArray(catalogJson.items) ? catalogJson.items[0] : null;
  if (firstProduct) {
    routeResults.push(await testRoute(context, `/catalogo/${firstProduct.id}-${firstProduct.slug || firstProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`));
  }

  const collectedActions = [];
  for (const route of ["/", "/catalogo", "/checkout", "/conta", "/login", "/faq", "/entregas", "/presentes-3d"]) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    const actions = await collectActions(page);
    collectedActions.push(...actions.map((action) => ({ ...action, route })));
  }

  const uniqueActions = uniqueBy(
    collectedActions.filter((action) => !action.disabled),
    (action) => `${action.route}:${action.tag}:${action.href}:${action.text}`
  );
  const linkActions = uniqueActions.filter((action) => action.href);
  const testedLinks = [];
  for (const action of linkActions) {
    testedLinks.push(await testLink(context, action));
  }

  const catalogFlow = await runCatalogFlow(page).catch((error) => [{ step: "catalog_flow", ok: false, error: error.message }]);
  const checkoutFlow = await runCheckoutFlow(page).catch((error) => [{ step: "checkout_flow", ok: false, error: error.message }]);

  await context.close();

  return {
    viewport: viewportName,
    catalogTotal,
    catalogExpected,
    catalogCountOk: catalogTotal === catalogExpected,
    routes: routeResults,
    actionsVisible: uniqueActions.length,
    linkActionsTested: testedLinks.length,
    buttonActionsObserved: uniqueActions.filter((action) => !action.href).length,
    failedLinks: testedLinks.filter((link) => !link.ok),
    catalogFlow,
    checkoutFlow,
    consoleErrors,
    pageErrors,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const startedAt = new Date().toISOString();
  const desktop = await runViewport(browser, "desktop", { viewport: { width: 1440, height: 1000 } });
  const mobile = await runViewport(browser, "mobile", { ...devices["Pixel 7"] });
  await browser.close();

  const report = {
    baseUrl,
    startedAt,
    finishedAt: new Date().toISOString(),
    checkoutMode,
    desktop,
    mobile,
    summary: {
      routesTested: desktop.routes.length + mobile.routes.length,
      desktopActionsTested: desktop.linkActionsTested + desktop.buttonActionsObserved,
      mobileActionsTested: mobile.linkActionsTested + mobile.buttonActionsObserved,
      routeFailures: [...desktop.routes, ...mobile.routes].filter((route) => !route.ok),
      linkFailures: [...desktop.failedLinks, ...mobile.failedLinks],
      flowFailures: [...desktop.catalogFlow, ...desktop.checkoutFlow, ...mobile.catalogFlow, ...mobile.checkoutFlow].filter((step) => !step.ok),
      consoleErrors: desktop.consoleErrors.length + mobile.consoleErrors.length,
      pageErrors: desktop.pageErrors.length + mobile.pageErrors.length,
    },
  };

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  const failed =
    report.summary.routeFailures.length ||
    report.summary.linkFailures.length ||
    report.summary.flowFailures.length ||
    report.summary.pageErrors;

  console.log(JSON.stringify(report.summary, null, 2));
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
