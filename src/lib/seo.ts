import type { Metadata } from "next";
import type { Product } from "@/lib/catalog";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { getProductUrl } from "@/lib/catalog";
import { getProductGallerySources, getProductPrimaryMedia } from "@/lib/product-media";
import { formatCurrency } from "@/lib/utils";

export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();

  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  if (vercelUrl) {
    const normalized = vercelUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    return `https://${normalized}`;
  }

  return "http://localhost:3000";
}

export function getAbsoluteUrl(path = "") {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  imageAlt?: string;
  type?: "website" | "article";
}): Metadata {
  const canonical = getAbsoluteUrl(input.path);
  const imageAlt = input.imageAlt || input.title;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      type: input.type || "website",
      images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: imageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [getAbsoluteUrl("/logo-mdh.jpg")]
    }
  };
}

export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getSiteUrl()}#organization`,
    name: brand.name,
    legalName: brand.legalName,
    description: brand.slogan,
    url: getSiteUrl(),
    logo: getAbsoluteUrl("/logo-mdh.jpg"),
    email: supportEmail,
    telephone: `+${whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR"
    },
    areaServed: "BR",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${whatsappNumber}`,
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["pt-BR"]
    },
    sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#"))
  };
}

export function getStoreStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${getSiteUrl()}#store`,
    name: brand.name,
    description: brand.slogan,
    url: getSiteUrl(),
    image: getAbsoluteUrl("/logo-mdh.jpg"),
    telephone: `+${whatsappNumber}`,
    email: supportEmail,
    areaServed: {
      "@type": "Country",
      name: "BR"
    },
    sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#")),
    currenciesAccepted: "BRL",
    paymentAccepted: ["Pix", "Cartao", "Dinheiro", "Outro"],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: getSiteUrl(),
      availableLanguage: ["pt-BR"],
      servicePhone: {
        "@type": "ContactPoint",
        telephone: `+${whatsappNumber}`,
        contactType: "customer support"
      }
    },
    parentOrganization: {
      "@id": `${getSiteUrl()}#organization`
    },
    hasMerchantReturnPolicy: getReturnPolicyStructuredData()
  };
}

export function getShippingStructuredData() {
  return {
    "@id": `${getSiteUrl()}/entregas#shipping-policy`,
    "@type": "OfferShippingDetails",
    shippingSettingsLink: `${getSiteUrl()}/entregas`,
    doesNotShip: false,
    shippingRate: {
      "@type": "MonetaryAmount",
      currency: "BRL",
      value: "0.00"
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: "BR"
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 4,
        unitCode: "DAY"
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 5,
        unitCode: "DAY"
      }
    }
  };
}

export function getReturnPolicyStructuredData() {
  return {
    "@id": `${getSiteUrl()}/trocas-e-devolucoes#return-policy`,
    "@type": "MerchantReturnPolicy",
    url: `${getSiteUrl()}/trocas-e-devolucoes`,
    applicableCountry: "BR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn"
  };
}

export function getShippingPolicyStructuredData() {
  return {
    "@context": "https://schema.org",
    ...getShippingStructuredData()
  };
}

export function getReturnPolicyPageStructuredData() {
  return {
    "@context": "https://schema.org",
    ...getReturnPolicyStructuredData()
  };
}

export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}#website`,
    url: getSiteUrl(),
    name: brand.name,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/catalogo?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function getFaqStructuredData(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };
}

export function getBreadcrumbStructuredData(items: ReadonlyArray<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item
    }))
  };
}

export function getCatalogStructuredData(input: {
  title: string;
  description: string;
  canonicalUrl: string;
  products: Product[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${input.canonicalUrl}#collection`,
    url: input.canonicalUrl,
    name: input.title,
    description: input.description,
    isPartOf: {
      "@id": `${getSiteUrl()}#website`
    },
    about: {
      "@id": `${getSiteUrl()}#store`
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderAscending",
      numberOfItems: input.products.length,
      itemListElement: input.products.slice(0, 12).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getAbsoluteUrl(getProductUrl(product)),
        name: product.name
      }))
    }
  };
}

export function getProductStructuredData(product: Product) {
  const productUrl = getAbsoluteUrl(getProductUrl(product));
  const imageUrls = getProductGallerySources(product)
    .map((asset) => getAbsoluteUrl(asset.src))
    .filter((url) => !url.startsWith("data:"));
  const safeImageUrls = imageUrls.length ? imageUrls : [getAbsoluteUrl("/logo-mdh.jpg")];
  const ratingValue = Number(product.metadata.ratingValue);
  const reviewCount = Number(product.metadata.reviewCount);
  const primaryMedia = getProductPrimaryMedia(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    url: productUrl,
    sku: product.sku,
    image: safeImageUrls,
    description: product.description,
    category: product.category,
    audience: {
      "@type": "Audience",
      audienceType: product.category
    },
    brand: {
      "@type": "Brand",
      "@id": `${getSiteUrl()}#organization`,
      name: brand.name
    },
    material: product.materials.join(", "),
    color: product.colors.join(", "),
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: "BRL",
      price: product.pricePix.toFixed(2),
      priceValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${getSiteUrl()}#store`
      },
      eligibleRegion: {
        "@type": "Country",
        name: "BR"
      },
      shippingDetails: getShippingStructuredData(),
      hasMerchantReturnPolicy: getReturnPolicyStructuredData()
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Prazo de produção",
        value: product.productionWindow
      },
      {
        "@type": "PropertyValue",
        name: "Preço no Pix",
        value: formatCurrency(product.pricePix)
      },
      {
        "@type": "PropertyValue",
        name: "Preço no cartão",
        value: formatCurrency(product.priceCard)
      },
      {
        "@type": "PropertyValue",
        name: "Coleção",
        value: product.collection
      },
      {
        "@type": "PropertyValue",
        name: "Tema",
        value: product.theme
      }
    ],
    ...(ratingValue > 0 && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingValue.toFixed(1),
            reviewCount
          }
        }
      : {}),
    subjectOf: {
      "@type": "ImageObject",
      contentUrl: getAbsoluteUrl(primaryMedia.src),
      caption: primaryMedia.caption
    }
  };
}
