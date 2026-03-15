import type { Product } from "@/lib/catalog";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { getProductUrl } from "@/lib/catalog";
import { getProductGallerySources } from "@/lib/product-media";
import { formatCurrency } from "@/lib/utils";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export function getAbsoluteUrl(path = "") {
  if (!path) return getSiteUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${getSiteUrl()}#organization`,
    name: brand.name,
    legalName: brand.legalName,
    description: brand.slogan,
    email: supportEmail,
    telephone: `+${whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: brand.city,
      addressRegion: brand.state,
      addressCountry: "BR"
    },
    areaServed: "BR",
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
    hasMerchantReturnPolicy: getReturnPolicyStructuredData()
  };
}

export function getShippingStructuredData() {
  return {
    "@type": "OfferShippingDetails",
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
    "@type": "MerchantReturnPolicy",
    applicableCountry: "BR",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/FreeReturn"
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

export function getBreadcrumbStructuredData(items: Array<{ name: string; item: string }>) {
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
    ]
  };
}
