import type { Product } from '@/lib/catalog';

// Schema.org JSON-LD Types
export interface SchemaProduct {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  image: string[];
  description: string;
  sku: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: string;
    priceValidUntil?: string;
    availability: string;
    itemCondition: string;
    shippingDetails?: any;
    hasMerchantReturnPolicy?: any;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    reviewCount: string;
  };
  review?: Array<{
    '@type': 'Review';
    author: {
      '@type': 'Person';
      name: string;
    };
    datePublished: string;
    reviewRating: {
      '@type': 'Rating';
      ratingValue: string;
    };
    reviewBody: string;
  }>;
}

export interface SchemaBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export interface SchemaFAQPage {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface SchemaArticle {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}

export interface SchemaOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  };
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export interface SchemaWebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

// Generate Product Schema
export function generateProductSchema(
  product: Product,
  reviews: Array<{
    author: string;
    rating: number;
    date: string;
    content: string;
  }>,
  averageRating: number,
  reviewCount: number
): SchemaProduct {
  const baseUrl = 'https://mdh3d.com.br';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [product.image].filter((img): img is string => Boolean(img)),
    description: product.description?.substring(0, 5000) || product.name,
    sku: product.sku || product.slug || product.id,
    brand: {
      '@type': 'Brand',
      name: 'MDH 3D',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/loja/${product.category}/${product.slug}`,
      priceCurrency: 'BRL',
      price: product.pricePix?.toFixed(2) || product.price?.toFixed(2) || '0',
      priceValidUntil: (product as any).saleEndsAt || undefined,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'BRL',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'BR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviewCount.toString(),
    } : undefined,
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
      },
      reviewBody: review.content,
    })),
  };
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): SchemaBreadcrumbList {
  const baseUrl = 'https://mdh3d.com.br';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

// Generate FAQ Schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): SchemaFAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate Article Schema (for blog)
export function generateArticleSchema(
  article: {
    title: string;
    description: string;
    image: string;
    publishedAt: Date;
    updatedAt: Date;
    author: string;
    url: string;
  }
): SchemaArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: [article.image],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'MDH 3D',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mdh3d.com.br/logo.png',
      },
    },
  };
}

// Generate Organization Schema
export function generateOrganizationSchema(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MDH 3D',
    url: 'https://mdh3d.com.br',
    logo: 'https://mdh3d.com.br/logo.png',
    description: 'Impressão 3D premium no Rio de Janeiro com foto real antes da compra.',
    sameAs: [
      'https://www.instagram.com/mdh3d',
      'https://www.facebook.com/mdh3d',
      'https://www.tiktok.com/@mdh3d',
      'https://www.youtube.com/mdh3d',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-21-99999-9999',
      contactType: 'customer service',
      availableLanguage: ['Portuguese', 'English', 'Spanish'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Visconde de Pirajá, 414, Sala 305',
      addressLocality: 'Rio de Janeiro',
      addressRegion: 'RJ',
      postalCode: '22410-000',
      addressCountry: 'BR',
    },
  };
}

// Generate WebSite Schema with Search
export function generateWebSiteSchema(): SchemaWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MDH 3D',
    url: 'https://mdh3d.com.br',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mdh3d.com.br/busca?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

// Local Business Schema
export function generateLocalBusinessSchema(): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MDH 3D - Impressão 3D Rio de Janeiro',
    image: 'https://mdh3d.com.br/loja-image.jpg',
    '@id': 'https://mdh3d.com.br',
    url: 'https://mdh3d.com.br',
    telephone: '+55-21-99999-9999',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Visconde de Pirajá, 414, Sala 305',
      addressLocality: 'Ipanema, Rio de Janeiro',
      addressRegion: 'RJ',
      postalCode: '22410-000',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -22.9836,
      longitude: -43.1989,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '17:00',
      },
    ],
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
    },
  };
}

// Generate HowTo Schema (for guides)
export function generateHowToSchema(
  howTo: {
    name: string;
    description: string;
    totalTime?: string;
    steps: Array<{ name: string; text: string; image?: string }>;
  }
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    totalTime: howTo.totalTime,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };
}

// Script tag generator for Next.js
export function generateSchemaScript(schema: object): string {
  return JSON.stringify(schema);
}

// Combine multiple schemas
export function combineSchemas(...schemas: object[]): object {
  if (schemas.length === 1) return schemas[0];
  return {
    '@context': 'https://schema.org',
    '@graph': schemas,
  };
}
