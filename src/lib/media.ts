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
