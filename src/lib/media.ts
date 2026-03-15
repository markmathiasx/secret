import fs from "node:fs";
import path from "node:path";

const heroVideoCandidates = ["/media/hero-printer-loop.webm", "/media/hero-printer-loop.mp4"] as const;
const productionVideoCandidates = ["/media/finishing-closeup.webm", "/media/finishing-closeup.mp4"] as const;
const heroFallbackCandidates = [
  "/backgrounds/hero-printer-fallback.jpg",
  "/backgrounds/hero-printer-fallback.webp",
  "/backgrounds/hero-printer-fallback.png",
  "/placeholders/hero-bg.svg"
] as const;

function localAssetExists(publicPath: string) {
  const absolute = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(absolute);
}

function existing(paths: readonly string[]) {
  return paths.filter((item) => localAssetExists(item));
}

function pickFirstExisting(paths: readonly string[]) {
  return paths.find((item) => localAssetExists(item)) || null;
}

function getType(src: string) {
  if (src.endsWith(".webm")) return "video/webm";
  if (src.endsWith(".mp4")) return "video/mp4";
  return "video/mp4";
}

export function getHeroBackgroundMedia() {
  const sources = existing(heroVideoCandidates).map((src) => ({ src, type: getType(src) }));
  const fallbackImageSrc = pickFirstExisting(heroFallbackCandidates) || "/placeholders/hero-bg.svg";
  return {
    sources,
    hasVideo: sources.length > 0,
    posterSrc: fallbackImageSrc,
    fallbackImageSrc
  };
}

export function getProductionVideoMedia() {
  const sources = existing(productionVideoCandidates).map((src) => ({ src, type: getType(src) }));
  const fallbackImageSrc = pickFirstExisting(heroFallbackCandidates) || "/placeholders/hero-bg.svg";
  return {
    sources,
    hasVideo: sources.length > 0,
    posterSrc: fallbackImageSrc,
    fallbackImageSrc
  };
export type MediaItem = {
  src: string;
  poster?: string;
  title: string;
  kind: "video" | "image";
};

const homepageMedia: MediaItem[] = [
  { src: "/media/hero-printer-loop.mp4", title: "Produção em andamento", kind: "video", poster: "/backgrounds/hero-printer-fallback.jpg" },
  { src: "/media/finishing-closeup.mp4", title: "Detalhe de acabamento", kind: "video", poster: "/backgrounds/process-detail.jpg" },
  { src: "/logo-mdh.jpg", title: "Portfólio MDH 3D", kind: "image" }
];

export function getHomepageMedia(): MediaItem[] {
  return homepageMedia;
}
