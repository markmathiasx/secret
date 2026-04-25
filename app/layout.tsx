import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';
import { Manrope, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AccessibilityProvider, SkipLink } from '@/components/accessibility';
import { CartDrawer } from '@/components/cart-drawer';
import { CartRecoveryDock } from '@/components/cart-recovery-dock';
import { CartSessionBridge } from '@/components/cart-session-bridge';
import { ChatwootWidget } from '@/components/chatwoot-widget';
import { CartProvider } from '@/lib/cart-context';
import { CookieConsent } from '@/components/cookie-consent';
import { FacebookPixel } from '@/components/facebook-pixel';
import { PwaRegister } from '@/components/pwa-register';
import { RouteActionDock } from '@/components/route-action-dock';
import { ScrollToTop } from '@/components/scroll-to-top';
import { SiteAssistant } from '@/components/site-assistant';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { ToastProvider } from '@/components/toast';
import { LiveChatWidget } from '@/components/live-chat-widget';
import { WebVitals } from '@/components/web-vitals';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { NetworkStatusBanner } from '@/components/network-status-banner';
import { brand, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';
import {
  getAiAssistantModel,
  getAiAssistantProvider,
  getChatwootBaseUrl,
  getChatwootWebsiteToken,
  getSupportChannelMode,
  getSiteUrl,
  isAiAssistantConfigured,
  isCardCheckoutConfigured,
  isChatwootWidgetConfigured,
} from '@/lib/env';

const siteUrl = getSiteUrl();
const sans = Manrope({ subsets: ['latin'], variable: '--font-sans', display: 'swap', preload: true });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap', preload: false });
const cardCheckoutReady = isCardCheckoutConfigured();
const aiAssistantReady = isAiAssistantConfigured();
const aiAssistantModel = getAiAssistantModel();
const aiAssistantProvider = getAiAssistantProvider();
const chatwootEnabled = isChatwootWidgetConfigured();
const chatwootBaseUrl = getChatwootBaseUrl();
const chatwootWebsiteToken = getChatwootWebsiteToken();
const liveChatMode = getSupportChannelMode();
const normalizedPhone = `+${whatsappNumber.replace(/\D/g, '')}`;
const socialProfiles = [socialLinks.instagram].filter((item) => Boolean(item) && item !== '#');
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'LocalBusiness', 'Store'],
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
    addressCountry: 'BR',
    addressRegionCode: 'RJ',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '-22.9068',
    longitude: '-43.1729',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  priceRange: 'R$',
  currenciesAccepted: 'BRL',
  paymentAccepted: 'Pix, Cartão de Crédito, Boleto',
  areaServed: {
    '@type': 'State',
    name: 'Rio de Janeiro',
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
    default: 'MDH 3D | Impressão 3D profissional no Rio de Janeiro',
    template: '%s | MDH 3D'
  },
  description:
    'Impressão 3D profissional no Rio de Janeiro com presentes personalizados, peças geek, utilidades, setup e projetos sob encomenda.',
  applicationName: 'MDH 3D',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    title: 'MDH 3D | Impressão 3D profissional no Rio de Janeiro',
    description:
      'Produção local no Rio de Janeiro com peças 3D para presentes, setup, cultura geek, utilidades e encomendas personalizadas.',
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
    title: 'MDH 3D | Impressão 3D profissional',
    description: 'Peças 3D sob medida com produção local, atendimento humano e checkout claro no Rio de Janeiro.',
    images: ['/backgrounds/hero-printer-fallback.jpg']
  },
  category: 'ecommerce',
  keywords: [
    'impressão 3d',
    'rio de janeiro',
    'presentes personalizados',
    'peças geek',
    'setup',
    'catálogo 3d',
    'miniaturas personalizadas',
    'utilidades em impressão 3d',
    'decoração geek'
  ],
  authors: [{ name: brand.legalName }],
  creator: brand.name,
  publisher: brand.name,
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  verification: googleVerification ? { google: googleVerification } : undefined,
  other: {
    'contact:email': supportEmail,
    'contact:phone_number': whatsappNumber,
    'social:instagram': socialLinks.instagram || '',
    'business:contact_data:locality': brand.city,
    'business:contact_data:region': brand.state,
    'business:contact_data:country_name': 'Brasil'
  }
};

export const viewport: Viewport = {
  themeColor: '#0d1824',
  colorScheme: 'dark',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${sans.variable} ${display.variable}`}>
      <head>
        {/* Critical resource hints — preconnect to third-party origins used above the fold */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://api.mercadopago.com" />
        <link rel="dns-prefetch" href="https://sdk.mercadopago.com" />
      </head>
      <body>
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: true });
              `}
            </Script>
          </>
        ) : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <div className="site-shell">
          <CartProvider>
            <ToastProvider>
            <SkipLink />
            <AccessibilityProvider />
            <CartSessionBridge />
            <SiteHeader
              cardCheckoutReady={cardCheckoutReady}
              aiAssistantReady={aiAssistantReady}
              aiAssistantModel={aiAssistantModel}
              aiAssistantProvider={aiAssistantProvider}
              liveChatMode={liveChatMode}
            />
            <main>{children}</main>
            <SiteFooter />
            <RouteActionDock />
            <WhatsAppFloat />
            <ScrollToTop />
            <SiteAssistant
              cardCheckoutReady={cardCheckoutReady}
              aiAssistantReady={aiAssistantReady}
              aiAssistantModel={aiAssistantModel}
              aiAssistantProvider={aiAssistantProvider}
              liveChatMode={liveChatMode}
            />
            <ChatwootWidget
              enabled={chatwootEnabled}
              baseUrl={chatwootBaseUrl}
              websiteToken={chatwootWebsiteToken}
            />
            <LiveChatWidget defaultMode={liveChatMode} />
            <PwaRegister />
            <CartDrawer />
            <CartRecoveryDock />
            <CookieConsent />
            <Suspense fallback={null}><FacebookPixel /></Suspense>
            <WebVitals />
            <NetworkStatusBanner />
            </ToastProvider>
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
