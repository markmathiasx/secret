import type { Product } from "@/lib/catalog";

function encodeSvg(content: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(content)}`;
}

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export type ProductMediaLike = Pick<Product, "name" | "sku" | "category"> & {
  imagePath?: string | null;
  imageAlt?: string | null;
  imageStatus?: Product["imageStatus"] | null;
  collection?: string | null;
  theme?: string | null;
  merchandising?: string | null;
  productionWindow?: string | null;
  grams?: number | null;
  hours?: number | null;
};

export type ProductMediaAsset = {
  id: string;
  src: string;
  alt: string;
  label: string;
  caption: string;
  kind: "hero" | "detail" | "lifestyle";
  objectPosition: string;
  isPlaceholder: boolean;
};

export function makeProductPlaceholder(product: Pick<Product, "name" | "sku" | "category">) {
  const safeName = escapeSvgText(product.name);
  const safeSku = escapeSvgText(product.sku);
  const safeCategory = escapeSvgText(product.category);

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="55%" stop-color="#082f49" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
        <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" rx="72" fill="url(#bg)" />
      <circle cx="980" cy="220" r="180" fill="#22d3ee" fill-opacity="0.08" />
      <circle cx="230" cy="1040" r="220" fill="#10b981" fill-opacity="0.08" />
      <rect x="64" y="64" width="1072" height="1072" rx="56" stroke="url(#line)" stroke-opacity="0.6" />
      <text x="96" y="150" fill="#67e8f9" font-size="34" font-family="Arial, sans-serif" letter-spacing="10">MDH 3D</text>
      <text x="96" y="1030" fill="#ffffff" fill-opacity="0.55" font-size="34" font-family="Arial, sans-serif">${safeSku}</text>
      <text x="96" y="950" fill="#ffffff" fill-opacity="0.7" font-size="42" font-family="Arial, sans-serif">${safeCategory}</text>
      <foreignObject x="96" y="240" width="1008" height="560">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;height:100%;align-items:center;color:white;font-family:Arial,sans-serif;font-size:72px;font-weight:700;line-height:1.1;">
          ${safeName}
        </div>
      </foreignObject>
    </svg>
  `);
}

export function getProductImageSrc(product: Pick<Product, "name" | "sku" | "category"> & { imagePath?: string | null }) {
  return product.imagePath || makeProductPlaceholder(product);
}

export function isProductPlaceholder(product: ProductMediaLike) {
  return !product.imagePath || product.imageStatus === "placeholder" || product.imageStatus === "failed";
}

export function getProductPrimaryMedia(product: ProductMediaLike): ProductMediaAsset {
  const isPlaceholder = isProductPlaceholder(product);
  const src = getProductImageSrc(product);

  return {
    id: `${product.sku}-hero`,
    src,
    alt: product.imageAlt || `${product.name} - hero do produto`,
    label: isPlaceholder ? "Visual da colecao" : "Foto principal",
    caption: isPlaceholder
      ? "Apresentacao criada para mostrar estilo, proporcao e presenca visual da peca com clareza na vitrine."
      : product.merchandising || "Foto principal da peca na colecao da MDH 3D.",
    kind: "hero",
    objectPosition: "center center",
    isPlaceholder
  };
}

function getDetailCaption(product: ProductMediaLike) {
  const parts = [
    typeof product.grams === "number" ? `${product.grams} g` : null,
    typeof product.hours === "number" ? `${product.hours} h de impressao` : null,
    product.productionWindow || null
  ].filter(Boolean);

  return parts.length
    ? `Tamanho, acabamento e prazo em uma leitura rapida: ${parts.join(" • ")}.`
    : "Detalhe pensado para valorizar acabamento, escala e presenca visual.";
}

function getLifestyleCaption(product: ProductMediaLike) {
  const parts = [product.collection || null, product.theme || null, product.category].filter(Boolean);
  return `Inspiracao de uso para ${parts.join(" • ")} em uma composicao elegante e comercial.`;
}

export function getProductGallerySources(product: ProductMediaLike): ProductMediaAsset[] {
  const primary = getProductPrimaryMedia(product);

  return [
    primary,
    {
      ...primary,
      id: `${product.sku}-detail`,
      label: "Detalhe e escala",
      alt: product.imageAlt || `${product.name} - detalhe e escala`,
      caption: getDetailCaption(product),
      kind: "detail",
      objectPosition: "center 42%"
    },
    {
      ...primary,
      id: `${product.sku}-lifestyle`,
      label: "Uso e ambientacao",
      alt: product.imageAlt || `${product.name} - ambientacao`,
      caption: getLifestyleCaption(product),
      kind: "lifestyle",
      objectPosition: "center 58%"
    }
  ];
}
