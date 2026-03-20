import type { Product } from "@/lib/catalog";
import { slugify } from "@/lib/utils";

export type ProductGalleryFrame = {
  id: string;
  alt: string;
  frameIndex: number;
  candidates: string[];
};

const fileExtensions = ["webp", "jpg", "png"] as const;
const frameNames = [
  ["cover", "1", "2", "3"],
  ["2", "1", "3", "cover"],
  ["3", "2", "1", "cover"]
] as const;
const catalogFrameNames = [
  ["", "-1", "-cover"],
  ["-2", "-detail", ""],
  ["-3", "-angle", ""]
] as const;

function dedupe(values: string[]) {
  return Array.from(new Set(values));
}

export function getProductMediaSlug(product: Product) {
  return `${product.id}-${slugify(product.name)}`;
}

export function getProductImageCandidates(product: Product, frameIndex = 0) {
  const folders = [`/products/${getProductMediaSlug(product)}`, `/products/${product.id}`];
  const names = frameNames[frameIndex] || frameNames[0];
  const catalogNames = catalogFrameNames[frameIndex] || catalogFrameNames[0];

  const localFiles = folders.flatMap((folder) =>
    names.flatMap((name) => fileExtensions.map((extension) => `${folder}/${name}.${extension}`))
  );
  const catalogFiles = catalogNames.flatMap((name) =>
    fileExtensions.map((extension) => `/catalog-assets/${product.id}${name}.${extension}`)
  );

  return dedupe([...catalogFiles, ...localFiles, "/catalog-assets/product-concept.svg"]);
}

export function getProductGallery(product: Product): ProductGalleryFrame[] {
  return [0, 1, 2].map((frameIndex) => ({
    id: `${product.id}-${frameIndex}`,
    alt: `${product.name} - vista ${frameIndex + 1}`,
    frameIndex,
    candidates: getProductImageCandidates(product, frameIndex)
  }));
}
