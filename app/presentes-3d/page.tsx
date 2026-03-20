import type { Metadata } from "next";
import { SalesLandingPage } from "@/components/sales-landing-page";
import { salesLandings } from "@/lib/sales-landings";

const config = salesLandings.presentes;

export const metadata: Metadata = {
  title: config.seoTitle,
  description: config.seoDescription,
  alternates: {
    canonical: config.slug,
  },
};

export default function Presentes3DPage() {
  return <SalesLandingPage config={config} />;
}
