import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";

const baseUrl = process.env.SMOKE_BASE_URL || "http://127.0.0.1:3000";
const auditPath = path.join(process.cwd(), "output", "CATALOG_SEMANTIC_AUDIT.json");
const storefrontPath = path.join(process.cwd(), "data", "commercial-storefront.json");
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const storefront = JSON.parse(fs.readFileSync(storefrontPath, "utf8"));
const valorantCuratedSkus = [
  "cha-001",
  "cha-002",
  "cha-003",
  "cha-004",
  "dec-001",
  "dec-002",
  "dec-003",
  "dec-004",
  "uti-001",
  "uti-002",
  "uti-003",
  "uti-004",
  "col-001",
  "col-002",
  "col-003",
  "col-004",
] as const;
const storefrontHomeImages: Record<string, { primary: string; evidenceImages: string[] }> = {
  "Suporte para Fone Headphone": {
    primary: "/products/setup/suporte-fone-headphone.webp",
    evidenceImages: [
      "/products/mdh-013-suporte-para-fone-headphone/01-hero.jpg",
      "/products/mdh-013-suporte-para-fone-headphone/02-closeup.jpg",
      "/products/mdh-013-suporte-para-fone-headphone/03-in_use.jpg",
      "/products/mdh-013-suporte-para-fone-headphone/04-packshot.jpg",
    ],
  },
  "Organizador de Cabos": {
    primary: "/products/setup/organizador-cabos.webp",
    evidenceImages: [
      "/products/mdh-014-organizador-de-cabos/01-hero.jpg",
      "/products/mdh-014-organizador-de-cabos/02-closeup.jpg",
      "/products/mdh-014-organizador-de-cabos/03-in_use.jpg",
      "/products/mdh-014-organizador-de-cabos/04-packshot.jpg",
    ],
  },
  "Suporte para Celular": {
    primary: "/products/setup/suporte-celular.webp",
    evidenceImages: [
      "/products/mdh-015-suporte-para-celular/01-hero.jpg",
      "/products/mdh-015-suporte-para-celular/02-closeup.jpg",
      "/products/mdh-015-suporte-para-celular/03-in_use.jpg",
      "/products/mdh-015-suporte-para-celular/04-packshot.jpg",
    ],
  },
  "Chaveiro Personalizado": {
    primary: "/products/setup/chaveiro-personalizado.webp",
    evidenceImages: [
      "/products/mdh-016-chaveiro-personalizado/01-hero.jpg",
      "/products/mdh-016-chaveiro-personalizado/02-closeup.jpg",
      "/products/mdh-016-chaveiro-personalizado/03-in_use.jpg",
      "/products/mdh-016-chaveiro-personalizado/04-packshot.jpg",
    ],
  },
  "Suporte para Controle PS5": {
    primary: "/products/setup/suporte-controle-ps5.webp",
    evidenceImages: [
      "/products/mdh-017-suporte-para-controle-ps5/01-hero.jpg",
      "/products/mdh-017-suporte-para-controle-ps5/02-closeup.jpg",
      "/products/mdh-017-suporte-para-controle-ps5/03-in_use.jpg",
      "/products/mdh-017-suporte-para-controle-ps5/04-packshot.jpg",
    ],
  },
  "Porta-Copos Geek": {
    primary: "/products/setup/porta-copos-geek.webp",
    evidenceImages: [
      "/products/mdh-019-porta-copos-geek/01-hero.jpg",
      "/products/mdh-019-porta-copos-geek/02-closeup.jpg",
      "/products/mdh-019-porta-copos-geek/03-in_use.jpg",
      "/products/mdh-019-porta-copos-geek/04-packshot.jpg",
    ],
  },
  "Organizador de Canetas": {
    primary: "/products/mdh-022-organizador-de-canetas/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-022-organizador-de-canetas/01-hero.jpg",
      "/products/mdh-022-organizador-de-canetas/02-closeup.jpg",
      "/products/mdh-022-organizador-de-canetas/03-in_use.jpg",
      "/products/mdh-022-organizador-de-canetas/04-packshot.jpg",
    ],
  },
  "Vaso Geométrico": {
    primary: "/products/mdh-025-vaso-geometrico/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-025-vaso-geometrico/01-hero.jpg",
      "/products/mdh-025-vaso-geometrico/02-closeup.jpg",
      "/products/mdh-025-vaso-geometrico/03-in_use.jpg",
      "/products/mdh-025-vaso-geometrico/04-packshot.jpg",
    ],
  },
  "Pokébola": {
    primary: "/products/mdh-026-pokebola/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-026-pokebola/01-hero.jpg",
      "/products/mdh-026-pokebola/02-closeup.jpg",
      "/products/mdh-026-pokebola/03-in_use.jpg",
      "/products/mdh-026-pokebola/04-packshot.jpg",
    ],
  },
  "Luminária LED Personalizada": {
    primary: "/products/mdh-028-luminaria-led-personalizada/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-028-luminaria-led-personalizada/01-hero.jpg",
      "/products/mdh-028-luminaria-led-personalizada/02-closeup.jpg",
      "/products/mdh-028-luminaria-led-personalizada/03-in_use.jpg",
      "/products/mdh-028-luminaria-led-personalizada/04-packshot.jpg",
    ],
  },
  "Foto Litofania": {
    primary: "/products/mdh-029-foto-litofania/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-029-foto-litofania/01-hero.jpg",
      "/products/mdh-029-foto-litofania/02-closeup.jpg",
      "/products/mdh-029-foto-litofania/03-in_use.jpg",
      "/products/mdh-029-foto-litofania/04-packshot.jpg",
    ],
  },
  "Quadro Decorativo": {
    primary: "/products/mdh-030-quadro-decorativo/01-hero.jpg",
    evidenceImages: [
      "/products/mdh-030-quadro-decorativo/01-hero.jpg",
      "/products/mdh-030-quadro-decorativo/02-closeup.jpg",
      "/products/mdh-030-quadro-decorativo/03-in_use.jpg",
      "/products/mdh-030-quadro-decorativo/04-packshot.jpg",
    ],
  },
};

