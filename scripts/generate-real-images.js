#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const INPUT_FILE = process.argv[2] || path.join(process.cwd(), "tmp", "products-image-input.json");
const OUTPUT_DIR = process.argv[3] || path.join(process.cwd(), "uploads", "products", "real");
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";
const PROVIDER = (process.env.IMAGE_PROVIDER || "unsplash").toLowerCase();

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}: ${response.status}`);
  }
  return response.json();
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Falha ao baixar ${url}: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.writeFile(destination, Buffer.from(arrayBuffer));
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function findImageUrl(product) {
  const query = encodeURIComponent(`3d printed product ${product.title}`);

  if (PROVIDER === "pexels") {
    if (!PEXELS_API_KEY) {
      throw new Error("Defina PEXELS_API_KEY para usar o provider pexels.");
    }

    const result = await fetchJson(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });

    const photo = result.photos?.[0];
    return photo?.src?.large2x || photo?.src?.large || null;
  }

  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error("Defina UNSPLASH_ACCESS_KEY para usar o provider unsplash.");
  }

  const result = await fetchJson(`https://api.unsplash.com/search/photos?query=${query}&per_page=1`, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  });

  const photo = result.results?.[0];
  return photo?.urls?.regular || photo?.urls?.full || null;
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Arquivo de entrada não encontrado: ${INPUT_FILE}`);
  }

  const products = JSON.parse(await fs.promises.readFile(INPUT_FILE, "utf8"));
  if (!Array.isArray(products)) {
    throw new Error("O arquivo de entrada precisa ser um array de objetos { title, slug }.");
  }

  const manifest = [];

  for (const product of products) {
    const slug = normalizeSlug(product.slug || product.title);
    const imageUrl = await findImageUrl(product);

    if (!imageUrl) {
      manifest.push({ slug, title: product.title, status: "not-found" });
      continue;
    }

    const destination = path.join(OUTPUT_DIR, `${slug}.jpg`);
    await downloadFile(imageUrl, destination);
    manifest.push({
      slug,
      title: product.title,
      status: "downloaded",
      sourceUrl: imageUrl,
      destination,
    });
  }

  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log(`Manifest salvo em ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
