import { buildCacheKey } from "@/src/lib/platform/cache/keys";
import { readThroughDal } from "@/src/lib/platform/data/dal";

export function getSupportFaqDal() {
  return readThroughDal(
    "support.faq",
    buildCacheKey("support:faq"),
    () => [
      "catalogo",
      "orcamento",
      "prazo de producao",
      "pix e cartao",
      "whatsapp humano",
    ],
    { ttlSeconds: 300, source: "support public knowledge" }
  );
}
