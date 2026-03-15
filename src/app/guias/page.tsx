import type { Metadata } from "next";
import Link from "next/link";
import { getGuideBySlug, guideEntries } from "@/lib/seo-content";
import { getAbsoluteUrl, getBreadcrumbStructuredData, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Guias de impressao 3D, presentes e personalizados",
  description:
    "Conteudo editorial da MDH 3D sobre presentes em impressao 3D, organizacao de setup, decoracao e pecas personalizadas.",
  alternates: {
    canonical: `${getSiteUrl()}/guias`
  },
  openGraph: {
    title: "Guias MDH 3D",
    description:
      "Aprenda como escolher presentes, decoracao, organizadores e pecas personalizadas em impressao 3D.",
    url: `${getSiteUrl()}/guias`,
    images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "Guias MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Guias MDH 3D",
    description:
      "Conteudo editorial da MDH 3D para quem busca impressao 3D com mais contexto, inspiracao e clareza.",
    images: [getAbsoluteUrl("/logo-mdh.jpg")]
  }
};

export default function GuidesPage() {
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Guias", item: `${getSiteUrl()}/guias` }
  ]);
  const guidesLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${getSiteUrl()}/guias#collection`,
    url: `${getSiteUrl()}/guias`,
    name: "Guias MDH 3D",
    description:
      "Conteudo editorial da MDH 3D sobre presentes em impressao 3D, setup, decoracao e personalizados.",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guideEntries.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${getSiteUrl()}/guias/${guide.slug}`,
        name: guide.title
      }))
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guidesLd) }} />

      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Guias MDH 3D</p>
      <h1 className="mt-3 text-4xl font-black text-white">Conteudo para quem quer comprar impressao 3D com mais criterio</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
        Reunimos guias curtos e objetivos sobre presentes, organizadores, decoracao e pecas sob medida para ajudar o
        cliente a escolher melhor e tambem ampliar a presenca organica da loja no Google.
      </p>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {guideEntries.map((guide) => (
          <article key={guide.slug} className="section-shell rounded-[32px] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Guia editorial</p>
            <h2 className="mt-3 text-2xl font-black text-white">{guide.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/66">{guide.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/guias/${guide.slug}`} className="premium-btn premium-btn-primary">
                Ler guia completo
              </Link>
              <Link href={guide.relatedHref} className="premium-btn premium-btn-secondary">
                {guide.relatedLabel}
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 section-shell rounded-[32px] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Proximo passo</p>
        <p className="mt-3 text-sm leading-7 text-white/66">
          Esta area ja deixa a loja pronta para crescer conteudo organico com novas paginas editoriais. Para cada novo
          guia, basta adicionar uma entrada em <code className="rounded bg-black/30 px-2 py-1 text-white">src/lib/seo-content.ts</code>.
        </p>
      </div>
    </section>
  );
}
