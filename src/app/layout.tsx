import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PwaRegister } from "@/components/pwa-register";
import { SiteAssistant } from "@/components/site-assistant";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MDH 3D | Impressao 3D premium no Rio de Janeiro",
    template: "%s | MDH 3D"
  },
  description:
    "Loja de impressao 3D premium no Rio de Janeiro com pecas anime, geek, utilitarios, decoracao, escritorio e personalizados sob encomenda.",
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MDH 3D",
    title: "MDH 3D | Impressao 3D premium no Rio de Janeiro",
    description:
      "Catalogo comercial com pecas 3D para decoracao, presentes, setup, utilitarios e personalizados, com entrega local no RJ.",
    images: [{ url: "/logo-mdh.jpg", width: 1200, height: 900, alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Impressao 3D premium",
    description: "Pecas sob encomenda com operacao propria, atendimento humano e entrega local no Rio de Janeiro.",
    images: ["/logo-mdh.jpg"]
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: brand.name,
  description: "Impressao 3D premium com producao propria, catalogo comercial e entrega local no Rio de Janeiro.",
  url: siteUrl,
  image: `${siteUrl}/logo-mdh.jpg`,
  email: supportEmail,
  telephone: `+${whatsappNumber}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: brand.city,
    addressRegion: brand.state,
    addressCountry: "BR"
  },
  areaServed: "Rio de Janeiro",
  paymentAccepted: ["Pix", "Cartao", "Boleto"],
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok].filter(
    (item) => Boolean(item && item !== "#")
  )
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-base text-white antialiased">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <PwaRegister />
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <SiteAssistant />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
