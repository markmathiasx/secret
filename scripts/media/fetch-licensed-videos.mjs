import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.join(rootDir, "public");
const sourceDir = path.join(publicDir, "media/videos/source");
const videosDir = path.join(publicDir, "media/videos");
const postersDir = path.join(publicDir, "media/posters");
const licensesDir = path.join(publicDir, "media/licenses");
const manifestPath = path.join(licensesDir, "video-assets.json");
const rejectedPath = path.join(licensesDir, "video-assets-rejected.json");
const limitationsPath = path.join(licensesDir, "video-assets-limitations.json");

const today = new Date().toISOString().slice(0, 10);

const SEARCH_TERMS = [
  "3d printer working close up",
  "3d printing machine working",
  "3d printing timelapse",
  "3d printer filament close up",
  "3d printer creating object",
  "3d printing prototype",
  "desktop 3d printer working",
  "3d printing workshop",
  "3d printer nozzle close up",
  "3d printer printing object",
];

const TARGETS = [
  {
    id: "hero-printer-loop",
    role: "hero",
    query: "3d printer working close up",
    optimizedFile: "/media/videos/hero-printer-loop.mp4",
    posterFile: "/media/posters/hero-printer-poster.webp",
    maxWidth: 1920,
    targetSeconds: 12,
    notes: "Hero background preference: compact desktop FDM printer working, no recognizable logo.",
  },
  {
    id: "filament-detail-loop",
    role: "filament-detail",
    query: "3d printer filament close up",
    optimizedFile: "/media/videos/filament-detail-loop.mp4",
    posterFile: "/media/posters/filament-detail-poster.webp",
    maxWidth: 1280,
    targetSeconds: 10,
    notes: "Filament or extruder detail preference, no watermark and no person in focus.",
  },
  {
    id: "timelapse-print-loop",
    role: "timelapse",
    query: "3d printing timelapse",
    optimizedFile: "/media/videos/timelapse-print-loop.mp4",
    posterFile: "/media/posters/timelapse-print-poster.webp",
    maxWidth: 1280,
    targetSeconds: 10,
    notes: "Loopable printing motion or timelapse preference, no platform watermark.",
  },
  {
    id: "process-printer-loop",
    role: "process",
    query: "desktop 3d printer working",
    optimizedFile: "/media/videos/process-printer-loop.mp4",
    posterFile: "/media/posters/process-printer-poster.webp",
    maxWidth: 1280,
    targetSeconds: 12,
    notes: "Process section background preference: desktop printer, clean workshop, no visible brand.",
  },
];

const PUBLIC_CANDIDATES = [
  {
    source: "Pexels",
    url: "https://www.pexels.com/video/close-up-shot-of-3d-printer-4485455/",
    reason: "Public page candidate found via search; no API key available.",
  },
  {
    source: "Pexels",
    url: "https://www.pexels.com/video/close-up-of-printer-11945995/",
    reason: "Public page candidate found via search; no API key available.",
  },
  {
    source: "Pexels",
    url: "https://www.pexels.com/video/3d-printing-24861303/",
    reason: "Public page candidate found via search; no API key available.",
  },
  {
    source: "Pixabay",
    url: "https://pixabay.com/videos/printer-3d-printing-print-164476/",
    reason: "Public page candidate found via search; no API key available.",
  },
];

await ensureDirectories();

const ffmpegAvailable = hasExecutable("ffmpeg", ["-version"]);
const pexelsKey = process.env.PEXELS_API_KEY?.trim();
const pixabayKey = process.env.PIXABAY_API_KEY?.trim();
const rejected = [];
const manifest = [];

if (pexelsKey) {
  const candidates = await searchPexels(pexelsKey);
  const selected = selectPexelsVideos(candidates);

  for (const item of selected) {
    try {
      manifest.push(await downloadPexelsAsset(item, ffmpegAvailable));
    } catch (error) {
      rejected.push({
        source: "Pexels",
        sourceUrl: item.video.url,
        reason: error instanceof Error ? error.message : "download failed",
      });
    }
  }
} else {
  rejected.push({
    source: "Pexels API",
    sourceUrl: "https://www.pexels.com/api/",
    reason: "PEXELS_API_KEY is not set; official API search/download was skipped.",
  });
  await probePublicCandidates(rejected);
}

if (!pixabayKey) {
  rejected.push({
    source: "Pixabay API",
    sourceUrl: "https://pixabay.com/api/docs/",
    reason: "PIXABAY_API_KEY is not set; official Pixabay API search/download was skipped.",
  });
}

if (manifest.length === 0) {
  await createFallbackPosters();
}

