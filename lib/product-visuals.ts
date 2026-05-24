import type { Product } from "@/lib/catalog";
import { getCatalogPhotoCandidates, getCatalogPhotoEntry } from "@/lib/catalog-photo-manifest";
import { normalizePublicTaxonomyText } from "@/lib/catalog-taxonomy";
import realImageStatusJson from "@/data/real-image-status.json";
import type { RealImageStatusRecord } from "@/types/admin-catalog";

export type ProductVisualKind = "foto-real" | "render-fiel" | "imagem-conceitual";

type ProductVisualOverride = {
  kind: ProductVisualKind;
  imageCandidates?: string[];
  note?: string;
  recommendedNextStep?: string;
  merchantReady?: boolean;
};

export type ProductVisualSummary = {
  kind: ProductVisualKind;
  label: string;
  badgeClassName: string;
  panelClassName: string;
  description: string;
  note?: string;
  recommendedNextStep: string;
  merchantReady: boolean;
  imageCandidates: string[];
};

export const realCaseStudies = [
  {
    id: "case-grinder",
    title: "Grinder com imagem do produto",
    image: "/products/foto-001-grinder-01.webp",
    href: "/checkout",
  },
  {
    id: "case-porta-creme",
    title: "Porta creme dental com imagem do produto",
    image: "/products/foto-003-porta-creme-dental.webp",
    href: "/checkout",
  },
  {
    id: "case-demogorgon",
    title: "Miniatura temática com imagem do produto",
    image: "/products/foto-004-demogorgon.webp",
    href: "/checkout",
  },
  {
    id: "case-familia",
    title: "Família custom com imagem do produto",
    image: "/products/foto-007-familia-custom.webp",
    href: "/checkout",
  },
  {
    id: "case-chaveiro",
    title: "Chaveiro personalizado com imagem do produto",
    image: "/products/foto-011-chaveiro-maconaria.webp",
    href: "/checkout",
  },
  {
    id: "case-isqueiro",
    title: "Case de isqueiro com imagem do produto",
    image: "/products/foto-009-case-isqueiro-caveira.webp",
    href: "/checkout",
  },
  {
    id: "case-grinder-2",
    title: "Grinder em outro ângulo",
    image: "/products/foto-002-grinder-02.webp",
    href: "/checkout",
  },
  {
    id: "case-hello-kitty",
    title: "Peça temática com imagem do produto",
    image: "/products/foto-005-hello-kitty-jedi.webp",
    href: "/checkout",
  },
  {
    id: "case-stencil",
    title: "Stencil com imagem do produto",
    image: "/products/foto-006-stencil-rick-morty.webp",
    href: "/checkout",
  },
  {
    id: "case-boneca",
    title: "Boneca impressa com imagem do produto",
    image: "/products/foto-008-boneca-crianca.webp",
    href: "/checkout",
  },
  {
    id: "case-homer-pikachu",
    title: "Figura temática com imagem do produto",
    image: "/products/foto-010-homer-pikachu.webp",
    href: "/checkout",
  },
] as const;

const PRODUCT_VISUAL_OVERRIDES: Record<string, ProductVisualOverride> = {
  "mdh-016": {
    kind: "foto-real",
    imageCandidates: ["/products/foto-011-chaveiro-maconaria.webp"],
    note: "A imagem exibida mostra um exemplo validado de chaveiro personalizado já produzido no ateliê.",
    recommendedNextStep: "Capturar novos ângulos por variação de nome, cor e acabamento para ampliar o portfólio.",
    merchantReady: true,
  },
  "mdh-057": {
    kind: "imagem-conceitual",
    note: "ATENÇÃO: A imagem atual é um blob abstrato gerado por IA que NÃO corresponde a um organizador de maquiagem. Aguardando substituição por mídia validada do produto.",
    recommendedNextStep: "Publicar imagem própria do organizador de maquiagem ou visual técnico derivado do arquivo 3MF/STL. Remover imagem conceitual enganosa.",
    merchantReady: false,
  },
};

const realImageStatusMap = realImageStatusJson as Record<string, RealImageStatusRecord>;

