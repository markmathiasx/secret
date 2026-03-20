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
};

export default function ColecionaveisGeek3DPage() {
  return <SalesLandingPage config={config} />;
}
