import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectRequire } from '../scripts/catalog/ts-runtime.mjs';

const require = createProjectRequire();
const { publicCatalog, isPublicCatalogProduct } = require('@/lib/public-catalog');
const { toCatalogClientProducts } = require('@/lib/catalog-client-product');
const { getProductVisual } = require('@/lib/product-visuals');
const { getProductSearchScore } = require('@/lib/catalog-content');
const {
  EMPTY_CATALOG_FACETS,
  getCatalogGameIdentity,
  isCatalogChibiProduct,
  isCatalogGameProduct,
  isCatalogHomeProduct,
  isCatalogKeychainProduct,
  matchesCatalogFacets,
  matchesCatalogGroup,
  parseCatalogPrice,
  readCatalogFacets,
  getSafeCatalogBackHref,
} = require('@/lib/catalog-filters');
const { CATALOG_DIRECTORIES, getCatalogDirectoryCounts } = require('@/lib/catalog-directories');
const { isCompleteCatalogPayload } = require('@/lib/catalog-payload');
const clients = toCatalogClientProducts(publicCatalog);

test('preço ausente, vazio e inválido não vira zero; zero explícito é preservado', () => {
  for (const value of [null, undefined, '', ' ', 'NaN', 'Infinity', '-1']) assert.equal(parseCatalogPrice(value), undefined);
  assert.equal(parseCatalogPrice('0'), 0);
  assert.equal(parseCatalogPrice('39.90'), 39.9);
});

test('os 538 elegíveis mantêm IDs, procedência, preço, visual e pesquisa após compactação', () => {
  assert.equal(publicCatalog.length, 538);
  assert.deepEqual(clients.map((product) => product.id), publicCatalog.map((product) => product.id));
  clients.forEach((client, index) => {
    const product = publicCatalog[index];
    assert.ok(isPublicCatalogProduct(product), product.id);
    assert.deepEqual(client.mediaProvenance, product.mediaProvenance, product.id);
    assert.equal(client.pricingMode, product.pricingMode, product.id);
    assert.equal(client.pricePix, product.pricePix, product.id);
    assert.equal(getProductVisual(client).kind, getProductVisual(product).kind, product.id);
    assert.equal('baseCost' in client, false);
    for (const query of ['chaveiro', 'organizador', product.name]) assert.equal(getProductSearchScore(client, query), getProductSearchScore(product, query), `${product.id}: ${query}`);
  });
});

test('diretórios preservam as contagens do catálogo público autêntico', () => {
  assert.equal(publicCatalog.length, 538);
  assert.deepEqual(getCatalogDirectoryCounts(publicCatalog), {
    chibis: 4,
    games: 63,
    chaveiros: 18,
    casa: 235,
  });
});

test('cada diretório usa o mesmo filtro do link público', () => {
  for (const directory of CATALOG_DIRECTORIES) {
    const url = new URL(directory.href, 'https://mdh3d.com.br');
    const [field, value] = [...url.searchParams.entries()][0];
    const viaUrl = publicCatalog.filter((product) => {
      if (field === 'style' || field === 'type' || field === 'useCase') {
        return matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, [field]: value });
      }
      return matchesCatalogGroup(product, value, field);
    });
    assert.equal(viaUrl.length, publicCatalog.filter(directory.matches).length, directory.id);
  }
});

test('Games não usa categoria ampla e reconhece somente classificação ou universo real', () => {
  const base = { name: 'Produto genérico', theme: '', subcategory: '', collection: '', tags: [] };
  assert.equal(isCatalogGameProduct({ ...base, category: 'Games' }), false);
  assert.equal(isCatalogGameProduct({ ...base, subcategory: 'games' }), true);
  assert.equal(isCatalogGameProduct({ ...base, collection: 'Games' }), true);
  assert.equal(isCatalogGameProduct({ ...base, name: 'Jett Valorant' }), true);
});

test('universo e personagem só aparecem quando constam nos dados do produto', () => {
  assert.deepEqual(getCatalogGameIdentity({ name: 'Chaveiro Jett Valorant', theme: '', subcategory: '', collection: '', tags: [] }), {
    universe: 'valorant', characters: ['jett'],
  });
  assert.deepEqual(getCatalogGameIdentity({ name: 'Personagem desconhecido', theme: '', subcategory: 'games', collection: 'Games', tags: [] }), {
    universe: '', characters: [],
  });
});

test('Chibis, Chaveiros e Casa usam critérios estritos', () => {
  assert.equal(isCatalogChibiProduct({ name: 'Miniatura Chibi' }), true);
  assert.equal(isCatalogChibiProduct({ name: 'Miniatura comum', category: 'Chibis' }), false);
  assert.equal(isCatalogKeychainProduct({ name: 'Chaveiro personalizado' }), true);
  assert.equal(isCatalogKeychainProduct({ name: 'Suporte', objectType: 'chaveiro' }), false);
  assert.equal(isCatalogKeychainProduct({ name: 'Suporte para chaveiro' }), false);
  assert.equal(isCatalogHomeProduct({ name: 'Organizador', primaryCategory: 'Casa e Organização' }), true);
  assert.equal(isCatalogHomeProduct({ name: 'Organizador', category: 'Decoração' }), false);
});

test('objectType filtra pelo tipo taxonômico exato', () => {
  assert.equal(matchesCatalogFacets({ name: 'Suporte', objectType: 'porta_objeto', theme: '', subcategory: '', collection: '', tags: [] }, { ...EMPTY_CATALOG_FACETS, objectType: 'porta-objeto' }), true);
  assert.equal(matchesCatalogFacets({ name: 'Suporte', objectType: 'suporte', theme: '', subcategory: '', collection: '', tags: [] }, { ...EMPTY_CATALOG_FACETS, objectType: 'porta-objeto' }), false);
});

test('payload progressivo rejeita resposta incompleta, duplicada e malformada', () => {
  assert.equal(isCompleteCatalogPayload({ items: clients, total: 538 }, 538), true);
  for (const payload of [null, {}, { items: clients.slice(0, 36), total: 36 }, { items: [...clients.slice(1), clients[1]], total: 538 }, { items: [{ ...clients[0], images: ['/placeholder.png'] }, ...clients.slice(1)], total: 538 }, { items: [{ ...clients[0], pricePix: null }, ...clients.slice(1)], total: 538 }]) {
    assert.equal(isCompleteCatalogPayload(payload, 538), false);
  }
});

test('retorno aceita apenas catálogo ou busca e preserva filtros e página', () => {
  const from = '/busca?q=chaveiro&type=keychain&page=2';
  assert.equal(getSafeCatalogBackHref(from, 'mdh-016'), `${from}#produto-mdh-016`);
  assert.equal(getSafeCatalogBackHref('/catalogo?universe=valorant'), '/catalogo?universe=valorant');
  for (const invalid of ['//evil.test', '/catalogo-evil', '/catalogo/slug', 'https://evil.test', '/busca\\evil', '/auth']) assert.equal(getSafeCatalogBackHref(invalid), '/catalogo');
});
