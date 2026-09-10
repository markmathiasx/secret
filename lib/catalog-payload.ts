import type { Product } from '@/lib/catalog';

export function isCompleteCatalogPayload(payload: unknown, expectedTotal: number): payload is { total: number; items: Product[] } {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as { total?: unknown; items?: unknown };
  if (candidate.total !== expectedTotal || !Array.isArray(candidate.items) || candidate.items.length !== expectedTotal) return false;
  const ids = new Set<string>();
  return candidate.items.every((item: Product) => {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id)) return false;
    ids.add(item.id);
    return ['name', 'sku', 'category', 'subcategory', 'theme', 'collection', 'description', 'material', 'finish', 'productionWindow'].every((key) => typeof item[key as keyof Product] === 'string') &&
      Number.isFinite(item.pricePix) && item.pricePix >= 0 && Number.isFinite(item.priceCard) &&
      ['images', 'tags', 'colors'].every((key) => Array.isArray(item[key as keyof Product]) && (item[key as 'images'] as unknown[]).every((value) => typeof value === 'string')) &&
      item.images.length > 0 && !item.images.some((url) => /placeholder/i.test(url));
  });
}
