import fs from "node:fs/promises";
import path from "node:path";

function parseArgs(argv) {
  const out = {};
  for (const raw of argv.slice(2)) {
    const clean = raw.replace(/^--/, "");
    const idx = clean.indexOf("=");
    if (idx === -1) out[clean] = true;
    else out[clean.slice(0, idx)] = clean.slice(idx + 1);
  }
  return out;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const args = parseArgs(process.argv);
const mode = args.mode || "fs";
const baseUrl = (args.baseUrl || "http://127.0.0.1:3000").replace(/\/$/, "");
const manifestPath = args.manifest || "output/CATALOG_SEMANTIC_AUDIT.json";
const publicMode = args.publicMode || "strict";
const publicRoot = path.resolve("public");

const allowedPublicStatuses = new Set(["APPROVED", "FIX_TEXT"]);
const allowedMediaStatuses = new Set(["verified", "render-verified", "probable"]);

const raw = await fs.readFile(manifestPath, "utf8");
const manifest = JSON.parse(raw);
const items = Array.isArray(manifest.items) ? manifest.items : [];

if (!items.length) {
  console.error(JSON.stringify({ ok: false, reason: "manifest_without_items", manifestPath }, null, 2));
  process.exit(1);
}

if (mode === "http") {
  try {
    const ping = await fetch(baseUrl, { method: "HEAD" });
    if (!ping.ok) {
      console.error(JSON.stringify({ ok: false, reason: `server_unhealthy:${ping.status}`, baseUrl }, null, 2));
      process.exit(1);
    }
  } catch {
    console.error(JSON.stringify({ ok: false, reason: "server_not_running", baseUrl }, null, 2));
    process.exit(1);
  }
}

const failures = [];

for (const item of items) {
  const sku = item.id || item.sku || item.slug || "unknown-sku";

  if (publicMode === "strict") {
    if (!allowedPublicStatuses.has(item.status)) continue;
    if (item.mediaStatus && !allowedMediaStatuses.has(item.mediaStatus)) {
      failures.push({ sku, reason: `forbidden_media_status:${item.mediaStatus}` });
      continue;
    }
    if (item.status === "APPROVED" && (item.images || []).length < 4) {
      failures.push({ sku, reason: `insufficient_public_images:${(item.images || []).length}` });
      continue;
    }
  }

  const paths = [...new Set([item.heroImage, ...(item.images || [])].filter(Boolean))];
  if (!paths.length) {
    failures.push({ sku, reason: "no_public_images" });
    continue;
  }

  for (const p of paths) {
    if (mode === "fs") {
      const normalized = p.startsWith("/") ? p.slice(1) : p;
      const absolutePath = path.join(publicRoot, normalized);
      const ok = await exists(absolutePath);
      if (!ok) failures.push({ sku, reason: "missing_local_file", path: p, absolutePath });
    } else {
      const url = `${baseUrl}${p.startsWith("/") ? p : `/${p}`}`;
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (!res.ok) failures.push({ sku, reason: `http_${res.status}`, path: p });
      } catch {
        failures.push({ sku, reason: "fetch_failed", path: p });
      }
    }
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, mode, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, mode, checked: items.length }, null, 2));
