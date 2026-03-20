import Link from "next/link";
import { CatalogGrid } from "@/components/catalog-grid";
import { catalog, getProductUrl, type Product } from "@/lib/catalog";
import { isProductVisualVerified } from "@/lib/product-visuals";

function scoreRelatedProduct(base: Product, candidate: Product) {
  let score = 0;

  if (candidate.category === base.category) score += 5;
  if (candidate.subcategory === base.subcategory) score += 3;
  if (candidate.theme === base.theme) score += 2;
  if (candidate.collection === base.collection) score += 1;
  if (isProductVisualVerified(candidate)) score += 2;
  if (candidate.featured) score += 1;

  return score;
}

export function ProductRelatedShelf({ product }: { product: Product }) {
  const related = catalog
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({ candidate, score: scoreRelatedProduct(product, candidate) }))
    .sort((a, b) => b.score - a.score || a.candidate.pricePix - b.candidate.pricePix)
    .slice(0, 4)
    .map((entry) => entry.candidate);

  if (!related.length) return null;

  return (
    <section className="mt-14">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Venda complementar</p>
          <h2 className="mt-3 text-3xl font-black text-white">Quem olha este item costuma comparar com estas opções.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            Use essa prateleira para aumentar ticket, sugerir uma peça parecida ou oferecer uma alternativa mais visual, mais funcional ou mais presenteável.
          </p>
        </div>
        <Link href={getProductUrl(product)} className="btn-secondary">
          Você está vendo: {product.name}
        </Link>
      </div>

      <CatalogGrid products={related} />
    </section>
  );
}
