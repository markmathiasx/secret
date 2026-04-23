import { SalesLandingPage } from "@/components/sales-landing-page";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { getSiteUrl } from "@/lib/env";
import { getLandingProducts, type SalesLandingKey, salesLandings } from "@/lib/sales-landings";

export async function SalesLandingShell({ landingKey }: { landingKey: SalesLandingKey }) {
  const config = salesLandings[landingKey];
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${config.slug}`;
  const products = getLandingProducts(await getCatalogSnapshot(), config).slice(0, 12);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: config.kicker, item: pageUrl },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.seoTitle,
    description: config.seoDescription,
    url: pageUrl,
    mainEntity:
      products.length > 0
        ? {
            "@type": "ItemList",
            numberOfItems: products.length,
            itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteUrl}${getProductUrl(product)}`,
            name: product.name,
            image: product.images?.[0]
              ? product.images[0].startsWith("http")
                ? product.images[0]
                : `${siteUrl}${product.images[0]}`
              : undefined,
          })),
          }
        : undefined,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SalesLandingPage landingKey={landingKey} />
    </>
  );
}
