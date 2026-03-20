import type { Metadata } from "next";
import { SalesLandingPage } from "@/components/sales-landing-page";
import { salesLandings } from "@/lib/sales-landings";

const config = salesLandings.decoracao;

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: {
    canonical: config.slug,
  },
};

export default function Decoracao3DParaCasaPage() {
  return <SalesLandingPage config={config} />;
}
