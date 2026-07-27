import { redirect } from "next/navigation";
import { findProduct, getProductUrl } from "@/lib/catalog";

export default async function ProductRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = findProduct(id);
  redirect(product ? getProductUrl(product) : `/busca?q=${encodeURIComponent(id.replace(/[-_]+/g, " "))}`);
}
