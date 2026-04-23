import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SalesLandingShell } from "@/components/sales-landing-shell";
import {
  getDynamicSalesLandingStaticParams,
  getSalesLandingEntryBySlug,
  getSalesLandingMetadata,
} from "@/lib/sales-landings";

export const dynamicParams = false;
export const revalidate = 300;

export function generateStaticParams() {
  return getDynamicSalesLandingStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSalesLandingEntryBySlug(slug);

  if (!entry) {
    return {
      title: "Pagina nao encontrada",
    };
  }

  return getSalesLandingMetadata(entry[1]);
}

export default async function DynamicSalesLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getSalesLandingEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const [landingKey] = entry;

  return <SalesLandingShell landingKey={landingKey} />;
}
