import type { Metadata } from "next";
import { IntentPageTemplate } from "@/components/commerce/IntentPageTemplate";
import { intentPageConfigs } from "@/lib/commerce/first-sale-products";

const config = intentPageConfigs["setup-gamer"];

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  alternates: { canonical: config.slug },
  openGraph: {
    title: config.title,
    description: config.description,
    url: config.slug,
  },
};

export default function SetupGamerPage() {
  return <IntentPageTemplate configKey="setup-gamer" />;
}
