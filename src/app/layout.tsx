import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PwaRegister } from "@/components/pwa-register";
import { SiteAssistant } from "@/components/site-assistant";
import { StoreProvider } from "@/components/store-provider";
import { brand, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MDH 3D | Loja de impressões 3D no Rio de Janeiro",
    template: "%s | MDH 3D"
  },
  description:
    "Loja de projetos impressos em 3D com foco em anime, gamer, decoração, utilidades, personalizados e entrega local no Rio de Janeiro.",
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
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "MDH 3D",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com site próprio, WhatsApp e pagamentos digitais.",
    images: [{ url: "/logo-mdh.jpg", width: 1200, height: 900, alt: "Logo MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Impressões 3D sob encomenda com atendimento rápido e frete local no RJ.",
    images: ["/logo-mdh.jpg"]
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
  sameAs: [socialLinks.instagram, socialLinks.facebook].filter((item) => Boolean(item && item !== "#"))
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="bg-base text-white antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <StoreProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <SiteAssistant />
          <PwaRegister />
        </StoreProvider>
      </body>
    </html>
  );
}
