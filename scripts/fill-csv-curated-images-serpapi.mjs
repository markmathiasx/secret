import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const CSV_PATH = path.join(ROOT, "data", "catalogo_curado_160_itens_ptbr.json");
const OUTPUT_ROOT = path.join(ROOT, "public", "products", "csv-curated");
const ENV_PATH = path.join(ROOT, ".env.local");
const REPORT_PATH = path.join(ROOT, "reports", "fill-csv-curated-images-report.json");

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

function normalizeSku(sku) {
  return String(sku || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function existingMediaForSku(sku) {
  const normalized = normalizeSku(sku);
  const dir = path.join(OUTPUT_ROOT, normalized);
  return [
    "cover.webp", "cover.png", "cover.jpg", "1.webp", "1.png", "1.jpg"
  ].map((name) => path.join(dir, name));
}

async function hasAnyLocalMedia(sku) {
  const files = existingMediaForSku(sku);
  for (const file of files) {
    try {
      await fs.access(file);
      return true;
    } catch {}
  }
  return false;
}

function buildQuery(row) {
  const title = String(row.title_pt || "").trim();
  const hint = String(row.source_marketplace_hint || "").trim();
  const category = String(row.category || "").trim();
  const notes = String(row.compatibility_notes || "").trim();
  return [title, hint, category, notes, "product"].filter(Boolean).join(" ");
}

const BLOCKED_HOST_FRAGMENTS = [
  "pinterest.",
  "facebook.",
  "instagram.",
  "tiktok.",
  "shopee.",
  "mercadolivre.",
  "mercadolibre.",
  "susercontent."
];

function looksBlocked(url) {
  const lower = String(url || "").toLowerCase();
  return BLOCKED_HOST_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

function scoreResult(item, row) {
  const url = String(item.original || item.link || item.thumbnail || "").toLowerCase();
  const source = String(item.source || "").toLowerCase();
  const title = String(item.title || "").toLowerCase();
  const target = `${row.title_pt || ""} ${row.source_marketplace_hint || ""}`.toLowerCase();

  let score = 0;
  if (/\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) score += 5;
  for (const term of target.split(/\s+/).filter(Boolean)) {
    if (term.length < 3) continue;
    if (title.includes(term)) score += 2;
    if (source.includes(term)) score += 1;
  }
  if (source.includes("etsy")) score += 6;
  if (source.includes("makerworld")) score += 6;
  if (source.includes("printables")) score += 5;
  if (source.includes("thingiverse")) score += 4;
  if (source.includes("amazon")) score += 2;
  return score;
}

async function callSerpApi(query) {
  const apiKey = process.env.SERPAPI_KEY || "";
  if (!apiKey) throw new Error("SERPAPI_KEY não encontrado em .env.local");

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_images");
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("gl", "br");
  url.searchParams.set("hl", "pt-br");
  url.searchParams.set("safe", "off");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: {
      "user-agent": "mdh-csv-image-filler/1.0",
      "accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`SerpAPI HTTP ${response.status}`);
  }

  return response.json();
}

function pickImage(payload, row) {
  const items = Array.isArray(payload?.images_results) ? payload.images_results : [];
  const ranked = items
    .map((item) => ({
      item,
      url: String(item.original || item.link || item.thumbnail || "").trim(),
      source: String(item.source || "").trim(),
      title: String(item.title || "").trim(),
      score: scoreResult(item, row)
    }))
    .filter((entry) => entry.url.startsWith("http") && !looksBlocked(entry.url))
    .sort((a, b) => b.score - a.score);

  return ranked[0] || null;
}

async function downloadToWebp(url, outFile) {
  const response = await fetch(url, {
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

  await fs.mkdir(path.dirname(outFile), { recursive: true });

  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(outFile);
}

async function main() {
  await loadLocalEnv();

  const raw = await fs.readFile(CSV_PATH, "utf8");
  const rows = JSON.parse(raw);

  const onlyPending = String(process.env.CSV_ONLY_PENDING || "1") !== "0";
  const maxItems = Number(process.env.CSV_MAX_ITEMS || "999");
  const skipExisting = String(process.env.CSV_SKIP_EXISTING || "1") !== "0";

  const report = {
    processedAt: new Date().toISOString(),
    onlyPending,
    maxItems,
    changed: [],
    skipped: [],
    failed: []
  };

  let processed = 0;

  for (const row of rows) {
    if (processed >= maxItems) {
      report.skipped.push({ sku: row.sku, reason: "limite atingido" });
      continue;
    }

    const already = await hasAnyLocalMedia(row.sku);
    if (onlyPending && !already) {
      // process
    } else if (onlyPending && already && skipExisting) {
      report.skipped.push({ sku: row.sku, reason: "já possui mídia local" });
      continue;
    }

    const query = buildQuery(row);
    const normalized = normalizeSku(row.sku);
    const outFile = path.join(OUTPUT_ROOT, normalized, "cover.webp");

    process.stdout.write(`Baixando ${row.sku} ... `);

    try {
      const payload = await callSerpApi(query);
      const picked = pickImage(payload, row);
      if (!picked) throw new Error("nenhuma imagem utilizável");

      await downloadToWebp(picked.url, outFile);

      report.changed.push({
        sku: row.sku,
        title_pt: row.title_pt,
        output: `/products/csv-curated/${normalized}/cover.webp`,
        query,
        imageUrl: picked.url,
        source: picked.source
      });
      processed += 1;
      console.log("ok");
    } catch (error) {
      report.failed.push({
        sku: row.sku,
        title_pt: row.title_pt,
        query,
        error: error instanceof Error ? error.message : String(error)
      });
      processed += 1;
      console.log(`falhou (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  await fs.mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({
    ok: true,
    changed: report.changed.length,
    failed: report.failed.length,
    skipped: report.skipped.length,
    report: "reports/fill-csv-curated-images-report.json"
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
