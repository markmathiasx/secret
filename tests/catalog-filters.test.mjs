import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectRequire } from '../scripts/catalog/ts-runtime.mjs';

const require = createProjectRequire();
const { publicCatalog, isPublicCatalogProduct } = require('@/lib/public-catalog');
const { toCatalogClientProducts } = require('@/lib/catalog-client-product');
const { getProductVisual } = require('@/lib/product-visuals');
const { getProductSearchScore } = require('@/lib/catalog-content');
const { EMPTY_CATALOG_FACETS, parseCatalogPrice, readCatalogFacets, matchesCatalogFacets, matchesCatalogGroup, getCatalogGameIdentity, getSafeCatalogBackHref } = require('@/lib/catalog-filters');
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

test('links Chaveiros e Chibis são interseções estritas; Casa não mistura setup', () => {
  const keychains = publicCatalog.filter((product) => matchesCatalogFacets(product, readCatalogFacets(new URLSearchParams('type=keychain'))));
  assert.ok(keychains.length > 0);
  assert.ok(keychains.every((product) => /^chaveiro\b/i.test(product.name)));
  assert.ok(publicCatalog.filter((product) => matchesCatalogGroup(product, 'Chaveiros', 'collection')).every((product) => keychains.includes(product)));
  assert.equal(matchesCatalogGroup({ ...publicCatalog[0], name: 'Porta-chaves de Parede', objectType: 'suporte' }, 'Chaveiros', 'collection'), false);
  const chibis = publicCatalog.filter((product) => matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, style: 'chibi' }));
  assert.ok(chibis.length > 0);
  assert.ok(chibis.every((product) => /\bchibi\b/i.test(product.name)));
  const home = publicCatalog.filter((product) => matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, useCase: 'home' }));
  assert.ok(home.length > 0);
  assert.ok(home.every((product) => product.category === 'Casa e Organização'));
});

test('Games não inventa universos ou personagens para mascotes genéricos', () => {
  for (const universe of ['valorant', 'league-of-legends']) {
    assert.equal(publicCatalog.filter((product) => matchesCatalogFacets(product, { ...EMPTY_CATALOG_FACETS, universe })).length, 0);
  }
  const generic = { ...publicCatalog[0], name: 'Mascote Veloz Chibi', theme: 'Gamer', subcategory: 'Geek' };
  assert.equal(getCatalogGameIdentity(generic).universe, '');
  assert.equal(matchesCatalogGroup(generic, 'Games', 'collection'), false);
  const explicit = { ...generic, name: 'Jett Valorant Chibi' };
  assert.deepEqual(getCatalogGameIdentity(explicit), { universe: 'valorant', characters: ['jett'] });
  assert.equal(matchesCatalogFacets(explicit, { ...EMPTY_CATALOG_FACETS, universe: 'league-of-legends' }), false);
  assert.equal(matchesCatalogFacets(explicit, { ...EMPTY_CATALOG_FACETS, universe: 'valorant', character: 'jett' }), true);
  assert.equal(matchesCatalogGroup(generic, 'Coleção inexistente', 'collection'), false);
  assert.equal(matchesCatalogFacets(generic, { ...EMPTY_CATALOG_FACETS, type: 'invalid' }), false);
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
