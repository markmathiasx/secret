import Link from "next/link";
import type { Metadata } from "next";
import { CatalogExplorerLoader } from "@/components/catalog-explorer-loader";
import { CATALOG_INITIAL_PRODUCT_COUNT, toCatalogClientProducts } from "@/lib/catalog-client-product";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  title: "Catálogo MDH 3D",
  description: "Encontre chaveiros, chibis, peças de games e utilidades em impressão 3D. Filtre por universo, material e preço.",
  alternates: { canonical: "/catalogo" },
};
export const revalidate = 300;
export const dynamic = "force-static";

export default async function CatalogPage() {
  const catalog = await getCatalogSnapshot();
  const initialProducts = toCatalogClientProducts(catalog.slice(0, CATALOG_INITIAL_PRODUCT_COUNT));
  const siteUrl = getSiteUrl();
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: siteUrl + "/catalogo" },
    ],
  };
  return (
    <div className="experience-container py-8 lg:py-12" data-official-product-count={catalog.length}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <p className="text-xs text-slate-300"><Link href="/">Início</Link> / Catálogo</p>
      <div className="experience-section-heading mt-6"><div><p className="section-kicker">Explore as possibilidades</p><h1 className="!text-4xl !font-semibold !tracking-tight">Sua próxima peça está aqui.</h1><p>Escolha o que combina com você. Veja opções de tamanho, material e prazo em cada produto.</p></div><Link href="/sob-medida" className="btn-secondary">Quero algo sob medida ↗</Link></div>
      <CatalogExplorerLoader initialProducts={initialProducts} expectedTotal={catalog.length} initialOrder="Destaques" prioritizeInitialImages />
    </div>
  );
}
