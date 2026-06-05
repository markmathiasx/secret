import type { Metadata } from "next";
import { IntentPageTemplate } from "@/components/commerce/IntentPageTemplate";
import { intentPageConfigs } from "@/lib/commerce/first-sale-products";

const config = intentPageConfigs["presentes-ate-50"];

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

export default function PresentesAte50Page() {
  return <IntentPageTemplate configKey="presentes-ate-50" />;
}
