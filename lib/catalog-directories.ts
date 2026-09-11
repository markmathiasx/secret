import type { Product } from '@/lib/catalog';
import { isCatalogChibiProduct, isCatalogGameProduct, isCatalogHomeProduct, isCatalogKeychainProduct } from '@/lib/catalog-filters';

export type CatalogDirectory = {
  id: 'chibis' | 'games' | 'chaveiros' | 'casa';
  title: string;
  description: string;
  href: string;
  eyebrow: string;
  matches: (product: Product) => boolean;
};

export const CATALOG_DIRECTORIES: readonly CatalogDirectory[] = [
  { id: 'chibis', title: 'Chibis', eyebrow: 'Colecionáveis', description: 'Personagens compactos que já existem no catálogo.', href: '/catalogo?style=chibi', matches: isCatalogChibiProduct },
  { id: 'games', title: 'Games', eyebrow: 'Universos e personagens', description: 'Peças classificadas como games, sem misturar outros temas.', href: '/catalogo?collection=Games', matches: isCatalogGameProduct },
  { id: 'chaveiros', title: 'Chaveiros', eyebrow: 'Só chaveiros', description: 'Modelos para levar, presentear ou personalizar.', href: '/catalogo?type=keychain', matches: isCatalogKeychainProduct },
  { id: 'casa', title: 'Casa & organização', eyebrow: 'Uso no dia a dia', description: 'Organizadores e utilidades classificados para casa.', href: '/catalogo?useCase=home', matches: isCatalogHomeProduct },
] as const;

export function getCatalogDirectoryCounts(products: Product[]) {
  return Object.fromEntries(CATALOG_DIRECTORIES.map((directory) => [directory.id, products.filter(directory.matches).length])) as Record<CatalogDirectory['id'], number>;
}

export function getCatalogDirectoryLinks() {
  return CATALOG_DIRECTORIES.map(({ id, title: label, href }) => ({ id, label, href }));
}
