export function getHeroBackgroundMedia() {
  const sources = [
    { src: '/media/hero-printer-loop.mp4', type: 'video/mp4' }
  ];

  return {
    hasVideo: true,
    posterSrc: '/backgrounds/hero-printer-fallback.jpg',
    fallbackImageSrc: '/backgrounds/hero-printer-fallback.jpg',
    sources
  };
}

export function getProductionMedia() {
  return [
    {
      id: 'hero-printer-loop',
      title: 'Produção em andamento',
      description: 'Loop automático, mobile-friendly, pronto para Safari e Chrome.',
      duration: '10s',
      type: 'video' as const,
      src: '/media/hero-printer-loop.mp4',
      poster: '/backgrounds/hero-printer-fallback.jpg'
    },
    {
      id: 'finishing-closeup',
      title: 'Detalhe de acabamento',
      description: 'Close da peça final para transmitir confiança na revisão visual.',
      duration: '10s',
      type: 'video' as const,
      src: '/media/finishing-closeup.mp4',
      poster: '/backgrounds/process-detail.jpg'
    },
    {
      id: 'process-detail',
      title: 'Destaque visual',
      description: 'Imagem institucional para preencher a seção de portfólio e processo.',
      type: 'image' as const,
      src: '/backgrounds/process-detail.jpg'
    }
  ];
}
