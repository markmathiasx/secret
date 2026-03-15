import fs from "node:fs";
import path from "node:path";

type VideoSource = {
  src: string;
  type: string;
};

function assetExists(publicPath: string) {
  const absolutePath = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(absolutePath);
}

function pickExisting(paths: readonly string[]) {
  return paths.filter((item) => assetExists(item));
}

function firstExisting(paths: readonly string[]) {
  return paths.find((item) => assetExists(item)) || null;
}

function getVideoType(src: string) {
  if (src.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

const heroVideoCandidates = ["/media/hero-printer-loop.webm", "/media/hero-printer-loop.mp4"] as const;
const productionVideoCandidates = ["/media/finishing-closeup.webm", "/media/finishing-closeup.mp4"] as const;
const heroFallbackCandidates = [
  "/backgrounds/hero-printer-fallback.jpg",
  "/backgrounds/hero-printer-fallback.webp",
  "/backgrounds/hero-printer-fallback.png",
  "/placeholders/hero-bg.svg"
] as const;
const processFallbackCandidates = [
  "/backgrounds/process-detail.jpg",
  "/backgrounds/hero-printer-fallback.jpg",
  "/placeholders/hero-bg.svg"
] as const;

function buildVideoSources(candidates: readonly string[]): VideoSource[] {
  return pickExisting(candidates).map((src) => ({ src, type: getVideoType(src) }));
}

export function getHeroBackgroundMedia() {
  const sources = buildVideoSources(heroVideoCandidates);
  const fallbackImageSrc = firstExisting(heroFallbackCandidates) || "/placeholders/hero-bg.svg";

  return {
    sources,
    hasVideo: sources.length > 0,
    posterSrc: fallbackImageSrc,
    fallbackImageSrc
  };
}

export function getProductionVideoMedia() {
  const sources = buildVideoSources(productionVideoCandidates);
  const fallbackImageSrc = firstExisting(processFallbackCandidates) || "/placeholders/hero-bg.svg";

  return {
    sources,
    hasVideo: sources.length > 0,
    posterSrc: fallbackImageSrc,
    fallbackImageSrc
  };
}
