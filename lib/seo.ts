import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateSEO(props: SEOProps = {}): Metadata {
  const {
    title = 'MDH 3D | Storefront premium de impressão 3D',
    description = 'Loja premium de impressão 3D no Rio de Janeiro com peças geek, presentes criativos, setup, utilidades e projetos sob encomenda.',
    keywords = ['impressão 3d', 'rio de janeiro', 'presentes personalizados', 'peças geek', 'setup', 'catalogo 3d'],
    image = '/backgrounds/hero-printer-fallback.jpg',
    url = 'https://mdh-3d-store.vercel.app',
    type = 'website',
    publishedTime,
    modifiedTime,
    author = 'MDH 3D',
    section,
    tags,
  } = props;

  const fullTitle = title.includes('MDH 3D') ? title : `${title} | MDH 3D`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: author,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'MDH 3D Store',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'pt_BR',
      type: type === 'product' ? 'website' : type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
      ...(tags && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@mdh3dstore',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    category: 'ecommerce',
  };
}

export function generateProductSEO(product: any): Metadata {
  const imageUrl = product.images?.[0] || product.image || '/backgrounds/hero-printer-fallback.jpg';

  return generateSEO({
    title: `${product.name} - ${product.category} | MDH 3D`,
    description: `${product.description} ${product.material} • ${product.finish} • ${product.productionWindow}. Preço no Pix: R$ ${product.pricePix.toFixed(2)}. ${product.tags?.join(', ')}`,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      product.material.toLowerCase(),
      product.finish.toLowerCase(),
      ...product.tags,
      'impressão 3d',
      'personalizado',
      'rio de janeiro',
    ],
    image: imageUrl,
    url: `https://mdh-3d-store.vercel.app/catalogo/${product.id}`,
    type: 'product',
    section: product.category,
    tags: product.tags,
  });
}