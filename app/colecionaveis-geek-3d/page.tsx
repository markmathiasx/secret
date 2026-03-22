import type { Metadata } from "next";
import { SalesLandingPage } from "@/components/sales-landing-page";
import { salesLandings } from "@/lib/sales-landings";

const config = salesLandings.geek;

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: {
    canonical: config.slug,
  },
  openGraph: {
    title: config.seoTitle,
    description: config.seoDescription,
    images: config.heroImage ? [config.heroImage] : [],
  },
  twitter: {
    card: "summary_large_image",
    title: config.seoTitle,
    description: config.seoDescription,
    images: config.heroImage ? [config.heroImage] : [],
  },
};

export default function ColecionaveisGeek3DPage() {
  return <SalesLandingPage landingKey="geek" />;
}
