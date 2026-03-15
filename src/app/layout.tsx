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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mdh-3d.vercel.app";
=======
>>>>>>> theirs
=======
>>>>>>> theirs

export const metadata: Metadata = {
<<<<<<< ours
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
=======
  title: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
=======

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
    template: "%s | MDH 3D"
  },
>>>>>>> theirs
  description:
    "Loja de projetos impressos em 3D com foco em anime, gamer, decoração, utilidades, personalizados e entrega local no Rio de Janeiro.",
  metadataBase: new URL(siteUrl),
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
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
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MDH 3D",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com site próprio, WhatsApp e pagamentos digitais.",
<<<<<<< ours
    url: siteUrl,
    siteName: "MDH 3D",
    locale: "pt_BR",
    type: "website",
<<<<<<< ours
<<<<<<< ours
=======
=======
=======
    images: [{ url: "/logo-mdh.jpg", width: 1200, height: 900, alt: "Logo MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com atendimento rápido e frete local no RJ.",
>>>>>>> theirs
    images: ["/logo-mdh.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com entrega local no Rio de Janeiro.",
>>>>>>> theirs
    images: ["/logo-mdh.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com entrega local no Rio de Janeiro.",
>>>>>>> theirs
    images: ["/logo-mdh.jpg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com entrega local no Rio de Janeiro.",
>>>>>>> theirs
    images: ["/logo-mdh.jpg"]
  },
  robots: { index: true, follow: true }
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
<<<<<<< ours
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok].filter((item) => Boolean(item && item !== "#"))
=======
  sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#"))
>>>>>>> theirs
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
