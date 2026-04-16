import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "catalog-photo-manifest.json");
const OUTPUT_DIR = path.join(ROOT, "public", "products", "catalog");
const REPORT_PATH = path.join(ROOT, "reports", "fill-images-serpapi-pending-report.json");
const ENV_PATH = path.join(ROOT, ".env.local");

function parseEnvText(text) {
  const out = {};
  for (const rawLine of String(text).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    out[key] = value;
  }
  return out;
}

async function loadLocalEnv() {
  try {
    const text = await fs.readFile(ENV_PATH, "utf8");
    const env = parseEnvText(text);
    for (const [key, value] of Object.entries(env)) {
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
  }
}

await loadLocalEnv();

const API_KEY = process.env.SERPAPI_KEY || "";
const EXTRA_QUERY = process.env.FILL_EXTRA_QUERY || "3d print product figure";
const SKIP_IDS = new Set(
  String(process.env.FILL_SKIP_IDS || "mdh-001,mdh-002")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const BLOCKED_HOST_FRAGMENTS = [
  "pinterest.",
  "facebook.",
  "instagram.",
  "tiktok.",
  "shopee.",
  "susercontent.",
  "aliexpress.",
  "mercadolivre.",
  "mercadolibre."
];

const PREFERRED_SOURCE_HINTS = [
  "makerworld",
  "cults",
  "myminifactory",
  "thingiverse",
  "printables",
  "etsy"
];

function fileExistsSync(filePath) {
  try {
    require("node:fs").accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function looksBlocked(url) {
  const lower = String(url || "").toLowerCase();
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function scoreResult(item) {
  const original = String(item.original || item.link || item.thumbnail || "").toLowerCase();
  const source = String(item.source || "").toLowerCase();
  let score = 0;
  for (let index = 0; index < PREFERRED_SOURCE_HINTS.length; index += 1) {
    const hint = PREFERRED_SOURCE_HINTS[index];
    if (original.includes(hint) || source.includes(hint)) {
      score += 20 - index;
    }
  }
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(original)) score += 5;
  if (original.includes("makerworld.bblmw.com")) score += 6;
  return score;
}

async function readManifest() {
  const raw = await fs.readFile(MANIFEST_PATH, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("Manifesto inválido: esperado array em data/catalog-photo-manifest.json");
  }
  return parsed;
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function callSerpApi(query) {
  if (!API_KEY) {
    throw new Error("SERPAPI_KEY não encontrado em .env.local");
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-br");
  url.searchParams.set("safe", "off");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", API_KEY);

  const response = await fetch(url, {
    headers: {
      "user-agent": "mdh-image-filler/2.0",
      "accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`SerpAPI HTTP ${response.status}`);
  }

  return response.json();
}

function pickImageResult(payload) {
  const list = Array.isArray(payload?.images_results) ? payload.images_results : [];
  const candidates = list
    .map((item) => ({
      item,
      url: String(item.original || item.link || item.thumbnail || "").trim(),
      source: String(item.source || "").trim(),
      title: String(item.title || "").trim(),
      score: scoreResult(item)
    }))
    .filter((entry) => entry.url.startsWith("http") && !looksBlocked(entry.url))
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return null;
  return candidates[0];
}

async function downloadToWebp(imageUrl, outputPath) {
  const response = await fetch(imageUrl, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "referer": "https://www.google.com/"
    },
    redirect: "follow"
  });

  if (!response.ok) {
    throw new Error(`Download HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(outputPath);
}

function buildQuery(entry) {
  const name = String(entry.name || "").trim();
  const existing = String(entry.sourceFilename || "").replace(/\.[a-z0-9]+$/i, "").trim();
  return [name, existing, EXTRA_QUERY].filter(Boolean).join(" ");
}

function shouldProcess(entry) {
  const id = String(entry.id || "").toLowerCase();
  if (!id || SKIP_IDS.has(id)) return false;

  const localOutput = path.join(OUTPUT_DIR, `${id}.webp`);
  const hasLocalImage = fileExistsSync(localOutput);

  // Pendente = ainda é conceitual e não tem a imagem local baixada
  return entry.kind === "imagem-conceitual" && !hasLocalImage;
}

async function main() {
  const manifest = await readManifest();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const report = {
    processedAt: new Date().toISOString(),
    changed: [],
    skipped: [],
    failed: []
  };

  const pending = manifest.filter(shouldProcess);
  console.log(`Pendentes reais: ${pending.length}`);

  for (let index = 0; index < pending.length; index += 1) {
    const entry = pending[index];
    const id = String(entry.id || "").toLowerCase();
    const query = buildQuery(entry);

    process.stdout.write(`[${index + 1}/${pending.length}] ${id} ... `);

    try {
      const payload = await callSerpApi(query);
      const picked = pickImageResult(payload);

      if (!picked) {
        throw new Error("nenhuma imagem utilizável");
      }

      const outputPath = path.join(OUTPUT_DIR, `${id}.webp`);
      await downloadToWebp(picked.url, outputPath);

      entry.sourceFilename = `${id}.webp`;
      entry.gallery = [`/products/catalog/${id}.webp`];

      report.changed.push({
        id,
        query,
        imageUrl: picked.url,
        source: picked.source,
        output: `/products/catalog/${id}.webp`
      });

      console.log("ok");
    } catch (error) {
      report.failed.push({
        id,
        query,
        error: error instanceof Error ? error.message : String(error)
      });
      console.log(`falhou (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  for (const entry of manifest) {
    const id = String(entry.id || "").toLowerCase();
    if (!id) continue;
    const localOutput = path.join(OUTPUT_DIR, `${id}.webp`);
    if (!fileExistsSync(localOutput)) {
      report.skipped.push({ id, reason: "sem imagem local" });
    }
  }

  await writeJson(MANIFEST_PATH, manifest);
  await writeJson(REPORT_PATH, report);

  console.log(JSON.stringify({
    ok: true,
    pendingAttempted: pending.length,
    changed: report.changed.length,
    failed: report.failed.length,
    remainingWithoutLocalImage: report.skipped.length,
    report: "reports/fill-images-serpapi-pending-report.json"
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
