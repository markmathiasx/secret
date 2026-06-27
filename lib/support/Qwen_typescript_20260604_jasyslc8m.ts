import productsData from '@/data/products.json';

export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricePix: number;
  priceCard: number;
  image: string;
  description: string;
  badge?: 'Mais vendido' | 'Novidade' | 'Oferta';
  useCase: string;
}

export function getFeaturedProducts(): FeaturedProduct[] {
  const arr = Array.isArray(productsData) ? productsData : (productsData as any).products || [];
  
  // Buscar produtos específicos por nome/categoria
  const findProduct = (keywords: string[]) => {
    return arr.find((p: any) => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      return keywords.some(k => name.includes(k.toLowerCase()) || cat.includes(k.toLowerCase()));
    });
  };
  
  const featured: FeaturedProduct[] = [
    {
      id: 'chaveiro-personalizado',
      name: 'Chaveiro Personalizado com Nome',
      slug: 'chaveiro-personalizado-nome',
      category: 'Chaveiros',
      pricePix: 15.00,
      priceCard: 16.00,
      image: '/images/chaveiro-personalizado.jpg',
      description: 'Chaveiro personalizado com seu nome ou texto. Perfeito para presente.',
      badge: 'Mais vendido',
      useCase: 'Ideal para presente'
    },
    {
      id: 'chaveiro-pet',
      name: 'Chaveiro Pet Patinha',
      slug: 'chaveiro-pet-patinha',
      category: 'Chaveiros',
      pricePix: 12.00,
      priceCard: 13.00,
      image: '/images/chaveiro-pet.jpg',
      description: 'Chaveiro em formato de patinha. Para amantes de pets.',
      badge: 'Novidade',
      useCase: 'Ideal para amantes de animais'
    },
    {
      id: 'suporte-celular',
      name: 'Suporte para Celular',
      slug: 'suporte-celular-mesa',
      category: 'Acessórios',
      pricePix: 25.00,
      priceCard: 26.00,
      image: '/images/suporte-celular.jpg',
      description: 'Suporte ajustável para celular. Perfeito para mesa ou cabeceira.',
      useCase: 'Ideal para mesa de trabalho'
    },
    {
      id: 'organizador-cabos',
      name: 'Organizador de Cabos',
      slug: 'organizador-cabos-mesa',
      category: 'Organizadores',
      pricePix: 18.00,
      priceCard: 19.00,
      image: '/images/organizador-cabos.jpg',
      description: 'Organizador de cabos para mesa. Mantenha tudo em ordem.',
      useCase: 'Ideal para setup organizado'
    },
    {
      id: 'porta-capsulas',
      name: 'Porta Cápsulas de Café',
      slug: 'porta-capsulas-cafe',
      category: 'Cozinha',
      pricePix: 35.00,
      priceCard: 36.00,
      image: '/images/porta-capsulas.jpg',
      description: 'Porta cápsulas compatível com Nespresso. Capacidade para 12 cápsulas.',
      badge: 'Mais vendido',
      useCase: 'Ideal para cozinha'
    },
    {
      id: 'suporte-ps5',
      name: 'Suporte Controle PS5',
      slug: 'suporte-controle-ps5',
      category: 'Gamer',
      pricePix: 28.00,
      priceCard: 29.00,
      image: '/images/suporte-ps5.jpg',
      description: 'Suporte para controle de PS5. Design moderno e funcional.',
      useCase: 'Ideal para gamers'
    },
    {
      id: 'porta-copos-geek',
      name: 'Porta-Copos Geek',
      slug: 'porta-copos-geek',
      category: 'Geek',
      pricePix: 15.00,
      priceCard: 16.00,
      image: '/images/porta-copos-geek.jpg',
      description: 'Porta-copos com design geek. Vários temas disponíveis.',
      useCase: 'Ideal para presente geek'
    },
    {
      id: 'luminaria-personalizada',
      name: 'Luminária Personalizada',
      slug: 'luminaria-personalizada',
      category: 'Decoração',
      pricePix: 45.00,
      priceCard: 46.00,
      image: '/images/luminaria-personalizada.jpg',
      description: 'Luminária personalizada com LED. Vários modelos.',
      badge: 'Novidade',
      useCase: 'Ideal para decoração'
    },
    {
      id: 'miniatura-pokemon',
      name: 'Miniatura Pokémon',
      slug: 'miniatura-pokemon',
      category: 'Colecionáveis',
      pricePix: 38.00,
      priceCard: 39.00,
      image: '/images/miniatura-pokemon.jpg',
      description: 'Miniatura de Pokémon detalhada. Vários personagens.',
      useCase: 'Ideal para colecionadores'
    },
    {
      id: 'organizador-mesa',
      name: 'Organizador de Mesa',
      slug: 'organizador-mesa-completo',
      category: 'Organizadores',
      pricePix: 42.00,
      priceCard: 43.00,
      image: '/images/organizador-mesa.jpg',
      description: 'Organizador completo para mesa. Compartimentos para canetas, clips, etc.',
      useCase: 'Ideal para escritório'
    },
    {
      id: 'chaveiro-anime',
      name: 'Chaveiro Anime',
      slug: 'chaveiro-anime',
      category: 'Chaveiros',
      pricePix: 14.00,
      priceCard: 15.00,
      image: '/images/chaveiro-anime.jpg',
      description: 'Chaveiro com personagens de anime. Vários modelos.',
      useCase: 'Ideal para fãs de anime'
    },
    {
      id: 'brinde-personalizado',
      name: 'Brinde Personalizado para Evento',
      slug: 'brinde-personalizado-evento',
      category: 'Brindes',
      pricePix: 8.00,
      priceCard: 9.00,
      image: '/images/brinde-personalizado.jpg',
      description: 'Brinde personalizado para eventos. Descontos para grandes quantidades.',
      badge: 'Oferta',
      useCase: 'Ideal para eventos e brindes'
    }
  ];
  
  return featured;
}

export function getFeaturedProductBySlug(slug: string): FeaturedProduct | undefined {
  return getFeaturedProducts().find(p => p.slug === slug);
}