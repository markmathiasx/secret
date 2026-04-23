import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CatalogGrid } from "@/components/catalog-grid";
import { CommerceFaq } from "@/components/commerce-faq";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import {
  categoryPageConfigs,
  getCategoryPageBySlug,
  getCategoryPageMetadata,
  getCategoryPageStaticParams,
} from "@/lib/category-pages";
import { getSiteUrl } from "@/lib/env";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return getCategoryPageStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getCategoryPageBySlug(slug);

  if (!config) {
    return {
      title: "Categoria nao encontrada",
    };
  }

  return getCategoryPageMetadata(config);
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getCategoryPageBySlug(slug);

  if (!config) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/catalogo/categoria/${config.slug}`;
  const catalog = await getCatalogSnapshot();
  const products = catalog.filter((product) => product.category === config.category);

  if (!products.length) {
    notFound();
  }

  const highlights = products
    .filter((product) => config.highlightMatch?.(product) ?? isProductVisualVerified(product))
    .slice(0, 8);
  const showcase = (highlights.length ? highlights : products).slice(0, 8);
  const minPrice = Math.min(...products.map((product) => product.pricePix));
  const readyCount = products.filter((product) => product.readyToShip).length;
  const verifiedCount = products.filter((product) => isProductVisualVerified(product)).length;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: `${siteUrl}/catalogo` },
      { "@type": "ListItem", position: 3, name: config.category, item: pageUrl },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.seoTitle,
    description: config.seoDescription,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: showcase.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}${getProductUrl(product)}`,
        name: product.name,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const relatedCategories = categoryPageConfigs.filter((item) => item.slug !== config.slug).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{config.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{config.title}</h1>
            <p className="mt-4 text-lg leading-8 text-white/70">{config.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {config.proofPoints.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={config.primaryCta.href} className="btn-primary px-6 py-3">
                {config.primaryCta.label}
              </Link>
              <Link href={config.secondaryCta.href} className="btn-secondary px-6 py-3">
                {config.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Produtos ativos", value: String(products.length).padStart(2, "0") },
              { label: "Visual validado", value: String(verifiedCount).padStart(2, "0") },
              { label: "Faixa inicial", value: formatCurrency(minPrice) },
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/8 p-5 text-sm leading-7 text-emerald-50/90">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Faixa comercial</p>
          <p className="mt-2">{config.budgetLabel}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/68">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Leitura de compra</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <span>{readyCount} itens de pronta entrega</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>{verifiedCount} com foto real ou render fiel</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>CTA de compra e CTA de briefing na mesma categoria</span>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Selecao da categoria</p>
          <h2 className="mt-3 text-3xl font-black text-white">Pecas que representam melhor este recorte comercial.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            A categoria abre com itens que ajudam a explicar melhor preco, prova visual e valor percebido para este tipo de compra.
          </p>
        </div>
        <CatalogGrid products={showcase} />
      </section>

      <section className="mt-12">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Explorador da categoria</p>
          <h2 className="mt-3 text-3xl font-black text-white">Filtro crawlavel na URL, filtro interativo na experiencia.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            Esta pagina resolve indexacao e compartilhamento. O explorador abaixo resolve comparacao fina sem perder o contexto comercial.
          </p>
        </div>
        <CatalogExplorer products={catalog} initialCategory={config.category} initialVisualMode="all" />
      </section>

      <div className="mt-14">
        <CommerceFaq
          eyebrow="FAQ da categoria"
          title="Perguntas que costumam aparecer antes do clique final."
          description="Cada categoria comercial ganhou FAQ proprio para segurar intencao de compra dentro da pagina e reduzir duvida de contexto."
          items={config.faq}
        />
      </div>

      <section className="mt-16 rounded-[32px] border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Mais categorias comerciais</p>
            <h2 className="mt-3 text-3xl font-black text-white">Outros recortes que ajudam a vender o catalogo com mais contexto.</h2>
          </div>
          <Link href="/catalogo" className="btn-secondary">
            Abrir catalogo geral
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {relatedCategories.map((item) => (
            <Link
              key={item.slug}
              href={`/catalogo/categoria/${item.slug}`}
              className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/30 hover:bg-black/30"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">{item.category}</p>
              <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
