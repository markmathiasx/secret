export type MediaItem = {
  src: string;
  title: string;
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  eyebrow: string;
  description: string;
};

const homepageMedia: MediaItem[] = [
  {
    src: "/catalog-assets/mdh-dragao-articulado-premium-compact.webp",
    eyebrow: "Colecionavel em destaque",
    title: "Peças com presença visual mais forte já no primeiro olhar",
    description: "A peça certa aparece melhor com foto limpa, enquadramento bom e leitura clara de acabamento."
  },
  {
    src: "/catalog-assets/mdh-suporte-controle-duplo-desk.webp",
    eyebrow: "Utilidade com estilo",
    title: "Setup e organizacao ficam mais faceis de avaliar com imagem limpa e foco total na peca",
    description: "Imagem estática bem escolhida ajuda o cliente a entender proporção, uso e valor percebido mais rápido."
  },
  {
    src: "/catalog-assets/mdh-luminaria-lua-vazada-desk.webp",
    eyebrow: "Decor com identidade",
    title: "Decoracao e presentes ganham mais confianca quando a vitrine respira melhor",
    description: "Mais foco na peca deixa a navegacao mais leve e a compra mais direta."
  }
];

export function getHomepageMedia() {
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  kind: "video" | "image";
};

const homepageMedia: MediaItem[] = [
  { src: "/media/hero-printer-loop.mp4", title: "Produção em andamento", kind: "video", poster: "/backgrounds/hero-printer-fallback.jpg" },
  { src: "/media/finishing-closeup.mp4", title: "Detalhe de acabamento", kind: "video", poster: "/backgrounds/process-detail.jpg" },
  { src: "/logo-mdh.jpg", title: "Portfólio MDH 3D", kind: "image" }
];

export function getHomepageMedia(): MediaItem[] {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
  kind: "video" | "image";
};

const homepageMedia: MediaItem[] = [
  { src: "/media/hero-printer-loop.mp4", title: "Produção em andamento", kind: "video", poster: "/backgrounds/hero-printer-fallback.jpg" },
  { src: "/media/finishing-closeup.mp4", title: "Detalhe de acabamento", kind: "video", poster: "/backgrounds/process-detail.jpg" },
  { src: "/logo-mdh.jpg", title: "Portfólio MDH 3D", kind: "image" }
];

export function getHomepageMedia(): MediaItem[] {
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  return homepageMedia;
}
