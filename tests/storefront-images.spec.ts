import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const auditPath = path.join(process.cwd(), "output", "CATALOG_SEMANTIC_AUDIT.json");
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

const realApprovedSkus = Array.isArray(audit.items)
  ? audit.items.filter(
      (item: { id?: string; slug?: string; name?: string; status?: string; imageCount?: number }) =>
        String(item.id || "").startsWith("real-") && item.status === "APPROVED" && Number(item.imageCount || 0) >= 4
    )
  : [];

for (const product of realApprovedSkus) {
  test(`PDP mostra 4 imagens visiveis em ${product.id}`, async ({ page }) => {
    const imageFailures: string[] = [];

    page.on("response", (response) => {
      const req = response.request();
      if (req.resourceType() === "image" && response.status() >= 400) {
        imageFailures.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(`${baseUrl}/catalogo/${product.slug}`, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toContainText(product.name || product.id);

    const gallery = page.getByTestId("product-image-gallery");
    await expect(gallery).toBeVisible();

    const thumbs = gallery.getByTestId("product-image-gallery-thumb");
    await expect(thumbs).toHaveCount(4);

    for (let index = 0; index < 4; index += 1) {
      await expect(thumbs.nth(index)).toBeVisible();
    }

    const thumbSources = await thumbs.locator("img").evaluateAll((nodes) =>
      Array.from(new Set(nodes.map((node) => node.getAttribute("src") || (node as HTMLImageElement).currentSrc).filter(Boolean)))
    );
    expect(thumbSources).toHaveLength(4);
    expect(imageFailures, imageFailures.join("\n")).toEqual([]);
  });
}

test("checkout continua carregando sem imagens quebradas", async ({ page }) => {
  const imageFailures: string[] = [];

  page.on("response", (response) => {
    const req = response.request();
    if (req.resourceType() === "image" && response.status() >= 400) {
      imageFailures.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
  await expect(page.getByText("Produto e contexto")).toBeVisible();
  expect(imageFailures, imageFailures.join("\n")).toEqual([]);
});