await writeJson(manifestPath, manifest);
await writeJson(rejectedPath, rejected);
await writeJson(limitationsPath, {
  checkedAt: new Date().toISOString(),
  pexelsApiKeyAvailable: Boolean(pexelsKey),
  pixabayApiKeyAvailable: Boolean(pixabayKey),
  ffmpegAvailable,
  downloadedCount: manifest.length,
  fallbackGenerated: manifest.length === 0,
  limitation:
    manifest.length === 0
      ? "No stock video was downloaded. Public Pexels/Pixabay pages were not used for automated download because no clear direct file URL was available without a browser challenge or official API key."
      : null,
  searchTerms: SEARCH_TERMS,
});

if (manifest.length === 0) {
  console.warn(
    "[media:fetch] No legally automatable stock video download completed. Generated project-owned visual fallbacks instead."
  );
} else {
  console.log(`[media:fetch] Downloaded ${manifest.length} licensed stock video asset(s).`);
}

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(sourceDir, { recursive: true }),
    fs.mkdir(videosDir, { recursive: true }),
    fs.mkdir(postersDir, { recursive: true }),
    fs.mkdir(licensesDir, { recursive: true }),
  ]);
}

function hasExecutable(command, args) {
  const result = spawnSync(command, args, { stdio: "ignore" });
  return result.status === 0;
}

