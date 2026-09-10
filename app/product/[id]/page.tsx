import { redirect } from "next/navigation";
import { getProductUrl } from "@/lib/catalog";
import { findCatalogProductBySlug } from "@/lib/catalog-repository";

export default async function ProductRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await findCatalogProductBySlug(id);
  redirect(product ? getProductUrl(product) : `/busca?q=${encodeURIComponent(id.replace(/[-_]+/g, " "))}`);
}