function slugifyProductName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

const publicStorefrontProducts = Array.isArray(storefront.publicProductIds)
  ? storefront.publicProductIds
      .map((id: string) => {
        const product = storefront.products?.[id];
        if (!product?.name) return null;
        return {
          id,
          name: product.name,
          slug: `${id}-${slugifyProductName(product.name)}`,
        };
      })
      .filter(Boolean)
  : [];

for (const product of publicStorefrontProducts) {
  test(`PDP mostra imagens publicas visiveis em ${product.id}`, async ({ page }) => {
    await page.goto(`${baseUrl}/catalogo/${product.slug}`, { waitUntil: "networkidle" });
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    await expect(heading).not.toContainText(/Essa página não existe/i);

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

    expect(imageState.visible.length, JSON.stringify(imageState.images, null, 2)).toBeGreaterThanOrEqual(1);
    expect(imageState.uniqueVisibleSources).toHaveLength(imageState.visible.length);
  });
}

test("home usa imagens de produto nos cards principais", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const cards = page.locator("article[data-product-id]");
  await expect(cards.first()).toBeVisible();
  const count = Math.min(await cards.count(), 10);
  expect(count).toBeGreaterThanOrEqual(4);

  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const productId = await card.getAttribute("data-product-id");
    const image = card.locator("img").first();
    await card.scrollIntoViewIfNeeded();
    await image.scrollIntoViewIfNeeded();
    const src = await image.evaluate((img) => (img as HTMLImageElement).currentSrc || img.getAttribute("src") || "");

    expect(src, `${productId || index}: imagem principal ausente`).toBeTruthy();
    expect(src, `${productId || index}: nao pode usar placeholder`).not.toMatch(/placeholder/i);

    await expect
      .poll(
        () =>
          image.evaluate((img) => {
            const element = img as HTMLImageElement;
            return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
          }),
        { message: `${productId || index}: imagem nao carregou` },
      )
      .toBeTruthy();
  }
});

