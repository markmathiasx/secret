import ProductPage, {
  generateMetadata as generateCatalogProductMetadata,
} from "@/app/catalogo/[slug]/page";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { slugify } from "@/lib/utils";

export const revalidate = 300;
export const dynamic = "force-static";

export async function generateStaticParams() {
  const products = await getCatalogSnapshot();
  return products.map((product) => ({
    categoria: slugify(product.category),
    slug: `${product.id}-${product.slug || slugify(product.name)}`,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { slug } = await params;
  return generateCatalogProductMetadata({ params: Promise.resolve({ slug }) });
}

export default async function LojaProductPage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { slug } = await params;
  return ProductPage({ params: Promise.resolve({ slug }) });
}
