import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/catalog';
import { CATALOG_DIRECTORIES, getCatalogDirectoryCounts } from '@/lib/catalog-directories';

export function CatalogDirectories({ products }: { products: Product[] }) {
  const counts = getCatalogDirectoryCounts(products);
  return (
    <section className="mb-10" aria-labelledby="catalog-directories-title">
      <div className="experience-section-heading">
        <div><p className="section-kicker">Diretórios comerciais</p><h2 id="catalog-directories-title">Escolha sem perder tempo.</h2></div>
        <p>Cada entrada abre uma seleção real do catálogo.</p>
      </div>
      <div className="experience-collection-grid">
        {CATALOG_DIRECTORIES.map((directory) => (
          <Link href={directory.href} key={directory.id} className="experience-collection" data-catalog-directory={directory.id}>
            <p className="section-kicker">{directory.eyebrow}</p>
            <h3>{directory.title}</h3>
            <p>{directory.description}</p>
            <span>{counts[directory.id].toLocaleString('pt-BR')} produtos <ArrowUpRight size={16} aria-hidden="true" /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
