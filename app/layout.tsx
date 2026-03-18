import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { SiteAssistant } from '@/components/site-assistant';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { brand, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';
import { getSiteUrl } from '@/lib/env';

const siteUrl = getSiteUrl();
const sans = Manrope({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const cardCheckoutReady = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN?.trim());
const normalizedPhone = `+${whatsappNumber.replace(/\D/g, '')}`;
const socialProfiles = [socialLinks.instagram].filter((item) => Boolean(item) && item !== '#');
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}#organization`,
  name: brand.legalName,
  alternateName: brand.name,
  description: brand.slogan,
  url: siteUrl,
  logo: `${siteUrl}/logo-mdh.jpg`,
  image: `${siteUrl}/backgrounds/hero-printer-fallback.jpg`,
  email: supportEmail,
  telephone: normalizedPhone,
  sameAs: socialProfiles,
  address: {
    '@type': 'PostalAddress',
    addressLocality: brand.city,
    addressRegion: brand.state,
    addressCountry: 'BR'
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: normalizedPhone,
      email: supportEmail,
      areaServed: 'BR',
      availableLanguage: ['pt-BR']
    }
  ],
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'BR',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    merchantReturnLink: `${siteUrl}/trocas-e-devolucoes`
  }
};
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  url: siteUrl,
  name: brand.name,
  description: brand.slogan,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/catalogo?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MDH 3D | Storefront premium de impressão 3D',
    template: '%s | MDH 3D'
  },
  description:
    'Loja premium de impressão 3D no Rio de Janeiro com peças geek, presentes criativos, setup, utilidades e projetos sob encomenda.',
  applicationName: 'MDH 3D',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MDH 3D | Storefront premium de impressão 3D',
    description:
      'Produção local no Rio de Janeiro com peças 3D para presentes, setup, cultura geek e personalizados sob encomenda.',
    url: siteUrl,
    siteName: 'MDH 3D',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/backgrounds/hero-printer-fallback.jpg',
        width: 1200,
        height: 630,
        alt: 'Bastidores da produção MDH 3D'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDH 3D | Impressão 3D premium',
    description: 'Peças 3D sob medida com produção local e atendimento humano no Rio de Janeiro.',
    images: ['/backgrounds/hero-printer-fallback.jpg']
  },
  category: 'ecommerce',
  keywords: [
    'impressão 3d',
    'rio de janeiro',
    'presentes personalizados',
    'peças geek',
    'setup',
    'catálogo 3d'
  ],
  authors: [{ name: brand.legalName }],
  creator: brand.name,
  publisher: brand.name,
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  other: {
    'contact:email': supportEmail,
    'contact:phone_number': whatsappNumber,
    'social:instagram': socialLinks.instagram || ''
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <div className="site-shell">
          <SiteHeader cardCheckoutReady={cardCheckoutReady} />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <SiteAssistant cardCheckoutReady={cardCheckoutReady} />
          <PwaRegister />
          <Analytics />
          <SpeedInsights />
        </div>
      </body>
    </html>
  );
}
