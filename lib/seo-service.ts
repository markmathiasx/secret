/**
 * SEO & Structured Data Service for 2026
 * Complete schema.org markup for products, breadcrumbs, organizations
 */

import { getSiteUrl } from '@/lib/env';

export interface ProductSchemaData {
  name: string;
  description: string;
  image: string[];
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  ratingCount?: number;
  reviewCount?: number;
  sku?: string;
  brand: string;
  category?: string;
  url: string;
  seller?: string;
  offerPrice?: number;
  offerStartDate?: string;
  offerEndDate?: string;
  shippingCost?: number;
  deliveryTime?: string;
}

/**
 * Generate Product schema.org markup
 */
export function generateProductSchema(product: ProductSchemaData): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      url: product.url,
      priceCurrency: product.currency,
      price: product.price.toString(),
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: product.seller || 'MDH 3D Store'
      },
      ...(product.offerPrice && { offerPrice: product.offerPrice }),
      ...(product.offerStartDate && { priceValidFrom: product.offerStartDate }),
      ...(product.offerEndDate && { priceValidUntil: product.offerEndDate }),
      shippingDetails: {
        '@type': 'ShippingDeliveryTime',
        shippingRate: {
          '@type': 'PriceSpecification',
          priceCurrency: product.currency,
          price: (product.shippingCost || 0).toString()
        },
        deliveryTime: {
          '@type': 'QuantitativeValue',
          unitText: 'BUSINESS_DAY',
          minValue: 3,
          maxValue: 7
        }
      }
    },
    ...(product.sku && { sku: product.sku }),
    ...(product.category && { category: product.category }),
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        ratingCount: (product.ratingCount || 0).toString(),
        reviewCount: (product.reviewCount || 0).toString()
      }
    })
  };

  return JSON.stringify(schema);
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: (index + 1).toString(),
      name: item.name,
      item: item.url
    }))
  };

  return JSON.stringify(schema);
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    name: 'MDH 3D Store',
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo.png`,
    description: 'Professional 3D printing services and products in Rio de Janeiro',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rio de Janeiro',
      addressCountry: 'BR'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+55-21-99999-9999'
    },
    sameAs: [
      'https://www.facebook.com/mdh3d',
      'https://www.instagram.com/mdh_3d.com.br/',
      'https://www.youtube.com/mdh3d'
    ]
  };

  return JSON.stringify(schema);
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return JSON.stringify(schema);
}

/**
 * Generate Review schema
 */
export function generateReviewSchema(
  productName: string,
  author: string,
  rating: number,
  reviewText: string,
  datePublished: Date
): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: rating.toString(),
      bestRating: '5',
      worstRating: '1'
    },
    name: `Review of ${productName}`,
    text: reviewText,
    author: {
      '@type': 'Person',
      name: author
    },
    datePublished: datePublished.toISOString(),
    inLanguage: 'pt-BR'
  };

  return JSON.stringify(schema);
}

/**
 * Generate LocalBusiness schema (for location-based services)
 */
export function generateLocalBusinessSchema(): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'LocalBusiness',
    '@id': getSiteUrl(),
    name: 'MDH 3D Store',
    image: `${getSiteUrl()}/hero.jpg`,
    description: 'Professional 3D Printing & Services',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rio de Janeiro, RJ',
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-22.9068',
      longitude: '-43.1729'
    },
    telephone: '+55-21-99999-9999',
    url: getSiteUrl(),
    priceRange: 'R$ 50 - R$ 5000',
    opens: 'Mo-Fr 09:00',
    closes: 'Mo-Fr 18:00'
  };

  return JSON.stringify(schema);
}

/**
 * Generate Category Page schema
 */
export function generateCollectionSchema(
  name: string,
  description: string,
  image: string,
  itemCount: number
): string {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Collection',
    name,
    description,
    image,
    numberOfItems: itemCount.toString(),
    url: `${getSiteUrl()}/catalogo/${name.toLowerCase()}`
  };

  return JSON.stringify(schema);
}

/**
 * Meta tags for SEO
 */
export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonical?: string;
  robots?: string;
  viewport?: string;
  charset?: string;
}

/**
 * Generate meta tags HTML
 */
export function generateMetaTags(meta: SEOMeta): Record<string, string> {
  return {
    'title': meta.title,
    'description': meta.description,
    'keywords': meta.keywords || '',
    'og:title': meta.ogTitle || meta.title,
    'og:description': meta.ogDescription || meta.description,
    'og:image': meta.ogImage || '',
    'og:url': meta.ogUrl || '',
    'twitter:card': meta.twitterCard || 'summary',
    'twitter:title': meta.ogTitle || meta.title,
    'twitter:description': meta.ogDescription || meta.description,
    'twitter:image': meta.ogImage || '',
    'canonical': meta.canonical || '',
    'robots': meta.robots || 'index, follow',
    'viewport': meta.viewport || 'width=device-width, initial-scale=1.0',
    'charset': meta.charset || 'UTF-8'
  };
}

/**
 * Performance hints (Core Web Vitals)
 */
export interface PerformanceHints {
  preconnect?: string[];
  dns_prefetch?: string[];
  preload?: Array<{ href: string; as: string }>;
}

export function generatePerformanceHints(): PerformanceHints {
  return {
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    dns_prefetch: [
      'https://www.google-analytics.com',
      'https://cdn.example.com'
    ],
    preload: [
      { href: '/fonts/inter.woff2', as: 'font' }
    ]
  };
}
