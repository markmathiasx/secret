import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const auditPath = path.join(root, "output", "CATALOG_SEMANTIC_AUDIT.json");
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

const storefrontHomeImages = {
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
];

function publicPath(assetPath) {
  return path.join(publicRoot, assetPath.replace(/^\//, ""));
}

function ensureFile(assetPath, minSizeBytes) {
  const absolutePath = publicPath(assetPath);
  assert.equal(fs.existsSync(absolutePath), true, `missing asset: ${assetPath}`);
  const stats = fs.statSync(absolutePath);
  assert.ok(stats.size > minSizeBytes, `asset too small: ${assetPath} (${stats.size})`);
  return stats.size;
}

const realApprovedSkus = Array.isArray(audit.items)
  ? audit.items.filter(
      (item) =>
        String(item.id || "").startsWith("real-") &&
        item.status === "APPROVED" &&
        Number(item.imageCount || 0) >= 4,
    )
  : [];

for (const product of realApprovedSkus) {
  const paths = [...new Set([product.heroImage, ...(product.images || [])].filter(Boolean))];
  assert.ok(paths.length >= 4, `${product.id}: approved product needs at least 4 images`);
  assert.equal(paths.some((assetPath) => fs.existsSync(publicPath(assetPath))), true, `${product.id}: no local public image`);
  for (const assetPath of paths) {
    assert.ok(!/placeholder/i.test(assetPath), `${product.id}: placeholder leaked into public images`);
    ensureFile(assetPath, 10_000);
  }
}

for (const [productName, media] of Object.entries(storefrontHomeImages)) {
  ensureFile(media.primary, 20_000);
  const sizes = media.evidenceImages.map((assetPath) => ensureFile(assetPath, 20_000));
  const range = Math.max(...sizes) - Math.min(...sizes);
  const average = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;

  assert.ok(average > 100_000, `${productName}: suspicious average image size ${sizes.join(", ")}`);
  assert.ok(range > 15_000, `${productName}: suspiciously uniform evidence images ${sizes.join(", ")}`);
}

const productImageMap = JSON.parse(fs.readFileSync(path.join(root, "product-image-map.json"), "utf8"));
const productGalleryMap = JSON.parse(fs.readFileSync(path.join(root, "data", "product-gallery-map.json"), "utf8"));
const auditById = new Map(Array.isArray(audit.items) ? audit.items.map((item) => [String(item.id || ""), item]) : []);

for (const sku of valorantCuratedSkus) {
  const productId = `csv-${sku}`;
  const expectedGallery = [
    `/products/valorant/${sku}/cover.webp`,
    `/products/valorant/${sku}/2.webp`,
    `/products/valorant/${sku}/3.webp`,
  ];

  assert.equal(productImageMap[productId], expectedGallery[0], `${productId}: primary image`);
  assert.deepEqual(productGalleryMap[productId], expectedGallery, `${productId}: gallery`);

  for (const image of expectedGallery) {
    assert.ok(!/placeholder|catalog-assets/i.test(image), `${productId}: invalid public image source`);
    ensureFile(image, 10_000);
  }

  const auditItem = auditById.get(productId);
  if (auditItem?.status !== "BLOCKED") {
    assert.notEqual(auditItem?.mediaStatus, "placeholder", `${productId}: mediaStatus`);
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      checkedApprovedProducts: realApprovedSkus.length,
      checkedHomeProducts: Object.keys(storefrontHomeImages).length,
      checkedValorantProducts: valorantCuratedSkus.length,
    },
    null,
    2,
  ),
);
