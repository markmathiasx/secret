<<<<<<< ours
<<<<<<< ours
import fs from "node:fs";
import path from "node:path";

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
type VideoSource = {
  src: string;
  type: string;
};

=======
>>>>>>> theirs
=======
>>>>>>> theirs
export type MediaItem = {
  src: string;
  poster?: string;
  title: string;
  kind: "video" | "image";
<<<<<<< ours
<<<<<<< ours
  caption: string;
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
const processVideoCandidates = ["/media/finishing-closeup.webm", "/media/finishing-closeup.mp4"] as const;
=======
const heroVideoCandidates = ["/media/hero-printer-loop.webm", "/media/hero-printer-loop.mp4"] as const;
const productionVideoCandidates = ["/media/finishing-closeup.webm", "/media/finishing-closeup.mp4"] as const;
>>>>>>> theirs
=======
const heroVideoCandidates = ["/media/hero-printer-loop.webm", "/media/hero-printer-loop.mp4"] as const;
const productionVideoCandidates = ["/media/finishing-closeup.webm", "/media/finishing-closeup.mp4"] as const;
>>>>>>> theirs
const heroFallbackCandidates = [
  "/backgrounds/hero-printer-fallback.jpg",
  "/backgrounds/hero-printer-fallback.webp",
  "/backgrounds/hero-printer-fallback.png",
  "/placeholders/hero-bg.svg"
] as const;
<<<<<<< ours
<<<<<<< ours
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

export function getHomepageMedia(): MediaItem[] {
  const heroPoster = firstExisting(heroFallbackCandidates) || "/placeholders/hero-bg.svg";
  const processPoster = firstExisting(processFallbackCandidates) || heroPoster;

  return [
    assetExists("/media/hero-printer-loop.mp4")
      ? {
          src: "/media/hero-printer-loop.mp4",
          poster: heroPoster,
          title: "Impressao em andamento",
          kind: "video",
          caption: "Mostre processo real sem depender de servicos externos."
        }
      : {
          src: heroPoster,
          title: "Vitrine com fallback elegante",
          kind: "image",
          caption: "A home continua premium mesmo se o video nao carregar."
        },
    assetExists("/media/finishing-closeup.mp4")
      ? {
          src: "/media/finishing-closeup.mp4",
          poster: processPoster,
          title: "Acabamento e revisao",
          kind: "video",
          caption: "Bloco pensado para reforcar confianca e qualidade percebida."
        }
      : {
          src: processPoster,
          title: "Detalhe de acabamento",
          kind: "image",
          caption: "Fallback local para a etapa final da producao."
        },
    {
      src: assetExists("/logo-mdh.jpg") ? "/logo-mdh.jpg" : "/catalog-assets/placeholder-product.svg",
      title: "Marca MDH 3D",
      kind: "image",
      caption: "Identidade consistente em mobile, tablet e desktop."
    }
  ];
}

export function getProductionVideoMedia() {
  const sources = buildVideoSources(processVideoCandidates);
  const fallbackImageSrc = firstExisting(processFallbackCandidates) || "/placeholders/hero-bg.svg";

  return {
    sources,
    hasVideo: sources.length > 0,
    posterSrc: fallbackImageSrc,
    fallbackImageSrc
  };
=======
};

=======
};

>>>>>>> theirs
const homepageMedia: MediaItem[] = [
  { src: "/media/hero-printer-loop.mp4", title: "Produção em andamento", kind: "video", poster: "/backgrounds/hero-printer-fallback.jpg" },
  { src: "/media/finishing-closeup.mp4", title: "Detalhe de acabamento", kind: "video", poster: "/backgrounds/process-detail.jpg" },
  { src: "/logo-mdh.jpg", title: "Portfólio MDH 3D", kind: "image" }
];

export function getHomepageMedia(): MediaItem[] {
  return homepageMedia;
<<<<<<< ours
>>>>>>> theirs
=======

function localAssetExists(publicPath: string) {
  const absolute = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(absolute);
}

function existing(paths: readonly string[]) {
  return paths.filter((item) => localAssetExists(item));
}

=======
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

>>>>>>> theirs
=======

function localAssetExists(publicPath: string) {
  const absolute = path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  return fs.existsSync(absolute);
}

function existing(paths: readonly string[]) {
  return paths.filter((item) => localAssetExists(item));
}

>>>>>>> theirs
=======
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

>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
}
