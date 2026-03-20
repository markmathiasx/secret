import type { Metadata } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { SiteAssistant } from '@/components/site-assistant';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { StorefrontProviders } from '@/components/storefront-providers';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { AuthProvider } from '@/components/auth-context';
import { brand, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';
import { getSiteUrl } from '@/lib/env';

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MDH 3D | Marketplace de pecas, upgrades e kits para A1 Mini',
    template: '%s | MDH 3D'
  },
  description:
    'Marketplace de pecas, upgrades, consumiveis e kits com fotos reais, dados tecnicos e compatibilidade verificada para Bambu Lab A1 Mini.',
  applicationName: 'MDH 3D',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'MDH 3D | Marketplace tecnico para A1 Mini',
    description:
      'Compre com filtro por compatibilidade, comparador tecnico e checkout com Pix, cartao e boleto.',
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
    title: 'MDH 3D | Pecas e upgrades para A1 Mini',
    description: 'Catalogo com fotos reais, curadoria de marketplace e ficha tecnica completa.',
    images: ['/backgrounds/hero-printer-fallback.jpg']
  },
  category: 'ecommerce',
  keywords: [
    'pecas bambu lab a1 mini',
    'upgrade a1 mini',
    'hotend a1 mini',
    'bico nozzle a1 mini',
    'filtro compatibilidade a1 mini',
    'marketplace 3d brasil'
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
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <StorefrontProviders>
            <div className="site-shell">
              <SiteHeader />
              <main>{children}</main>
              <SiteFooter />
              <WhatsAppFloat />
              <SiteAssistant />
              <PwaRegister />
            </div>
          </StorefrontProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
