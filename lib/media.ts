type ProductionMediaItem =
  | {
      id: string;
      title: string;
      description: string;
      duration?: string;
      type: 'video';
      src: string;
      poster: string;
    }
  | {
      id: string;
      title: string;
      description: string;
      duration?: string;
      type: 'image';
      src: string;
    };

export function getHeroBackgroundMedia() {
  return {
    hasVideo: false,
    posterSrc: '/media/posters/hero-printer-poster.webp',
    fallbackImageSrc: '/media/posters/hero-printer-poster.webp',
    sources: []
  };
}

export function getProductionMedia(): ProductionMediaItem[] {
  return [
    {
      id: 'hero-printer-loop',
      title: 'Produção em andamento',
      description: 'Loop automático, mobile-friendly, pronto para Safari e Chrome.',
      duration: '10s',
      type: 'image' as const,
      src: '/media/posters/process-printer-poster.webp'
    },
    {
      id: 'finishing-closeup',
      title: 'Detalhe de acabamento',
      description: 'Close da peça final para transmitir confiança na revisão visual.',
      duration: '10s',
      type: 'image' as const,
      src: '/media/posters/filament-detail-poster.webp'
    },
    {
      id: 'process-detail',
      title: 'Destaque visual',
      description: 'Imagem institucional para preencher a seção de portfólio e processo.',
      type: 'image' as const,
      src: '/media/posters/timelapse-print-poster.webp'
    }
  ];
}
