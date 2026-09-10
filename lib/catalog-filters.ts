import type { Product } from '@/lib/catalog';

export type CatalogFacets = { type: string; style: string; universe: string; character: string; useCase: string };
export const EMPTY_CATALOG_FACETS: CatalogFacets = { type: '', style: '', universe: '', character: '', useCase: '' };

export function normalizeCatalogFilter(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseCatalogPrice(value: string | null | undefined) {
  if (!value?.trim()) return undefined;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

export function readCatalogFacets(params: URLSearchParams): CatalogFacets {
  return Object.fromEntries(Object.keys(EMPTY_CATALOG_FACETS).map((key) => [key, normalizeCatalogFilter(params.get(key) || '')])) as CatalogFacets;
}

const GAME_IDENTITIES = [
  { universe: 'valorant', pattern: /\bvalorant\b/i, characters: ['Jett', 'Reyna', 'Omen', 'Sage', 'Killjoy'] },
  { universe: 'league-of-legends', pattern: /\bleague of legends\b/i, characters: ['Ahri', 'Jinx', 'Yasuo', 'Lux', 'Garen'] },
  { universe: 'super-mario', pattern: /\b(?:super mario|mario|luigi)\b/i, characters: ['Mario', 'Luigi', 'Yoshi', 'Peach', 'Bowser'] },
  { universe: 'pokemon', pattern: /\b(?:pokemon|pikachu)\b/i, characters: ['Pikachu', 'Eevee', 'Charmander', 'Bulbasaur', 'Squirtle'] },
  { universe: 'sonic', pattern: /\bsonic\b/i, characters: ['Sonic', 'Tails', 'Knuckles'] },
  { universe: 'the-legend-of-zelda', pattern: /\b(?:zelda|hyrule)\b/i, characters: ['Zelda', 'Link'] },
] as const;

export function getCatalogGameIdentity(product: Product) {
  const text = [product.name, product.theme, product.subcategory].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const game = GAME_IDENTITIES.find((entry) => entry.pattern.test(text));
  return {
    universe: game?.universe || '',
    characters: game ? game.characters.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(product.name)).map(normalizeCatalogFilter) : [],
  };
}

export function matchesCatalogFacets(product: Product, facets: CatalogFacets) {
  const identity = getCatalogGameIdentity(product);
  const keychain = /^chaveiro\b/i.test(product.name);
  const chibi = /\bchibi\b/i.test(product.name);
  const home = product.primaryCategory === 'Casa e Organização' || product.category === 'Casa e Organização';
  return (!facets.type || (facets.type === 'keychain' && keychain)) &&
    (!facets.style || (facets.style === 'chibi' && chibi)) &&
    (!facets.universe || facets.universe === identity.universe) &&
    (!facets.character || identity.characters.includes(facets.character)) &&
    (!facets.useCase || (facets.useCase === 'home' && home));
}

export function matchesCatalogGroup(product: Product, value: string, field: 'category' | 'collection') {
  const normalized = normalizeCatalogFilter(value);
  if (!normalized || normalized === 'todas') return true;
  if (normalized === 'chaveiros' || normalized === 'keychains') return matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, type: 'keychain' });
  if (normalized === 'chibis' || normalized === 'chibi') return matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, style: 'chibi' });
  if (normalized === 'games') return Boolean(getCatalogGameIdentity(product).universe);
  if (['casa', 'organizacao', 'casa-organizacao'].includes(normalized)) return matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, useCase: 'home' });
  return normalizeCatalogFilter(product[field]) === normalized;
}

export function getSafeCatalogBackHref(from?: string | null, focus?: string | null) {
  if (!from || !/^\/(catalogo|busca)(?:\?|$)/.test(from) || from.includes('\\')) return '/catalogo';
  const url = new URL(from, 'https://catalog.invalid');
  if (focus) url.hash = `produto-${encodeURIComponent(focus)}`;
  return `${url.pathname}${url.search}${url.hash}`;
}
