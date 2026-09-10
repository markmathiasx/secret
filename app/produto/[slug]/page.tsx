import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";
import { getProductUrl } from "@/lib/product-routing";

export const dynamic = "force-dynamic";

type ProdutoPageProps = {
  params: Promise<{ slug: string }>;
};

function slugToSearchQuery(slug: string) {
  return slug
    .replace(/^[a-z]+-\d+-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);

  return product
    ? {
        title: product.name,
        description: product.description,
        alternates: { canonical: getProductUrl(product) },
        robots: { index: false, follow: true },
      }
    : {
        title: "Produto não encontrado | MDH 3D",
        robots: { index: false, follow: true },
      };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const product = await findCatalogProductBySlug(slug);

  if (product) redirect(getProductUrl(product));

  const query = slugToSearchQuery(slug);
  redirect(query ? `/busca?q=${encodeURIComponent(query)}` : "/catalogo");
}
