import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { listStorefrontProducts } from "@/lib/catalog-server";
import {
  getAbsoluteUrl,
  getBreadcrumbStructuredData,
  getCatalogStructuredData,
  getSiteUrl
} from "@/lib/seo";
import {
  categoryLandingEntries,
  categorySeoContent,
  getCategoryBySlug
} from "@/lib/seo-content";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return categoryLandingEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  const seoContent = categorySeoContent[category];
  const canonical = `${getSiteUrl()}/categorias/${slug}`;

  return {
    title: `${category} em impressao 3D | MDH 3D`,
    description: seoContent.description,
    alternates: {
      canonical
    },
    openGraph: {
      title: `${category} em impressao 3D`,
      description: seoContent.description,
      url: canonical,
      images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: `${category} MDH 3D` }]
    },
    keywords: seoContent.faqs,
    twitter: {
      card: "summary_large_image",
      title: `${category} em impressao 3D`,
      description: seoContent.description,
      images: [getAbsoluteUrl("/logo-mdh.jpg")]
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [products] = await Promise.all([listStorefrontProducts()]);
  const categoryProducts = products.filter((product) => product.category === category);
  const seoContent = categorySeoContent[category];
  const canonicalUrl = `${getSiteUrl()}/categorias/${slug}`;
  const catalogLd = getCatalogStructuredData({
    title: seoContent.title,
    description: seoContent.description,
    canonicalUrl,
    products: categoryProducts
  });
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Catalogo", item: `${getSiteUrl()}/catalogo` },
    { name: category, item: canonicalUrl }
  ]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <AnalyticsPageEvent
        eventName="view_category"
        payload={{
          category,
          query: "",
          totalProducts: categoryProducts.length
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Categoria MDH 3D</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">{seoContent.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">{seoContent.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/catalogo" className="premium-btn premium-btn-secondary">
            Ver catalogo completo
          </Link>
          <Link href="/guias" className="premium-btn premium-btn-ghost">
            Ler guias da marca
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Descricao rica da categoria</p>
          <div className="mt-4 grid gap-4">
            {seoContent.body.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-white/70">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <aside className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Buscas relacionadas</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {seoContent.faqs.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-white/60">
            Esta pagina existe para dar mais contexto ao cliente e ao Google sobre a categoria, sem virar uma listagem
            vazia de filtros.
          </p>
        </aside>
      </div>

      <div className="mt-10">
        <CatalogExplorer products={categoryProducts} initialCategory={category} />
      </div>
    </section>
  );
}
