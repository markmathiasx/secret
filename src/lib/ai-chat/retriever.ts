import { getAiContextDal } from "@/src/lib/platform/data/ai-context-dal";

export async function retrieveAiChatContext(query: string) {
  const context = await getAiContextDal();
  const normalized = query.toLowerCase();
  return {
    ...context,
    products: context.products.filter((product) => {
      const blob = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
      return !normalized || blob.includes(normalized) || normalized.includes("chaveiro") || normalized.includes("presente");
    }).slice(0, 5),
  };
}
