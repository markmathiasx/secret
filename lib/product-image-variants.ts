const PRODUCT_ASSET_PREFIX = "/products/";
const PRODUCT_PREVIEW_PREFIX = "/products/_preview/";
const PRODUCT_IMAGE_EXTENSION = /\.(?:avif|jpe?g|png|webp)$/i;

export function getProductPreviewImage(src: string | null | undefined): string | null {
  if (!src || !src.startsWith(PRODUCT_ASSET_PREFIX) || src.startsWith(PRODUCT_PREVIEW_PREFIX)) return null;
  if (!PRODUCT_IMAGE_EXTENSION.test(src)) return null;
  return `${PRODUCT_PREVIEW_PREFIX}${src.slice(PRODUCT_ASSET_PREFIX.length).replace(PRODUCT_IMAGE_EXTENSION, ".webp")}`;
}

export function withProductPreviewCandidates(candidates: string[]): string[] {
  const output: string[] = [];

  for (const candidate of candidates) {
    const preview = getProductPreviewImage(candidate);
    if (preview) output.push(preview);
    output.push(candidate);
  }

  return Array.from(new Set(output));
}
