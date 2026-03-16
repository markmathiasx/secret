import type { Metadata } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/pwa-register';
import { SiteAssistant } from '@/components/site-assistant';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { brand, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';
import { getSiteUrl } from '@/lib/env';

const siteUrl = getSiteUrl();

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
    <html lang="pt-BR">
      <body>
        <div className="site-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <SiteAssistant />
          <PwaRegister />
        </div>
      </body>
    </html>
  );
}
