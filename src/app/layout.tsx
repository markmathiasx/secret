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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mdh-3d.vercel.app";

export const metadata: Metadata = {
  title: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
  description:
    "Loja de projetos impressos em 3D com foco em anime, gamer, decoração, utilidades, personalizados e entrega local no Rio de Janeiro.",
  metadataBase: new URL(siteUrl),
  applicationName: "MDH 3D",
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
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com site próprio, WhatsApp e pagamentos digitais.",
    url: siteUrl,
    siteName: "MDH 3D",
    locale: "pt_BR",
    type: "website",
    images: ["/logo-mdh.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com entrega local no Rio de Janeiro.",
  metadataBase: new URL(siteUrl),
  title: {
    default: "MDH 3D | Storefront premium de impressão 3D",
    template: "%s | MDH 3D"
  },
  description: "Loja premium de impressão 3D no Rio de Janeiro com peças geek, personalizadas e utilitárias sob encomenda.",
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "MDH 3D",
    title: "MDH 3D | Storefront premium de impressão 3D",
    description: "Peças 3D premium com catálogo comercial, orçamento rápido e atendimento via WhatsApp.",
    url: siteUrl,
    locale: "pt_BR",
    images: [{ url: "/logo-mdh.jpg", width: 1200, height: 630, alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Impressão 3D premium",
    description: "Catálogo comercial com peças geek, organização e personalizados.",
    images: ["/logo-mdh.jpg"]
  },
  robots: { index: true, follow: true }
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: brand.name,
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
