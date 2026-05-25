import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.join(rootDir, "public");
const baseManifestPath = path.join(publicDir, "media", "licenses", "video-assets.json");
const cinematicManifestPath = path.join(publicDir, "media", "licenses", "cinematic-video-assets.json");
const licensedFetchScript = path.join(__dirname, "fetch-licensed-videos.mjs");

const queries = [
  "3d printer working",
  "3d printing machine",
  "3d printer close up",
  "3d printing timelapse",
  "filament 3d printer",
  "desktop 3d printer",
  "3d printer nozzle",
];

if (process.env.PEXELS_API_KEY) {
  const result = spawnSync(process.execPath, [licensedFetchScript], {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const baseManifest = readJsonArray(baseManifestPath);
const manifest = {
  generatedAt: new Date().toISOString(),
  provider: "Pexels",
  status: process.env.PEXELS_API_KEY ? "synced-with-licensed-video-pipeline" : "no-pexels-key-using-existing-licensed-assets",
  rules: [
    "No YouTube, TikTok, Instagram or watermarked video.",
    "No visible brand or logo endorsement.",
    "Only local optimized video files are referenced by the storefront.",
    "Decorative video uses autoplay muted loop playsInline preload=metadata and poster fallback.",
  ],
  queries,
  variants: {
    home: "/media/videos/hero-printer-loop.mp4",
    catalog: "/media/videos/process-printer-loop.mp4",
    product: "/media/videos/filament-detail-loop.mp4",
  },
  posters: {
    home: "/media/posters/hero-printer-poster.webp",
    catalog: "/media/posters/process-printer-poster.webp",
    product: "/media/posters/filament-detail-poster.webp",
  },
  licensedAssets: baseManifest.map((entry) => ({
    id: entry.id,
    source: entry.source,
    sourceUrl: entry.sourceUrl,
    creator: entry.creator,
    license: entry.license,
    licenseUrl: entry.licenseUrl,
    optimizedFile: entry.optimizedFile,
    posterFile: entry.posterFile,
    commercialUseAllowed: entry.commercialUseAllowed,
    attributionRequired: entry.attributionRequired,
    brandLogoVisible: entry.brandLogoVisible,
  })),
};

fs.mkdirSync(path.dirname(cinematicManifestPath), { recursive: true });
fs.writeFileSync(cinematicManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`[media:fetch-cinematic] manifest written: ${path.relative(rootDir, cinematicManifestPath).replaceAll("\\", "/")}`);

function readJsonArray(file) {
  try {
    const value = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
