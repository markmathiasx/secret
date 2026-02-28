import fs from "node:fs";
import path from "node:path";

export type MediaItem = {
  src: string;
  poster?: string;
  title: string;
  kind: "video" | "placeholder";
};

const fallbackMedia: MediaItem[] = [
  { src: "/logo-mdh.jpg", title: "Setup premium MDH 3D", kind: "placeholder" },
  { src: "/logo-mdh.jpg", title: "Bambu Lab A1 Mini em operação", kind: "placeholder" },
  { src: "/logo-mdh.jpg", title: "Peças utilitárias, geek e anime", kind: "placeholder" }
];

export function getHomepageMedia(): MediaItem[] {
  const mediaDir = path.join(process.cwd(), "public", "media");
  if (!fs.existsSync(mediaDir)) return fallbackMedia;

  const files = fs
    .readdirSync(mediaDir)
    .filter((file) => /\.(mp4|webm|mov)$/i.test(file))
    .slice(0, 6)
    .map((file) => ({
      src: `/media/${file}`,
      title: file.replace(/[-_]/g, " ").replace(/\.[^.]+$/, ""),
      kind: "video" as const
    }));

  return files.length ? files : fallbackMedia;
}
