import { products } from '@/data/products.json';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  pricePix: number;
  priceCard: number;
  slug: string;
  tags: string[];
  inStock: boolean;
}

export function buildCatalogIndex(): CatalogItem[] {
  return products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || 'Geral',
    pricePix: p.pricePix,
    priceCard: p.priceCard,
    slug: `/produto/${p.slug}`,
    tags: p.tags || [],
    inStock: p.stock > 0
  }));
}

export function searchByCategory(category: string): CatalogItem[] {
  const index = buildCatalogIndex();
  return index.filter(item => 
    item.category.toLowerCase().includes(category.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
  );
}

export function getPriceRange(items: CatalogItem[]): { min: number; max: number } {
  if (items.length === 0) return { min: 0, max: 0 };
  const prices = items.map(i => i.pricePix);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}