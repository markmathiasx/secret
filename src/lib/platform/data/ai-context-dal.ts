import { getCatalogProductsDal } from "@/src/lib/platform/data/catalog-dal";
import { getSupportFaqDal } from "@/src/lib/platform/data/support-dal";

export async function getAiContextDal() {
  const [products, faq] = await Promise.all([getCatalogProductsDal(), getSupportFaqDal()]);
  return {
    products: products.slice(0, 24).map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      pricePix: product.pricePix,
      priceCard: product.priceCard,
      category: product.category,
    })),
    faq,
  };
}
