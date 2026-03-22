import type { Product } from "@/lib/catalog";
import { getCatalogPhotoCandidates, getCatalogPhotoEntry } from "@/lib/catalog-photo-manifest";

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
    title: "Grinder com foto real",
    image: "/products/foto-001-grinder-01.webp",
    href: "/checkout",
  },
  {
    id: "case-porta-creme",
    title: "Porta creme dental com foto real",
    image: "/products/foto-003-porta-creme-dental.webp",
    href: "/checkout",
  },
  {
    id: "case-demogorgon",
    title: "Miniatura temática com foto real",
    image: "/products/foto-004-demogorgon.webp",
    href: "/checkout",
  },
  {
    id: "case-familia",
    title: "Família custom com foto real",
    image: "/products/foto-007-familia-custom.webp",
    href: "/checkout",
  },
  {
    id: "case-chaveiro",
    title: "Chaveiro personalizado com foto real",
    image: "/products/foto-011-chaveiro-maconaria.webp",
    href: "/checkout",
  },
  {
    id: "case-isqueiro",
    title: "Case de isqueiro com foto real",
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
    title: "Peça temática com foto real",
    image: "/products/foto-005-hello-kitty-jedi.webp",
    href: "/checkout",
  },
  {
    id: "case-stencil",
    title: "Stencil com foto real",
    image: "/products/foto-006-stencil-rick-morty.webp",
    href: "/checkout",
  },
  {
    id: "case-boneca",
    title: "Boneca impressa com foto real",
    image: "/products/foto-008-boneca-crianca.webp",
    href: "/checkout",
  },
  {
    id: "case-homer-pikachu",
    title: "Figura temática com foto real",
    image: "/products/foto-010-homer-pikachu.webp",
    href: "/checkout",
  },
] as const;

const PRODUCT_VISUAL_OVERRIDES: Record<string, ProductVisualOverride> = {
  "mdh-016": {
    kind: "foto-real",
    imageCandidates: ["/products/foto-011-chaveiro-maconaria.webp"],
    note: "A foto exibida mostra um exemplo real de chaveiro personalizado já produzido no ateliê.",
    recommendedNextStep: "Capturar novas fotos reais por variação de nome, cor e acabamento para ampliar o portfólio.",
    merchantReady: true,
  },
};

function getVisualDefaults(kind: ProductVisualKind) {
  switch (kind) {
    case "foto-real":
      return {
        label: "Foto real",
        badgeClassName: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
        panelClassName: "border-emerald-400/20 bg-emerald-400/10 text-emerald-50",
        description: "A imagem mostra uma peça já produzida pela MDH 3D, usada como referência direta de acabamento, escala e presença real.",
        recommendedNextStep: "Continuar capturando mais ângulos e variações de cor do mesmo item para escalar o catálogo.",
        merchantReady: true,
      };
    case "render-fiel":
      return {
        label: "Render do produto",
        badgeClassName: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
        panelClassName: "border-cyan-400/20 bg-cyan-400/10 text-cyan-50",
        description: "A imagem foi gerada a partir do modelo 3D real da peça, preservando a geometria do produto antes da produção.",
        recommendedNextStep: "Anexar STL, OBJ ou 3MF correspondente para manter a trilha técnica auditável.",
        merchantReady: true,
      };
    default:
      return {
        label: "Referência visual",
        badgeClassName: "border-amber-300/25 bg-amber-300/10 text-amber-100",
        panelClassName: "border-amber-400/20 bg-amber-400/10 text-amber-50",
        description:
          "A imagem funciona como referência visual do produto anunciado. Ela ajuda a entender forma, proposta e estilo, mas não substitui foto real da peça pronta.",
        recommendedNextStep:
          "Substituir por foto real da peça pronta ou por render fiel derivado do arquivo STL/OBJ/3MF correspondente.",
        merchantReady: false,
      };
  }
}

function inferKindFromImages(product: Product): ProductVisualKind {
  const sources = [...(product.images || []), product.image || ""].join(" ").toLowerCase();
  if (sources.includes("/products/foto-")) return "foto-real";
  if (sources.includes("/products/render-")) return "render-fiel";
  return "imagem-conceitual";
}

export function getProductVisual(product: Product): ProductVisualSummary {
  const override = PRODUCT_VISUAL_OVERRIDES[product.id];
  const catalogPhoto = getCatalogPhotoEntry(product.id);
  const kind = override?.kind || catalogPhoto?.kind || inferKindFromImages(product);
  const defaults = getVisualDefaults(kind);
  const catalogPhotoCandidates = getCatalogPhotoCandidates(product.id);
  const realPhotoNote =
    kind === "foto-real" && catalogPhoto
      ? "A vitrine usa uma foto do objeto físico já impresso, preservando aparência real de escala, material e acabamento."
      : undefined;

  return {
    kind,
    label: defaults.label,
    badgeClassName: defaults.badgeClassName,
    panelClassName: defaults.panelClassName,
    description: defaults.description,
    note: override?.note || realPhotoNote,
    recommendedNextStep: override?.recommendedNextStep || defaults.recommendedNextStep,
    merchantReady: override?.merchantReady ?? defaults.merchantReady,
    imageCandidates: override?.imageCandidates || catalogPhotoCandidates,
  };
}

export function getProductVisualImageCandidates(product: Product) {
  return getProductVisual(product).imageCandidates;
}

export function isProductRealPhoto(product: Product) {
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