test("arquivos da vitrine nao sao cards textuais uniformes", () => {
  for (const [productName, media] of Object.entries(storefrontHomeImages)) {
    const primaryPath = path.join(process.cwd(), "public", media.primary.replace(/^\//, ""));
    expect(fs.existsSync(primaryPath), `${productName}: ${media.primary}`).toBeTruthy();
    expect(fs.statSync(primaryPath).size, `${productName}: imagem principal comprimida demais`).toBeGreaterThan(20000);

    const sizes = media.evidenceImages.map((image) => {
      const imagePath = path.join(process.cwd(), "public", image.replace(/^\//, ""));
      expect(fs.existsSync(imagePath), `${productName}: ${image}`).toBeTruthy();
      return fs.statSync(imagePath).size;
    });
    const range = Math.max(...sizes) - Math.min(...sizes);
    const average = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;

    expect(average, `${productName}: tamanho medio suspeito ${sizes.join(", ")}`).toBeGreaterThan(100000);
    expect(range, `${productName}: imagens uniformes demais ${sizes.join(", ")}`).toBeGreaterThan(15000);
  }
});

test("itens Valorant usam imagens curadas e nao placeholders de SKU", () => {
  const productImageMap = JSON.parse(fs.readFileSync(path.join(process.cwd(), "product-image-map.json"), "utf8"));
  const productGalleryMap = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "product-gallery-map.json"), "utf8"));
  const auditById = new Map(
    Array.isArray(audit.items)
      ? audit.items.map((item: { id?: string }) => [String(item.id || ""), item])
      : []
  );

  for (const sku of valorantCuratedSkus) {
    const productId = `csv-${sku}`;
    const expectedGallery = [
      `/products/valorant/${sku}/cover.webp`,
      `/products/valorant/${sku}/2.webp`,
      `/products/valorant/${sku}/3.webp`,
    ];

    expect(productImageMap[productId], `${productId}: imagem principal`).toBe(expectedGallery[0]);
    expect(productGalleryMap[productId], `${productId}: galeria`).toEqual(expectedGallery);

    for (const image of expectedGallery) {
      const imagePath = path.join(process.cwd(), "public", image.replace(/^\//, ""));
      expect(fs.existsSync(imagePath), `${productId}: ${image}`).toBeTruthy();
      expect(fs.statSync(imagePath).size, `${productId}: ${image} comprimida demais`).toBeGreaterThan(10000);
    }

    const auditItem = auditById.get(productId) as { status?: string; mediaStatus?: string } | undefined;
    if (auditItem?.status !== "BLOCKED") {
      expect(auditItem?.mediaStatus, `${productId}: mediaStatus`).not.toBe("placeholder");
    }
  }
});

test("PDP Valorant curado e publico usa imagem conceitual local", async ({ page }) => {
  const auditById = new Map(
    Array.isArray(audit.items)
      ? audit.items.map((item: { id?: string }) => [String(item.id || ""), item])
      : []
  );
  const auditItem = auditById.get("csv-dec-004") as { status?: string } | undefined;
  await page.goto(`${baseUrl}/catalogo/csv-dec-004-placa-decorativa-omen-valorant-estilo-geek-para-porta-parede-e-setup`, {
    waitUntil: "networkidle",
  });

  if (auditItem?.status === "BLOCKED") {
    await expect(page.locator("h1")).toContainText("Essa página não existe");
    return;
  }

  await expect(page.locator("h1")).toContainText("Placa Decorativa Omen Valorant");
  await expect(page.getByText("Imagem conceitual").first()).toBeVisible();

  const gallery = page.locator('[data-testid="product-image-gallery"]');
  const firstImage = gallery.locator("img").first();
  await expect(firstImage).toBeVisible();
  const src = await firstImage.evaluate((img) => decodeURIComponent((img as HTMLImageElement).currentSrc || img.getAttribute("src") || ""));

  expect(src).toContain("/products/valorant/dec-004/cover.webp");
  expect(src).not.toMatch(/placeholder|catalog-assets/i);
});

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
              image: "/products/setup/suporte-fone-headphone.webp",
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
