import { redirect } from "next/navigation";
import { findProductBySlug, getProductUrl } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function slugToSearchQuery(slug: string) {
  return slug
    .replace(/^[a-z]+-\d+-/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (product) {
    redirect(getProductUrl(product));
  }

  const query = slugToSearchQuery(slug);
  redirect(query ? `/busca?q=${encodeURIComponent(query)}` : "/catalogo");
}
