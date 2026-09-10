import fs from "node:fs";
import path from "node:path";
import { ROOT, createProjectRequire, writeJson } from "./ts-runtime.mjs";

const require = createProjectRequire();
const { catalog } = require("@/lib/catalog");
const { filterPublicCatalogProducts } = require("@/lib/public-catalog");
const { getProductCardImage, PRODUCT_CARD_PLACEHOLDER } = require("@/lib/product-card-image");
const { getProductVisual } = require("@/lib/product-visuals");
const a1ExpansionRows = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "a1-mini-expansion-500.json"), "utf8"));
const a1ExpansionById = new Map(a1ExpansionRows.map((row) => [row.id, row]));

const placeholderPath = path.join(ROOT, "public", PRODUCT_CARD_PLACEHOLDER.replace(/^\//, ""));
const cardPath = path.join(ROOT, "components", "product", "PremiumCard.tsx");
const publicProducts = filterPublicCatalogProducts(catalog);
const placeholderExists = fs.existsSync(placeholderPath);
const cardSource = fs.existsSync(cardPath) ? fs.readFileSync(cardPath, "utf8") : "";

const cardFallback = {
  hasCentralResolver: cardSource.includes("getProductCardImage(product)"),
  hasPlaceholderImport: cardSource.includes("PRODUCT_CARD_PLACEHOLDER"),
  hasOnErrorFallback: cardSource.includes("onError") && cardSource.includes("setImageSrc(PRODUCT_CARD_PLACEHOLDER)"),
  noMediaValidationGate: !/validateProductMedia|isPublicSafe/.test(cardSource),
  noNullReturn: !/return\s+null/.test(cardSource),
  hasNativeImage: /<img\s/.test(cardSource),
};

const rows = publicProducts.map((product) => {
  const image = getProductCardImage(product);
  const ownCandidates = image.candidates.filter((src) => src !== PRODUCT_CARD_PLACEHOLDER);
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category,
    src: image.src,
    source: image.source,
    usedPlaceholder: image.usedPlaceholder,
    ownCandidateCount: ownCandidates.length,
    ownCandidates: ownCandidates.slice(0, 5),
  };
});

const withOwnImage = rows.filter((row) => !row.usedPlaceholder);
const usingPlaceholder = rows.filter((row) => row.usedPlaceholder);
const possibleCardWithoutImage = rows.filter((row) => !row.src);
const cardFallbackOk = Object.values(cardFallback).every(Boolean);
const unsafeVisuals = publicProducts.filter((product) => !getProductVisual(product).merchantReady);
const a1Products = publicProducts.filter((product) => product.mediaProvenance?.provider === "MakerWorld");
const a1MediaIssues = a1Products.filter((product) => {
  const images = product.images || [];
  const source = a1ExpansionById.get(product.id);
  return (
    images.length !== 1 ||
    !/\/cover\.webp$/i.test(images[0] || "") ||
    images.some((source) => /02-closeup|03-angle|04-alt-color/i.test(source)) ||
    !/^https:\/\/makerworld\.com\//i.test(product.mediaProvenance?.sourceProductUrl || "") ||
    !isAuditableSourceImage(source?.sourceImageUrl)
  );
});
const normalizedA1Sources = a1Products.map((product) => {
  const source = a1ExpansionById.get(product.id)?.sourceImageUrl || "";
  try {
    return decodeURIComponent(source);
  } catch {
    return source;
  }
});
const duplicateA1Sources = normalizedA1Sources.filter((source, index) => normalizedA1Sources.indexOf(source) !== index);
const minimumCatalogSize = 500;

function isAuditableSourceImage(value) {
  return /^https:\/\//i.test(value || "") || value === "local-manual-photo-override";
}

const report = {
  generatedAt: new Date().toISOString(),
  ok:
    placeholderExists &&
    cardFallbackOk &&
    publicProducts.length >= minimumCatalogSize &&
    possibleCardWithoutImage.length === 0 &&
    usingPlaceholder.length === 0 &&
    unsafeVisuals.length === 0 &&
    a1MediaIssues.length === 0 &&
    duplicateA1Sources.length === 0,
  placeholder: {
    src: PRODUCT_CARD_PLACEHOLDER,
    exists: placeholderExists,
    path: path.relative(ROOT, placeholderPath).replaceAll("\\", "/"),
  },
  cardFallback,
  totalPublicProducts: publicProducts.length,
  totalWithOwnImage: withOwnImage.length,
  totalUsingPlaceholder: usingPlaceholder.length,
  possibleCardWithoutImage: possibleCardWithoutImage.length,
  minimumCatalogSize,
  unsafeVisuals: unsafeVisuals.map((product) => product.id),
  a1Products: a1Products.length,
  a1MediaIssues: a1MediaIssues.map((product) => product.id),
  duplicateA1Sources: [...new Set(duplicateA1Sources)],
  examplesWithImage: withOwnImage.slice(0, 20),
  examplesUsingPlaceholder: usingPlaceholder.slice(0, 20),
};

const rootCauseReport = {
  generatedAt: report.generatedAt,
  answers: {
    imageFieldInProducts:
      "Produtos estáticos expõem images[] e image. Produtos vindos do banco mapeiam media[] para images[] e image. O resolver também cobre imageGallery, gallery, imageUrl, primaryImage e thumbnail.",
    productCardReadsCorrectField:
      "Corrigido. O card agora usa getProductCardImage(product), que tenta imageGallery[0].url, imageGallery[0].src, gallery[0].url, gallery[0].src, images[0], image, imageUrl, primaryImage, thumbnail e por fim placeholder.",
    mediaValidationWasHidingProducts:
      "A vitrine agora bloqueia somente mídia conceitual, placeholder ou inconsistente e mantém no mínimo 500 produtos com origem auditável.",
    cssWasHidingImages:
      "Não foi encontrada regra de card com opacity 0, display none, height 0 ou z-index escondendo a mídia. O card novo força aspect-square, img visível, object-cover e opacity-100.",
    nextImageRemoteBlocking:
      "Não foi a causa principal para imagens locais, e next.config já usa images.unoptimized. Para reduzir risco em produção, o ProductCard usa img nativo com onError para placeholder local.",
    catalogHtmlImageSignals:
      "A validação de HTML pós-build verifica <img, src, data-product-card, placeholder, Comprar, WhatsApp, Pix e Cartão em /catalogo.",
    productsWithoutOwnImage:
      usingPlaceholder.map((row) => ({ id: row.id, sku: row.sku, name: row.name })).slice(0, 50),
    fallbackUsed:
      `${PRODUCT_CARD_PLACEHOLDER} é renderizado como src inicial quando não existe mídia e também no onError quando qualquer imagem falha.`,
  },
  totals: {
    totalPublicProducts: report.totalPublicProducts,
    totalWithOwnImage: report.totalWithOwnImage,
    totalUsingPlaceholder: report.totalUsingPlaceholder,
  },
};

writeJson("reports/catalog-card-images-report.json", report);
writeJson("reports/card-image-root-cause-report.json", rootCauseReport);

if (!placeholderExists) {
  console.error(`Falha: placeholder obrigatório não existe em ${PRODUCT_CARD_PLACEHOLDER}.`);
  process.exit(1);
}

if (!cardFallbackOk) {
  console.error("Falha: ProductCard não tem fallback de imagem completo.");
  console.error(JSON.stringify(cardFallback, null, 2));
  process.exit(1);
}

if (possibleCardWithoutImage.length) {
  console.error(`Falha: ${possibleCardWithoutImage.length} cards poderiam renderizar sem imagem.`);
  process.exit(1);
}

if (!report.ok) {
  console.error("Falha: catálogo público não atende ao gate de autenticidade e cobertura.");
  console.error(JSON.stringify({
    totalPublicProducts: publicProducts.length,
    minimumCatalogSize,
    totalUsingPlaceholder: usingPlaceholder.length,
    unsafeVisuals: report.unsafeVisuals,
    a1MediaIssues: report.a1MediaIssues,
    duplicateA1Sources: report.duplicateA1Sources,
  }, null, 2));
  process.exit(1);
}

console.log(`OK: ${publicProducts.length} cards públicos com mídia própria e auditável.`);
console.log(`${a1Products.length} referências MakerWorld sem galerias sintéticas; 0 placeholders.`);
