import type { Metadata } from "next";
import { AnalyticsPageEvent } from "@/components/analytics-page-event";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { categories, collections } from "@/lib/catalog";
import { getCatalogStats, listStorefrontProducts } from "@/lib/catalog-server";
import { getAbsoluteUrl, getCatalogStructuredData, getSiteUrl } from "@/lib/seo";

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

  if (params.q) canonicalParams.set("q", params.q);
  if (params.category) canonicalParams.set("category", params.category);

  const canonicalUrl = canonicalParams.toString() ? `${getSiteUrl()}/catalogo?${canonicalParams.toString()}` : `${getSiteUrl()}/catalogo`;
  const title = params.category ? `${params.category} em impressão 3D` : "Catálogo de impressões 3D";
  const description = params.category
    ? `Explore a selecao da MDH 3D para ${params.category.toLowerCase()}, com Pix, prazos claros e atendimento rapido.`
    : "Explore a curadoria da MDH 3D com quick view, filtros, Pix e atendimento rapido para presentes, setup, decoracao e personalizados.";
  const catalogLd = getCatalogStructuredData({
    title,
    description,
    canonicalUrl,
    products
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <AnalyticsPageEvent
        eventName="view_category"
        payload={{
          category: params.category || "all",
          query: params.q || "",
          totalProducts: products.length
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogLd) }} />
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Curadoria da loja</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
              Menos volume, mais intencao de compra: uma selecao feita para parecer loja curada, nao dump de catalogo.
            </h1>
            <p className="mt-4 text-lg leading-8 text-white/68">
              Use a busca, refine por colecao ou categoria e compare rapidamente os itens com mais apelo para presente, setup, decoracao e sob encomenda.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Produtos ativos", value: String(stats.totalProducts).padStart(4, "0") },
              { label: "Categorias", value: String(stats.totalCategories).padStart(2, "0") },
              { label: "Coleções", value: String(stats.totalCollections).padStart(2, "0") }
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(params.q ? [`Busca: ${params.q}`] : []).map((item) => (
          <span key={item} className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100/80">
            {item}
          </span>
        ))}
        {categories.slice(0, 6).map((category) => (
          <span key={category} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/62">
            {category}
          </span>
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
    </section>
  );
}

export async function generateMetadata({ searchParams }: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const siteUrl = getSiteUrl();
  const title = params.category ? `${params.category} em impressão 3D` : "Catálogo de impressões 3D";
  const description = params.category
    ? `Explore a selecao da MDH 3D para ${params.category.toLowerCase()}, com Pix, prazos claros e atendimento rapido.`
    : "Explore a curadoria da MDH 3D com quick view, filtros, Pix e atendimento rapido para presentes, setup, decoracao e personalizados.";
  const canonicalParams = new URLSearchParams();

  if (params.q) canonicalParams.set("q", params.q);
  if (params.category) canonicalParams.set("category", params.category);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalParams.toString() ? `${siteUrl}/catalogo?${canonicalParams.toString()}` : `${siteUrl}/catalogo`
    },
    openGraph: {
      title,
      description,
      url: canonicalParams.toString() ? `${siteUrl}/catalogo?${canonicalParams.toString()}` : `${siteUrl}/catalogo`,
      images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D catálogo" }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getAbsoluteUrl("/logo-mdh.jpg")]
    }
  };
}