async function searchPexels(apiKey) {
  const byId = new Map();

  for (const query of SEARCH_TERMS) {
    const url = new URL("https://api.pexels.com/videos/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("per_page", "15");
    url.searchParams.set("size", "medium");

    const response = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      throw new Error(`Pexels API failed for "${query}": ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    for (const video of payload.videos ?? []) {
      byId.set(video.id, { video, query });
    }
  }

  return [...byId.values()];
}

function selectPexelsVideos(candidates) {
  const selected = [];
  const used = new Set();

  for (const target of TARGETS) {
    const ranked = candidates
      .filter(({ video }) => !used.has(video.id))
      .map((candidate) => ({ ...candidate, target, score: scoreCandidate(candidate.video, target) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score);

    const winner = ranked[0];
    if (winner) {
      used.add(winner.video.id);
      selected.push(winner);
    }
  }

  return selected;
}

function scoreCandidate(video, target) {
  if (!video || video.width <= video.height) return 0;
  if (typeof video.duration === "number" && (video.duration < 4 || video.duration > 45)) return 0;

  const text = `${video.url ?? ""} ${target.query}`.toLowerCase();
  if (/(youtube|tiktok|instagram|shorts|reels)/i.test(text)) return 0;

  const durationScore = typeof video.duration === "number" ? 40 - Math.abs(video.duration - target.targetSeconds) : 20;
  const resolutionScore = Math.min(30, Math.round((video.width / 1920) * 30));
  const queryScore = text.includes("3d") || text.includes("printer") ? 30 : 10;
  return Math.max(1, durationScore + resolutionScore + queryScore);
}

async function downloadPexelsAsset(selection, ffmpegAvailable) {
  const { target, video } = selection;
  const file = choosePexelsFile(video.video_files ?? [], target.maxWidth);
  if (!file?.link) {
    throw new Error("No MP4 video_file returned by Pexels API.");
  }

  const sourceName = `${target.id}-pexels-${video.id}.mp4`;
  const sourcePath = path.join(sourceDir, sourceName);
  const optimizedPath = path.join(publicDir, target.optimizedFile.replace(/^\//, ""));
  const posterPath = path.join(publicDir, target.posterFile.replace(/^\//, ""));

  await downloadToFile(file.link, sourcePath);

  let optimizationNote = "";
  if (ffmpegAvailable) {
    optimizeWithFfmpeg(sourcePath, optimizedPath, posterPath, target);
    optimizationNote = "Optimized with ffmpeg: no audio, H.264, faststart, capped resolution.";
  } else {
    const stat = await fs.stat(sourcePath);
    if (stat.size > 12 * 1024 * 1024) {
      throw new Error("ffmpeg is unavailable and source file is too large for direct web fallback.");
    }
    await fs.copyFile(sourcePath, optimizedPath);
    await createPosterFromRemoteImage(video.image, posterPath, target.id);
    optimizationNote = "ffmpeg unavailable; copied lightweight MP4 and generated poster from Pexels thumbnail.";
  }

  const optimizedStat = await fs.stat(optimizedPath);

  return {
    id: target.id,
    source: "Pexels",
    sourceUrl: video.url,
    creator: video.user?.name ?? "Unknown Pexels creator",
    license: "Pexels License",
    licenseUrl: "https://www.pexels.com/license/",
    downloadedAt: today,
    originalFile: `/media/videos/source/${sourceName}`,
    optimizedFile: target.optimizedFile,
    posterFile: target.posterFile,
    commercialUseAllowed: true,
    attributionRequired: false,
    brandLogoVisible: false,
    durationSeconds: video.duration ?? null,
    optimizedBytes: optimizedStat.size,
    notes: `${target.notes} ${optimizationNote}`,
  };
}

function choosePexelsFile(files, maxWidth) {
  return files
    .filter((file) => file.file_type === "video/mp4" && file.width && file.height && file.width >= file.height)
    .sort((a, b) => {
      const aPenalty = a.width > maxWidth ? a.width - maxWidth : maxWidth - a.width;
      const bPenalty = b.width > maxWidth ? b.width - maxWidth : maxWidth - b.width;
      return aPenalty - bPenalty;
    })[0];
}

async function downloadToFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(destination, Buffer.from(arrayBuffer));
}

function optimizeWithFfmpeg(sourcePath, optimizedPath, posterPath, target) {
  const scale = `scale='min(${target.maxWidth},iw)':-2,crop='min(iw,ih*16/9)':'min(ih,iw*9/16)'`;
  const videoArgs = [
    "-y",
    "-ss",
    "0",
    "-t",
    String(target.targetSeconds),
    "-i",
    sourcePath,
    "-an",
    "-vf",
    scale,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "28",
    "-movflags",
    "+faststart",
    optimizedPath,
  ];
  const posterArgs = [
    "-y",
    "-ss",
    "1",
    "-i",
    sourcePath,
    "-vframes",
    "1",
    "-vf",
    scale,
    posterPath,
  ];

  for (const args of [videoArgs, posterArgs]) {
    const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
    if (result.status !== 0) throw new Error("ffmpeg optimization failed.");
  }
}

async function createPosterFromRemoteImage(url, destination, id) {
  if (!url) return createFallbackPoster(destination, id);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`poster fetch failed ${response.status}`);
    const input = Buffer.from(await response.arrayBuffer());
    const sharp = await import("sharp");
    await sharp.default(input).resize(1600, 900, { fit: "cover" }).webp({ quality: 78 }).toFile(destination);
  } catch {
    await createFallbackPoster(destination, id);
  }
}

async function probePublicCandidates(rejected) {
  for (const candidate of PUBLIC_CANDIDATES) {
    try {
      const response = await fetch(candidate.url, {
        headers: {
          "user-agent": "MDH3DStoreMediaLicenseAudit/1.0 (+https://mdh3d.com.br)",
          accept: "text/html,application/xhtml+xml",
        },
      });
      const text = await response.text();
      const cloudflare = /just a moment|enable javascript and cookies|__cf_chl/i.test(text);
      const directMp4 = text.match(/https:\/\/[^"']+\.mp4[^"']*/i)?.[0];

      rejected.push({
        source: candidate.source,
        sourceUrl: candidate.url,
        reason: cloudflare
          ? "Rejected: public page returned browser challenge; no bypass attempted."
          : directMp4
            ? "Rejected: a raw MP4 string appeared in HTML but was not verified as an official download endpoint."
            : "Rejected: public page did not expose a clear direct MP4 download URL.",
      });
    } catch (error) {
      rejected.push({
        source: candidate.source,
        sourceUrl: candidate.url,
        reason: `Rejected: public probe failed (${error instanceof Error ? error.message : "unknown error"}).`,
      });
    }
  }
}

async function createFallbackPosters() {
  await Promise.all(TARGETS.map((target) => createFallbackPoster(path.join(publicDir, target.posterFile.slice(1)), target.id)));
}

async function createFallbackPoster(destination, id) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05070a"/>
      <stop offset="0.52" stop-color="#101820"/>
      <stop offset="1" stop-color="#07150f"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#22d3ee" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#10b981" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <path d="M175 635 C430 560 580 705 835 610 C1015 542 1228 570 1440 462" fill="none" stroke="url(#line)" stroke-width="4" filter="url(#glow)"/>
  <g transform="translate(338 184)" stroke-linecap="round" stroke-linejoin="round">
    <rect x="100" y="145" width="760" height="486" rx="34" fill="#091018" stroke="#ffffff" stroke-opacity="0.16" stroke-width="4"/>
    <rect x="154" y="205" width="652" height="344" rx="16" fill="#030609" stroke="#22d3ee" stroke-opacity="0.22" stroke-width="3"/>
    <path d="M210 518H748" stroke="#10b981" stroke-opacity="0.55" stroke-width="7"/>
    <path d="M250 250H708" stroke="#ffffff" stroke-opacity="0.14" stroke-width="8"/>
    <path d="M480 250V438" stroke="#ffffff" stroke-opacity="0.18" stroke-width="8"/>
    <path d="M424 438h112l-28 58h-56z" fill="#22d3ee" fill-opacity="0.23" stroke="#22d3ee" stroke-opacity="0.7" stroke-width="4" filter="url(#glow)"/>
    <path d="M365 518c55-72 168-72 230 0" fill="none" stroke="#10b981" stroke-opacity="0.62" stroke-width="6"/>
    <circle cx="173" cy="610" r="11" fill="#22d3ee" fill-opacity="0.62"/>
    <circle cx="785" cy="610" r="11" fill="#10b981" fill-opacity="0.62"/>
  </g>
</svg>`;

  const sharp = await import("sharp");
  await sharp.default(Buffer.from(svg)).webp({ quality: 82 }).toFile(destination);
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
