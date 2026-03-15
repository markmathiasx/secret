import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { SiteAssistant } from "@/components/site-assistant";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mdh-3d.vercel.app";
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mdh-3d.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    default: "MDH 3D | Impressao 3D premium no Rio de Janeiro",
=======
    default: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
>>>>>>> theirs
=======
    default: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
>>>>>>> theirs
    template: "%s | MDH 3D"
  },
  description:
<<<<<<< ours
    "Impressao 3D premium no Rio de Janeiro com pecas anime, geek, decoracao, escritorio, utilitarios e personalizados sob encomenda.",
=======
    "Loja de projetos impressos em 3D com foco em anime, gamer, decoração, utilidades, personalizados e entrega local no Rio de Janeiro.",
  metadataBase: new URL(siteUrl),
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
<<<<<<< ours
<<<<<<< ours
  openGraph: {
    title: "MDH 3D | Impressao 3D premium no Rio de Janeiro",
    description:
      "Catalogo comercial de impressao 3D com atendimento local no RJ, acabamento premium e fluxo pronto para site e marketplaces.",
    url: siteUrl,
    siteName: "MDH 3D",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/backgrounds/hero-printer-fallback.jpg",
        width: 1200,
        height: 630,
        alt: "Bastidores da producao MDH 3D"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D | Impressao 3D premium",
    description: "Pecas 3D sob medida com entrega local no Rio de Janeiro.",
    images: ["/backgrounds/hero-printer-fallback.jpg"]
=======
=======
>>>>>>> theirs
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MDH 3D"
>>>>>>> theirs
  },
  category: "ecommerce",
  keywords: [
    "impressao 3d",
    "rio de janeiro",
    "presentes personalizados",
    "pecas geek",
    "decoracao 3d",
    "catalogo 3d"
  ],
  authors: [{ name: brand.legalName }],
  creator: brand.name,
  publisher: brand.name,
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
  other: {
    "contact:email": supportEmail,
    "contact:phone_number": whatsappNumber,
    "social:instagram": socialLinks.instagram || ""
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
=======
    default: "MDH 3D | Storefront premium de impressão 3D",
    template: "%s | MDH 3D"
  },
  description: "Loja premium de impressão 3D no Rio de Janeiro com peças geek, personalizadas e utilitárias sob encomenda.",
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
=======
  alternates: {
    canonical: "/"
  },
>>>>>>> theirs
=======
  alternates: {
    canonical: "/"
  },
>>>>>>> theirs
=======
  alternates: {
    canonical: "/"
  },
>>>>>>> theirs
=======
  alternates: {
    canonical: "/"
  },
>>>>>>> theirs
  openGraph: {
    type: "website",
<<<<<<< ours
<<<<<<< ours
=======
    default: "MDH 3D | Storefront premium de impressão 3D",
    template: "%s | MDH 3D"
  },
  description: "Loja premium de impressão 3D no Rio de Janeiro com peças geek, personalizadas e utilitárias sob encomenda.",
  applicationName: "MDH 3D",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
>>>>>>> theirs
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
<<<<<<< ours
=======
=======
>>>>>>> theirs
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MDH 3D",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com site próprio, WhatsApp e pagamentos digitais.",
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    images: [{ url: "/logo-mdh.jpg", width: 1200, height: 900, alt: "Logo MDH 3D" }]
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
    url: siteUrl,
    siteName: "MDH 3D",
    locale: "pt_BR",
    type: "website",
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
=======
=======
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
>>>>>>> theirs
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
<<<<<<< ours
    description: "Impressões 3D sob encomenda com atendimento rápido e frete local no RJ.",
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
    description: "Impressões 3D sob encomenda com entrega local no Rio de Janeiro.",
>>>>>>> theirs
    images: ["/logo-mdh.jpg"]
  },
=======
    images: ["/logo-mdh.jpg"]
  },
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok].filter((item) => Boolean(item && item !== "#"))
=======
  sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#"))
>>>>>>> theirs
=======
  sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#"))
>>>>>>> theirs
=======
  sameAs: [socialLinks.instagram, socialLinks.facebook, socialLinks.tiktok].filter((item) => Boolean(item && item !== "#"))
>>>>>>> theirs
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
>>>>>>> theirs
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-white antialiased">
        <PwaRegister />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <SiteAssistant />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
