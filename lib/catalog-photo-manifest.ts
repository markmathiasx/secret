import manifest from "@/data/catalog-photo-manifest.json";

export type CatalogPhotoKind = "foto-real" | "render-fiel" | "imagem-conceitual";

export type CatalogModelPlateEntry = {
  index: number;
  preview: string;
  previewNoLight?: string;
  top?: string;
  pick?: string;
};

export type CatalogModelPreviewEntry = {
  source: "bambu-3mf";
  plateCount: number;
  plates: CatalogModelPlateEntry[];
};

export type CatalogPhotoEntry = {
  id: string;
  name: string;
  sourceFilename: string;
  kind: CatalogPhotoKind;
  gallery?: string[];
  model3mf?: string;
  modelPreview?: CatalogModelPreviewEntry;
};

const catalogPhotoEntries = manifest as CatalogPhotoEntry[];
const catalogPhotoEntryMap = new Map(catalogPhotoEntries.map((entry) => [entry.id, entry]));

export function getCatalogPhotoEntry(id: string) {
  return catalogPhotoEntryMap.get(id);
}

export function getCatalogPhotoCandidates(id: string) {
  const entry = catalogPhotoEntryMap.get(id);
  if (!entry) return [];
  if (Array.isArray(entry.gallery) && entry.gallery.length) {
    return entry.gallery;
  }
  if (!/\.(jpg|jpeg|png|webp)$/i.test(entry.sourceFilename)) {
    return [];
  }

  const base = `/products/catalog/${id}`;
  return [`${base}.webp`, `${base}.png`, `${base}.jpg`, `${base}.jpeg`];
}

export function hasExplicitCatalogGallery(id: string) {
  const entry = catalogPhotoEntryMap.get(id);
  return Boolean(entry?.gallery?.length);
}

export function getCatalogModelPreview(id: string) {
  return catalogPhotoEntryMap.get(id)?.modelPreview || null;
}

export function listCatalogPhotoEntries() {
  return catalogPhotoEntries;
}
