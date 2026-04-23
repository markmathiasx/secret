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
    await page.goto(`${baseUrl}/catalogo/${product.slug}`, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toContainText(product.name || product.id);

    const imageState = await page.evaluate(() => {
      const gallery = document.querySelector('[data-testid="product-image-gallery"]');
      const images = [...(gallery?.querySelectorAll("img") || [])].map((img) => {
        const rect = img.getBoundingClientRect();
        return {
          alt: img.alt,
          src: img.currentSrc || img.src,
          visible: rect.width > 0 && rect.height > 0,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };
      });
      const visible = images.filter((img) => img.visible && img.naturalWidth > 0 && img.naturalHeight > 0);
      return {
        images,
        visible,
        uniqueVisibleSources: Array.from(new Set(visible.map((img) => img.src))),
      };
    });

    expect(imageState.visible, JSON.stringify(imageState.images, null, 2)).toHaveLength(4);
    expect(imageState.uniqueVisibleSources).toHaveLength(4);
  });
}

test("checkout continua carregando sem imagens quebradas", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.setItem(
      "mdh:cart:v2",
      JSON.stringify({
        state: {
          items: [
            {
              productId: "mdh-013",
              quantity: 1,
              title: "Suporte para Fone Headphone",
              pricePix: 69.9,
              priceCard: 69.9,
              image: "/products/catalog/mdh-013.webp",
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        version: 0,
      })
    );
  });
  await page.goto(`${baseUrl}/checkout`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Venda web-first" })).toBeVisible();

  const brokenImages = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .map((img) => {
        const rect = img.getBoundingClientRect();
        return {
          alt: img.alt,
          src: img.currentSrc || img.src,
          visible: rect.width > 0 && rect.height > 0,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        };
      })
      .filter((img) => img.visible && (img.naturalWidth === 0 || img.naturalHeight === 0))
  );

  expect(brokenImages, JSON.stringify(brokenImages, null, 2)).toEqual([]);
});
