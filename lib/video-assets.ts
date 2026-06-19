import "server-only";
import fs from "node:fs";
import path from "node:path";

export type LicensedVideoAssetId =
  | "hero-printer-loop"
  | "filament-detail-loop"
  | "timelapse-print-loop"
  | "process-printer-loop";

type VideoManifestEntry = {
  id: string;
  optimizedFile?: string | null;
  posterFile?: string | null;
  source?: string;
  sourceUrl?: string;
  license?: string;
  creator?: string;
};

type VideoFallback = {
  optimizedFile: string;
  posterFile: string;
};

const FALLBACKS: Record<LicensedVideoAssetId, VideoFallback> = {
  "hero-printer-loop": {
    optimizedFile: "/videos/hero-printing.mp4",
    posterFile: "/hero-poster.webp",
  },
  "filament-detail-loop": {
    optimizedFile: "/media/videos/filament-detail-loop.mp4",
    posterFile: "/media/posters/filament-detail-poster.webp",
  },
  "timelapse-print-loop": {
    optimizedFile: "/media/videos/timelapse-print-loop.mp4",
    posterFile: "/media/posters/timelapse-print-poster.webp",
  },
  "process-printer-loop": {
    optimizedFile: "/media/videos/process-printer-loop.mp4",
    posterFile: "/media/posters/process-printer-poster.webp",
  },
};

const publicDir = path.join(process.cwd(), "public");
const manifestPath = path.join(publicDir, "media/licenses/video-assets.json");

export function getLicensedVideoAsset(id: LicensedVideoAssetId) {
  const fallback = FALLBACKS[id];
  const manifestEntry = readVideoManifest().find((entry) => entry.id === id);
  const optimizedFile = manifestEntry?.optimizedFile || fallback.optimizedFile;
  const posterFile = manifestEntry?.posterFile || fallback.posterFile;

  return {
    id,
    src: publicFileExists(optimizedFile) ? optimizedFile : null,
    poster: publicFileExists(posterFile) ? posterFile : null,
    license: manifestEntry ?? null,
  };
}

function readVideoManifest(): VideoManifestEntry[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isVideoManifestEntry) : [];
  } catch {
    return [];
  }
}

function isVideoManifestEntry(value: unknown): value is VideoManifestEntry {
  return Boolean(value && typeof value === "object" && "id" in value && typeof (value as { id: unknown }).id === "string");
}

function publicFileExists(publicPath: string) {
  if (/^https?:\/\//i.test(publicPath)) return false;
  return fs.existsSync(path.join(publicDir, publicPath.replace(/^\//, "")));
}
