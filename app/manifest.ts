import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MDH 3D",
    short_name: "MDH 3D",
    description: "Impressões 3D premium no Rio de Janeiro",
    start_url: "/",
    display: "standalone",
    background_color: "#070A14",
    theme_color: "#06B6D4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
