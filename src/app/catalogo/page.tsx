import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { categories, collections } from "@/lib/catalog";
import { getCatalogStats, listStorefrontProducts } from "@/lib/catalog-server";
import { getAbsoluteUrl, getBreadcrumbStructuredData, getCatalogStructuredData, getSiteUrl } from "@/lib/seo";
import { categorySeoContent, getCategorySlug } from "@/lib/seo-content";

type CatalogPageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const [products, stats] = await Promise.all([listStorefrontProducts(), getCatalogStats()]);
  const canonicalParams = new URLSearchParams();
  const categorySlug = params.category ? getCategorySlug(params.category) : null;

  if (params.q) canonicalParams.set("q", params.q);
  if (params.category) canonicalParams.set("category", params.category);

  const canonicalUrl =
    params.q || !categorySlug
      ? canonicalParams.toString()
        ? `${getSiteUrl()}/catalogo?${canonicalParams.toString()}`
        : `${getSiteUrl()}/catalogo`
      : `${getSiteUrl()}/categorias/${categorySlug}`;
  const title = params.category ? `${params.category} em impressão 3D` : "Catalogo curado de impressões 3D";
  const description = params.category
    ? `Explore a selecao da MDH 3D para ${params.category.toLowerCase()}, com Pix, prazos claros e atendimento rapido.`
    : "Explore a curadoria da MDH 3D com quick view, filtros, Pix e atendimento rapido para presentes, setup, decoracao e personalizados.";
  const seoContent = params.category ? categorySeoContent[params.category] : null;
  const catalogLd = getCatalogStructuredData({
    title,
    description,
    canonicalUrl,
    products
  });
  const breadcrumbLd = getBreadcrumbStructuredData(
    params.category
      ? [
          { name: "Inicio", item: getSiteUrl() },
          { name: "Catalogo", item: `${getSiteUrl()}/catalogo` },
          { name: params.category, item: canonicalUrl }
        ]
      : [
          { name: "Inicio", item: getSiteUrl() },
          { name: "Catalogo", item: canonicalUrl }
        ]
  );

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
<<<<<<< ours
      <AnalyticsPageEvent
        eventName="view_category"
        payload={{
          category: params.category || "all",
          query: params.q || "",
          totalProducts: products.length
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Catalogo MDH 3D</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Pecas escolhidas para presentear melhor, valorizar o ambiente e tornar a compra mais segura.
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/68">
              Use a busca, refine por categoria ou colecao e compare rapidamente as pecas com mais apelo para presente, decoracao, organizacao e personalizados.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Pecas na vitrine", value: String(stats.totalProducts).padStart(2, "0") },
              { label: "Categorias", value: String(stats.totalCategories).padStart(2, "0") },
              { label: "Colecoes", value: String(stats.totalCollections).padStart(2, "0") }
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
=======
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Catálogo MDH 3D</p>
        <h1 className="mt-3 text-4xl font-black text-white">Peças premium para setup, decoração e organização</h1>
        <p className="mt-4 text-lg leading-8 text-white/68">
          Explore coleções com produção local, personalização sob medida e entrega no Rio de Janeiro.
        </p>
>>>>>>> theirs
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(params.q ? [`Busca: ${params.q}`] : []).map((item) => (
          <span key={item} className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100/80">
            {item}
          </span>
        ))}
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category}
            href={getCategorySlug(category) ? `/categorias/${getCategorySlug(category)}` : `/catalogo?category=${encodeURIComponent(category)}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/62 transition hover:border-cyan-300/35 hover:bg-white/8 hover:text-white"
          >
            {category}
          </Link>
        ))}
        {collections.slice(0, 4).map((collection) => (
          <span key={collection} className="rounded-full border border-cyan-400/18 bg-cyan-400/8 px-3 py-1 text-sm text-cyan-100/78">
            {collection}
          </span>
        ))}
      </div>

      <div className="mt-10">
        <CatalogExplorer
          products={products}
          initialQuery={params.q || ""}
          initialCategory={params.category || ""}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">
            {seoContent ? seoContent.title : "Impressao 3D para presentes, setup e decoracao"}
          </p>
          <h2 className="mt-3 text-3xl font-black text-white">
            {seoContent ? seoContent.description : "Um catalogo pensado para facilitar a escolha de quem procura pecas 3D com estilo, utilidade e acabamento premium."}
          </h2>
          <div className="mt-4 grid gap-4">
            {(seoContent?.body || [
              "A MDH 3D organiza a vitrine por coleções com apelo real de compra: presentes criativos, decoração geek, setup, casa e peças sob medida.",
              "Assim fica mais simples encontrar a peça certa para presentear, decorar ou personalizar sem se perder em uma lista genérica de produtos."
            ]).map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-white/68">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <aside className="section-shell rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Comprar com mais confianca</p>
          <div className="mt-4 grid gap-3">
            {(seoContent
              ? [
                  "Selecao alinhada ao estilo de quem vai receber ou usar a peca.",
                  "Prazo e personalizacao visiveis para decidir sem adivinhacao.",
                  "Pix com melhor valor e atendimento rapido quando voce quiser apoio."
                ]
              : [
                  "Presentes criativos, decoracao geek e organizacao com mais valor percebido.",
                  "Pecas para casa, setup e negocios com compra simples e acabamento premium.",
                  "Atendimento rapido para personalizar cor, nome, logo ou acabamento."
                ]).map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/68">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/guias" className="premium-btn premium-btn-secondary">
              Ver guias de compra
            </Link>
            <Link href="/faq" className="premium-btn premium-btn-ghost">
              Tirar duvidas
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = getSiteUrl();
  const title = params.category ? `${params.category} em impressão 3D` : "Catálogo de impressões 3D";
  const seoContent = params.category ? categorySeoContent[params.category] : null;
  const categorySlug = params.category ? getCategorySlug(params.category) : null;
  const description = params.category
    ? seoContent?.description || `Explore a selecao da MDH 3D para ${params.category.toLowerCase()}, com Pix, prazos claros e atendimento rapido.`
    : "Explore a curadoria da MDH 3D com quick view, filtros, Pix e atendimento rapido para presentes, setup, decoracao e personalizados.";
  const canonicalParams = new URLSearchParams();

  if (params.q) canonicalParams.set("q", params.q);
  if (params.category) canonicalParams.set("category", params.category);

  return {
    title,
    description,
    alternates: {
      canonical:
        params.q || !categorySlug
          ? canonicalParams.toString()
            ? `${siteUrl}/catalogo?${canonicalParams.toString()}`
            : `${siteUrl}/catalogo`
          : `${siteUrl}/categorias/${categorySlug}`
    },
    openGraph: {
      title,
      description,
      url:
        params.q || !categorySlug
          ? canonicalParams.toString()
            ? `${siteUrl}/catalogo?${canonicalParams.toString()}`
            : `${siteUrl}/catalogo`
          : `${siteUrl}/categorias/${categorySlug}`,
      images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D catálogo" }]
    },
    keywords: seoContent?.faqs || ["impressao 3d", "catalogo 3d", "decoracao 3d", "presentes 3d"],
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getAbsoluteUrl("/logo-mdh.jpg")]
    }
  };
}
