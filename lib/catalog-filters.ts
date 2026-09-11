import type { Product } from '@/lib/catalog';
import type { ProductObjectType } from '@/lib/catalog-taxonomy';

export type CatalogFacets = {
  type: string;
  style: string;
  universe: string;
  character: string;
  useCase: string;
  objectType: string;
};

export const EMPTY_CATALOG_FACETS: CatalogFacets = {
  type: '', style: '', universe: '', character: '', useCase: '', objectType: '',
};

export const CATALOG_UNIVERSE_LABELS: Record<string, string> = {
  valorant: 'Valorant',
  'league-of-legends': 'League of Legends',
  'super-mario': 'Super Mario',
  pokemon: 'Pokémon',
  sonic: 'Sonic',
  'the-legend-of-zelda': 'The Legend of Zelda',
};

export const CATALOG_OBJECT_TYPE_LABELS: Partial<Record<ProductObjectType, string>> = {
  chaveiro: 'Chaveiro', miniatura: 'Miniatura', suporte: 'Suporte',
  organizador: 'Organizador', porta_objeto: 'Porta-objeto', decoração: 'Decoração',
  placa: 'Placa', boneco: 'Boneco', medalha: 'Medalha', caixa: 'Caixa',
  case: 'Case', brinde: 'Brinde', peça_tecnica: 'Peça técnica', lote: 'Lote',
  acessório: 'Acessório', outro: 'Outro',
};

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
  { universe: 'league-of-legends', pattern: /\b(?:league of legends|lol)\b/i, characters: ['Ahri', 'Jinx', 'Yasuo', 'Lux', 'Garen'] },
  { universe: 'super-mario', pattern: /\b(?:super mario|mario|luigi)\b/i, characters: ['Mario', 'Luigi', 'Yoshi', 'Peach', 'Bowser'] },
  { universe: 'pokemon', pattern: /\b(?:pokemon|pikachu)\b/i, characters: ['Pikachu', 'Eevee', 'Charmander', 'Bulbasaur', 'Squirtle'] },
  { universe: 'sonic', pattern: /\bsonic\b/i, characters: ['Sonic', 'Tails', 'Knuckles'] },
  { universe: 'the-legend-of-zelda', pattern: /\b(?:the legend of zelda|zelda|hyrule)\b/i, characters: ['Zelda', 'Link'] },
] as const;

function productClassificationText(product: Product) {
  return [product.name, product.theme, product.subcategory, product.collection, ...(product.tags || [])]
    .join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getCatalogGameIdentity(product: Product) {
  const text = productClassificationText(product);
  const game = GAME_IDENTITIES.find((entry) => entry.pattern.test(text));
  return {
    universe: game?.universe || '',
    characters: game
      ? game.characters.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(text)).map(normalizeCatalogFilter)
      : [],
  };
}

export function isCatalogGameProduct(product: Product) {
  const subcategory = normalizeCatalogFilter(product.subcategory || '');
  const collection = normalizeCatalogFilter(product.collection || '');
  return Boolean(getCatalogGameIdentity(product).universe) || subcategory === 'games' || collection === 'games';
}

export function isCatalogKeychainProduct(product: Product) {
  return /^chaveiro\b/i.test(product.name.trim());
}

export function isCatalogChibiProduct(product: Product) {
  return /\bchibi\b/i.test(product.name);
}

export function isCatalogHomeProduct(product: Product) {
  return product.primaryCategory === 'Casa e Organização' || product.category === 'Casa e Organização';
}

export function matchesCatalogFacets(product: Product, facets: CatalogFacets) {
  const identity = getCatalogGameIdentity(product);
  return (!facets.type || (facets.type === 'keychain' && isCatalogKeychainProduct(product))) &&
    (!facets.style || (facets.style === 'chibi' && isCatalogChibiProduct(product))) &&
    (!facets.universe || facets.universe === identity.universe) &&
    (!facets.character || identity.characters.includes(facets.character)) &&
    (!facets.useCase || (facets.useCase === 'home' && isCatalogHomeProduct(product))) &&
    (!facets.objectType || normalizeCatalogFilter(product.objectType || '') === facets.objectType);
}

export function matchesCatalogGroup(product: Product, value: string, field: 'category' | 'collection') {
  const normalized = normalizeCatalogFilter(value);
  if (!normalized || normalized === 'todas') return true;
  if (normalized === 'chaveiros' || normalized === 'keychains') return isCatalogKeychainProduct(product);
  if (normalized === 'chibis' || normalized === 'chibi') return isCatalogChibiProduct(product);
  if (normalized === 'games') return isCatalogGameProduct(product);
  if (['casa', 'organizacao', 'casa-organizacao'].includes(normalized)) return isCatalogHomeProduct(product);
  return normalizeCatalogFilter(product[field]) === normalized;
}

export function getSafeCatalogBackHref(from?: string | null, focus?: string | null) {
  if (!from || !/^\/(catalogo|busca)(?:\?|$)/.test(from) || from.includes('\\')) return '/catalogo';
  const url = new URL(from, 'https://catalog.invalid');
  if (focus) url.hash = `produto-${encodeURIComponent(focus)}`;
  return `${url.pathname}${url.search}${url.hash}`;
}
