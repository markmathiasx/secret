import a1MiniCatalogIdsJson from "@/data/a1-mini-catalog-ids.json";
import type { Product } from "@/lib/catalog";

export const A1_MINI_COLLECTION = "A1 Mini Vendáveis";

const a1MiniCatalogIds = new Set(a1MiniCatalogIdsJson as string[]);

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferObjectType(product: Product) {
  const blob = normalizeText(`${product.name} ${product.category} ${product.subcategory} ${product.tags.join(" ")}`);

  if (blob.includes("chaveiro") || blob.includes("pingente") || blob.includes("medalha")) return "chaveiro";
  if (blob.includes("suporte") || blob.includes("holder") || blob.includes("stand")) return "suporte";
  if (blob.includes("organizador") || blob.includes("porta ") || blob.includes("caixa")) return "organizador";
  if (blob.includes("articulado") || blob.includes("articulada")) return "articulado";
  if (blob.includes("mini") || blob.includes("chibi") || blob.includes("estatua") || blob.includes("colecionavel")) return "miniatura";
  if (blob.includes("vaso") || blob.includes("quadro") || blob.includes("luminaria") || blob.includes("decor")) return "decoracao";
  if (blob.includes("presente") || blob.includes("personalizado") || blob.includes("familia") || blob.includes("nome")) return "presente";
  return "utilidade leve";
}

function inferUse(product: Product, objectType: string) {
  if (objectType === "chaveiro") return "venda por impulso, lembrancinha, mochila, chaves e kits de presente";
  if (objectType === "suporte") return "setup, home office, mesa gamer e organizacao de bancada";
  if (objectType === "organizador") return "mesa, gaveta, bancada criativa e rotina de trabalho";
  if (objectType === "articulado") return "colecao, presente geek e peca divertida de mesa";
  if (objectType === "miniatura") return "colecao, estante, nicho, setup gamer e presente tematico";
  if (objectType === "decoracao") return "decoracao de quarto, escritorio, estante e composicao de ambiente";
  if (objectType === "presente") return "presente personalizado, lembranca afetiva e encomenda sob medida";
  return "uso diario, organizacao leve e presente funcional";
}

function buildA1MiniDescription(product: Product) {
  const objectType = inferObjectType(product);
  const use = inferUse(product, objectType);
  const material = product.material || "PLA Premium";
  const finish = product.finish?.toLowerCase() || "premium";

  return `${product.name} selecionado para producao em Bambu Lab A1 Mini, com volume compacto, boa leitura visual e acabamento ${finish} em ${material}. Indicado para ${use}, mantendo prazo claro e apresentacao pronta para venda online.`;
}

function extractEntity(product: Product) {
  const stopWords = new Set([
    "premium",
    "dupla",
    "face",
    "para",
    "mesa",
    "gamer",
    "setup",
    "mini",
    "pingente",
    "decorativo",
    "colecionavel",
    "edicao",
    "chaveiro",
    "suporte",
    "organizador",
    "porta",
    "ferramentas",
    "multiuso",
  ]);
  const words = normalizeText(product.name)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return words.slice(0, 3).join(" ") || normalizeText(product.subcategory || product.name);
}

export function getA1MiniImageSearchQueries(product: Product) {
  const entity = extractEntity(product);
  const objectType = inferObjectType(product);

  if (objectType === "chaveiro") {
    return [`${entity} 3d printed keychain`, `${entity} keychain 3d print`, `${entity} miniatura 3d`];
  }

  if (objectType === "suporte") {
    return [`${entity} 3d printed holder`, `${entity} 3d printed stand`, `${entity} impressao 3d`];
  }

  if (objectType === "organizador") {
    return [`${entity} 3d printed organizer`, `${entity} 3d printed holder`, `${entity} impressao 3d`];
  }

  return [`${entity} 3d printed figure`, `${entity} 3d print`, `${entity} miniatura 3d`];
}

export function isA1MiniCatalogProduct(product: Pick<Product, "id">) {
  return a1MiniCatalogIds.has(product.id);
}

export function applyA1MiniProfile(product: Product): Product {
  if (!isA1MiniCatalogProduct(product)) return product;

  const objectType = inferObjectType(product);

  return {
    ...product,
    collection: A1_MINI_COLLECTION,
    description: buildA1MiniDescription(product),
    imageAlt: product.imageAlt || `${product.name} impresso em 3D para Bambu Lab A1 Mini`,
    tags: unique([
      ...product.tags,
      "a1-mini",
      "bambu-lab-a1-mini",
      "catalogo-100",
      objectType,
      ...getA1MiniImageSearchQueries(product),
    ]),
  };
}
