import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PwaRegister } from "@/components/pwa-register";
import { SiteAssistant } from "@/components/site-assistant";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { metadataBase, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "MDH 3D | Impressão 3D premium no Rio de Janeiro",
    template: "%s | MDH 3D"
  },
  description:
    "Loja premium de impressão 3D com catálogo autoral, pronta entrega, sob encomenda e atendimento direto no Rio de Janeiro.",
  applicationName: "MDH 3D",
  alternates: {
    canonical: "/"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MDH 3D"
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: "MDH 3D | Impressão 3D premium no Rio de Janeiro",
    description: "Peças 3D sob medida com acabamento premium, atendimento rápido e entrega local no Rio de Janeiro.",
    url: siteUrl,
    siteName: "MDH 3D",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/backgrounds/hero-printer-fallback.jpg",
        width: 1600,
        height: 900,
        alt: "Impressora 3D da MDH em ambiente premium"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Impressão 3D premium no Rio de Janeiro",
    description: "Peças 3D sob encomenda, pronta entrega e atendimento comercial direto no WhatsApp.",
    images: ["/backgrounds/hero-printer-fallback.jpg"]
  }
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: brand.name,
  url: siteUrl,
  email: supportEmail,
  telephone: `+${whatsappNumber}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: brand.city,
    addressRegion: brand.state,
    addressCountry: "BR"
  },
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok].filter((item) => Boolean(item && item !== "#"))
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-base text-white antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <WhatsAppFloat />
        <SiteAssistant />
        <PwaRegister />
      </body>
    </html>
  );
}
