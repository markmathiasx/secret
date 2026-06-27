import productsData from '@/data/products.json';

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  collection?: string;
  pricePix: number;
  priceCard: number;
  slug: string;
  tags: string[];
  inStock: boolean;
  image?: string;
  description?: string;
}

export function buildCatalogIndex(): CatalogItem[] {
  const arr = Array.isArray(productsData) ? productsData : (productsData as any).products || [];
  
  return arr.map((p: any) => ({
    id: p.id || p.slug || String(Math.random()),
    name: p.name || p.title || 'Produto',
    category: p.category || 'Geral',
    collection: p.collection,
    pricePix: parseFloat(p.pricePix || p.price || 0),
    priceCard: parseFloat(p.priceCard || (p.pricePix ? p.pricePix + 1 : 0)),
    slug: p.slug || p.id || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    inStock: (p.stock || 0) > 0 || p.stock === undefined,
    image: p.image || p.imageUrl,
    description: p.description || p.shortDescription
  }));
}

export function searchByKeyword(keyword: string): CatalogItem[] {
  const index = buildCatalogIndex();
  const lower = keyword.toLowerCase();
  
  return index.filter(item =>
    item.name.toLowerCase().includes(lower) ||
    item.category.toLowerCase().includes(lower) ||
    item.tags.some(t => t.toLowerCase().includes(lower)) ||
    (item.description || '').toLowerCase().includes(lower)
  );
}

export function searchByCategory(category: string): CatalogItem[] {
  const index = buildCatalogIndex();
  const lower = category.toLowerCase();
  
  return index.filter(item =>
    item.category.toLowerCase().includes(lower) ||
    item.tags.some(t => t.toLowerCase().includes(lower))
  );
}

export function getCheapest(items: CatalogItem[], limit = 6): CatalogItem[] {
  return [...items].sort((a, b) => a.pricePix - b.pricePix).slice(0, limit);
}

export function getMostExpensive(items: CatalogItem[], limit = 6): CatalogItem[] {
  return [...items].sort((a, b) => b.pricePix - a.pricePix).slice(0, limit);
}

export function getPriceRange(items: CatalogItem[]): { min: number; max: number } {
  if (items.length === 0) return { min: 0, max: 0 };
  const prices = items.map(i => i.pricePix);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getProductLink(slug: string): string {
  return `https://www.mdh3d.com.br/produto/${slug}`;
}

export function getWhatsAppLink(message: string): string {
  return `https://wa.me/5521974137662?text=${encodeURIComponent(message)}`;
}