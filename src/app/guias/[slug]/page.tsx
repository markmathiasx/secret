import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideBySlug, guideEntries } from "@/lib/seo-content";
import { getAbsoluteUrl, getBreadcrumbStructuredData, getSiteUrl } from "@/lib/seo";

export async function generateStaticParams() {
  return guideEntries.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return { title: "Guia nao encontrado" };
  }

  const canonical = `${getSiteUrl()}/guias/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: canonical,
      type: "article",
      images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: guide.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [getAbsoluteUrl("/logo-mdh.jpg")]
    }
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) notFound();

  const canonical = `${getSiteUrl()}/guias/${guide.slug}`;
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Guias", item: `${getSiteUrl()}/guias` },
    { name: guide.title, item: canonical }
  ]);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    mainEntityOfPage: canonical,
    author: {
      "@type": "Organization",
      name: "MDH 3D"
    },
    publisher: {
      "@type": "Organization",
      name: "MDH 3D",
      logo: {
        "@type": "ImageObject",
        url: getAbsoluteUrl("/logo-mdh.jpg")
      }
    },
    datePublished: "2026-03-15",
    dateModified: "2026-03-15"
  };

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Guia MDH 3D</p>
      <h1 className="mt-3 text-4xl font-black text-white">{guide.title}</h1>
      <p className="mt-4 text-lg leading-8 text-white/70">{guide.description}</p>

      <div className="mt-8 section-shell rounded-[36px] p-8">
        <p className="text-base leading-8 text-white/72">{guide.intro}</p>
      </div>

      <div className="mt-8 grid gap-5">
        {guide.sections.map((section) => (
          <section key={section.heading} className="section-shell rounded-[32px] p-6">
            <h2 className="text-2xl font-black text-white">{section.heading}</h2>
            <p className="mt-4 text-sm leading-8 text-white/68">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={guide.relatedHref} className="premium-btn premium-btn-primary">
          {guide.relatedLabel}
        </Link>
        <Link href="/guias" className="premium-btn premium-btn-secondary">
          Voltar para os guias
        </Link>
        <Link href="/catalogo" className="premium-btn premium-btn-ghost">
          Ir para o catalogo
        </Link>
      </div>
    </article>
  );
}
