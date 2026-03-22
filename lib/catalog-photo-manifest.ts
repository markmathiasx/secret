import manifest from "@/data/catalog-photo-manifest.json";

export type CatalogPhotoKind = "foto-real" | "render-fiel" | "imagem-conceitual";

export type CatalogPhotoEntry = {
  id: string;
  name: string;
  sourceFilename: string;
  kind: CatalogPhotoKind;
  gallery?: string[];
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

  const base = `/products/catalog/${id}`;
  return [`${base}.webp`, `${base}.png`, `${base}.jpg`, `${base}.jpeg`];
}

export function hasExplicitCatalogGallery(id: string) {
  const entry = catalogPhotoEntryMap.get(id);
  return Boolean(entry?.gallery?.length);
}

export function listCatalogPhotoEntries() {
  return catalogPhotoEntries;
}
