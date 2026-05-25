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
    ],
    shortcuts: [
      {
        name: "Catálogo",
        short_name: "Catálogo",
        description: "Abrir a vitrine de produtos MDH 3D",
        url: "/catalogo",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "WhatsApp",
        short_name: "WhatsApp",
        description: "Abrir atendimento rápido",
        url: "/atendimento?canal=whatsapp",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Jogue",
        short_name: "Jogue",
        description: "Abrir o Print Quest",
        url: "/jogue",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Carrinho",
        short_name: "Carrinho",
        description: "Abrir o carrinho",
        url: "/carrinho",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