function getVisualDefaults(kind: ProductVisualKind) {
  switch (kind) {
    case "foto-real":
      return {
        label: "Imagem do produto",
        badgeClassName: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
        panelClassName: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
        description: "A imagem mostra uma peça já produzida pela MDH 3D, usada como referência direta de acabamento, escala e presença física.",
        recommendedNextStep: "Continuar capturando mais ângulos e variações de cor do mesmo item para escalar o catálogo.",
        merchantReady: true,
      };
    case "render-fiel":
      return {
        label: "Visual validado",
        badgeClassName: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
        panelClassName: "border-cyan-400/20 bg-cyan-400/10 text-cyan-50",
        description:
          "A imagem mostra uma referência visual validada do produto ou do modelo 3D equivalente, usada para avaliar forma, escala e acabamento antes da compra.",
        recommendedNextStep:
          "Anexar STL, OBJ, 3MF ou imagem própria da peça produzida para manter a trilha técnica auditável.",
        merchantReady: true,
      };
    default:
      return {
        label: "Mídia do catálogo",
        badgeClassName: "border-amber-300/25 bg-amber-300/10 text-amber-100",
        panelClassName: "border-amber-400/20 bg-amber-400/10 text-amber-50",
        description:
          "A imagem apresenta a ideia visual do produto anunciado e ajuda a entender forma, proposta e estilo antes da validação final.",
        recommendedNextStep:
          "Substituir por imagem própria da peça pronta ou por visual técnico derivado do arquivo STL/OBJ/3MF correspondente.",
        merchantReady: false,
      };
  }
}

function inferKindFromImages(product: Product): ProductVisualKind {
  if (realImageStatusMap[product.id]?.status === "real") return "foto-real";
  if (product.makerWorldMeta?.sourceImageUrl === "local-manual-photo-override") return "foto-real";
  if (
    product.image?.includes("/products/a1-mini-expansion/") &&
    product.makerWorldMeta?.sourceImageUrl &&
    product.makerWorldMeta.sourceImageUrl !== "local-semantic-render"
  ) {
    return "render-fiel";
  }
  const sources = [...(product.images || []), product.image || ""].join(" ").toLowerCase();
  if (sources.includes("/products/foto-")) return "foto-real";
  if (sources.includes("/products/render-")) return "render-fiel";
  return "imagem-conceitual";
}

export function getProductVisual(product: Product): ProductVisualSummary {
  const override = PRODUCT_VISUAL_OVERRIDES[product.id];
  const catalogPhoto = getCatalogPhotoEntry(product.id);
  const realImageStatus = realImageStatusMap[product.id];
  const kind = override?.kind || (realImageStatus?.status === "real" ? "foto-real" : undefined) || catalogPhoto?.kind || inferKindFromImages(product);
  const defaults = getVisualDefaults(kind);
  const catalogPhotoCandidates = getCatalogPhotoCandidates(product.id);
  const modelReadyNote =
    catalogPhoto?.model3mf && kind !== "foto-real"
      ? "Este item também tem arquivo 3MF anexado para inspecionar a geometria do projeto antes de produzir."
      : catalogPhoto?.model3mf
        ? "Além da foto principal, este item também tem arquivo 3MF anexado para consulta técnica."
        : undefined;
  const validatedMediaNote =
    kind === "foto-real" && (catalogPhoto || realImageStatus)
      ? realImageStatus?.notes || "A vitrine usa mídia do objeto físico já impresso, preservando leitura de escala, material e acabamento."
      : undefined;

  return {
    kind,
    label: defaults.label,
    badgeClassName: defaults.badgeClassName,
    panelClassName: defaults.panelClassName,
    description: defaults.description,
    note: normalizePublicTaxonomyText(override?.note || validatedMediaNote || modelReadyNote || ""),
    recommendedNextStep: override?.recommendedNextStep || defaults.recommendedNextStep,
    merchantReady: override?.merchantReady ?? defaults.merchantReady,
    imageCandidates: override?.imageCandidates || realImageStatus?.gallery || catalogPhotoCandidates,
  };
}

export function getProductVisualImageCandidates(product: Product) {
  return getProductVisual(product).imageCandidates;
}

export function isProductPrimaryMediaValidated(product: Product) {
  return getProductVisual(product).kind === "foto-real";
}

export function isProductRenderFiel(product: Product) {
  return getProductVisual(product).kind === "render-fiel";
}

export function isProductVisualVerified(product: Product) {
  return getProductVisual(product).kind !== "imagem-conceitual";
}

export function summarizeProductVisuals(products: Product[]) {
  const summary = {
    total: products.length,
    fotoReal: 0,
    renderFiel: 0,
    imagemConceitual: 0,
    merchantReady: 0,
    realCaseStudies: realCaseStudies.length,
  };

  for (const product of products) {
    const visual = getProductVisual(product);
    if (visual.kind === "foto-real") summary.fotoReal += 1;
    if (visual.kind === "render-fiel") summary.renderFiel += 1;
    if (visual.kind === "imagem-conceitual") summary.imagemConceitual += 1;
    if (visual.merchantReady) summary.merchantReady += 1;
  }

  return summary;
}
