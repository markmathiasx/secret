import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { PwaRegister } from "@/components/pwa-register";
import { SiteAssistant } from "@/components/site-assistant";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
import {
  getAbsoluteUrl,
  getOrganizationStructuredData,
  getSiteUrl,
  getStoreStructuredData,
  getWebsiteStructuredData
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    default: "MDH 3D | Loja premium de impressões 3D no Rio de Janeiro",
    template: "%s | MDH 3D"
  },
  description:
    "Curadoria de pecas 3D para presentes, setup, decoracao e personalizados, com Pix, compra simples e atendimento no WhatsApp.",
  metadataBase: new URL(getSiteUrl()),
  applicationName: "MDH 3D",
  keywords: [
    "impressão 3d",
    "loja 3d rj",
    "decoracao 3d",
    "anime 3d",
    "suporte de controle 3d",
    "placa pix 3d",
    "presente personalizado 3d"
  ],
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
    siteName: "MDH 3D",
    title: "MDH 3D",
    description: "Pecas 3D sob encomenda com curadoria para presentes, setup, decoracao e personalizados.",
    url: getSiteUrl(),
    images: [{ url: getAbsoluteUrl("/logo-mdh.jpg"), alt: "MDH 3D" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "MDH 3D",
    description: "Loja premium de pecas 3D com curadoria, Pix e atendimento rapido no WhatsApp.",
    images: [getAbsoluteUrl("/logo-mdh.jpg")]
  },
  alternates: {
    canonical: "/"
  }
};

const organizationLd = getOrganizationStructuredData();
const websiteLd = getWebsiteStructuredData();
const storePolicyLd = getStoreStructuredData();

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const customerSession = await getCurrentCustomerSession();
  const initialCustomerDraft = customerSession
    ? {
        fullName: customerSession.account.fullName,
        email: customerSession.account.email
      }
    : undefined;

  return (
    <html lang="pt-BR">
      <body className="bg-base text-white antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storePolicyLd) }} />
        <AnalyticsProvider />
        <CartProvider initialCustomerDraft={initialCustomerDraft}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
          <SiteAssistant />
          <PwaRegister />
        </CartProvider>
      </body>
    </html>
  );
}
