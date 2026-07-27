import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LojaProductPage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/catalogo/${slug}`);
}
