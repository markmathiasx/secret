import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import photoManifestJson from "@/data/catalog-photo-manifest.json";
import galleryMapJson from "@/data/product-gallery-map.json";
import productImageMapJson from "@/product-image-map.json";
import plannedProductImageMapJson from "@/planned-product-image-map.json";
import realImageStatusJson from "@/data/real-image-status.json";
import { catalog } from "@/lib/catalog";
import { slugify } from "@/lib/utils";
import type { Product } from "@/lib/catalog";
import type { RealImageStatusRecord } from "@/types/admin-catalog";

const SLOT_FILES = ["01-hero.jpg", "02-closeup.jpg", "03-in_use.jpg", "04-packshot.jpg"] as const;
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const PRODUCT_IMAGE_MAP_PATH = path.join(process.cwd(), "product-image-map.json");
const PLANNED_IMAGE_MAP_PATH = path.join(process.cwd(), "planned-product-image-map.json");
const GALLERY_MAP_PATH = path.join(process.cwd(), "data", "product-gallery-map.json");
const REAL_STATUS_PATH = path.join(process.cwd(), "data", "real-image-status.json");
const PROMPTS_PATH = path.join(process.cwd(), "prompts_txt", "full_product_image_prompts_v2.json");

type CatalogPhotoManifestEntry = {
  id: string;
  kind: "foto-real" | "render-fiel" | "imagem-conceitual";
  gallery?: string[];
  sourceFilename?: string;
};

type ReplacementSource = {
  productId: string;
  sources: string[];
  sourceType: string;
  notes?: string;
};

export type ReplaceCatalogImagesOptions = {
  manifestPath?: string;
  sourceDir?: string;
  dryRun?: boolean;
};

export type ReplaceCatalogImagesReport = {
  totalProducts: number;
  sourceCandidates: number;
  replacedProducts: number;
  replacedFiles: number;
  skippedProducts: number;
  promptCatalogCount: number;
  replacedIds: string[];
  skippedIds: string[];
  missingIds: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function toProductFolder(product: Product) {
  const baseSlug = product.slug || slugify(product.name);
  return `${product.id}-${baseSlug}`;
}

function toPublicGallery(folderName: string) {
  return SLOT_FILES.map((file) => `/products/${folderName}/${file}`);
}

function toAbsolutePublicPath(publicSrc: string) {
  return path.join(process.cwd(), "public", publicSrc.replace(/^\//, ""));
}

function buildDefaultCatalogPhotoPath(productId: string) {
  return `/products/catalog/${productId}.webp`;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function findProductByReference(reference: string) {
  const normalized = reference.trim().toLowerCase();
  return (
    catalog.find((product) => product.id.toLowerCase() === normalized) ||
    catalog.find((product) => (product.slug || slugify(product.name)).toLowerCase() === normalized) ||
    catalog.find((product) => toProductFolder(product).toLowerCase() === normalized)
  );
}

function extractImages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => extractImages(item));
  if (!isRecord(value)) return [];

  return unique([
    ...extractImages(value.images),
    ...extractImages(value.urls),
    ...extractImages(value.gallery),
    ...extractImages(value.hero),
    ...extractImages(value.closeup),
    ...extractImages(value.in_use),
    ...extractImages(value.packshot),
    ...extractImages(value.packShot),
  ]);
}

function resolveLocalOrRemoteSource(source: string, relativeTo?: string) {
  if (/^https?:\/\//i.test(source)) return source;
  if (source.startsWith("/")) return toAbsolutePublicPath(source);
  return relativeTo ? path.resolve(relativeTo, source) : path.resolve(source);
}

async function collectBuiltInSources() {
  const entries = photoManifestJson as CatalogPhotoManifestEntry[];
  const sourceMap = new Map<string, ReplacementSource>();

  for (const entry of entries) {
    if (entry.kind !== "foto-real") continue;
    const product = catalog.find((item) => item.id === entry.id);
    if (!product) continue;

    const sources = unique((entry.gallery && entry.gallery.length ? entry.gallery : [buildDefaultCatalogPhotoPath(entry.id)]).map((item) => toAbsolutePublicPath(item)));
    if (!sources.length) continue;
    sourceMap.set(product.id, {
      productId: product.id,
      sources,
      sourceType: "catalog-photo-manifest",
      notes: "Mídias validadas copiadas do acervo local da MDH 3D.",
    });
  }

  for (const [productId, src] of Object.entries(productImageMapJson as Record<string, string>)) {
    if (!src.startsWith("/products/foto-")) continue;
    const product = catalog.find((item) => item.id === productId);
    if (!product) continue;
    const absolute = toAbsolutePublicPath(src);
    sourceMap.set(product.id, {
      productId: product.id,
      sources: [absolute],
      sourceType: "verified-real-manifest",
      notes: "Mídia validada já validada no catálogo verificado.",
    });
  }

  return sourceMap;
}

async function collectManifestSources(manifestPath?: string) {
  const sourceMap = new Map<string, ReplacementSource>();
  if (!manifestPath) return sourceMap;

  const absolutePath = path.resolve(manifestPath);
  const manifest = await readJsonFile<unknown>(absolutePath, {});
  const baseDir = path.dirname(absolutePath);

  if (Array.isArray(manifest)) {
    for (const entry of manifest) {
      if (!isRecord(entry)) continue;
      const ref = [entry.productId, entry.slug, entry.id].find((value) => typeof value === "string") as string | undefined;
      if (!ref) continue;
      const product = findProductByReference(ref);
      if (!product) continue;
      const sources = unique(extractImages(entry).map((item) => resolveLocalOrRemoteSource(item, baseDir)));
      if (!sources.length) continue;
      sourceMap.set(product.id, {
        productId: product.id,
        sources,
        sourceType: "external-manifest",
        notes: "Mídias validadas importadas a partir de manifest externo.",
      });
    }
    return sourceMap;
  }

  if (!isRecord(manifest)) return sourceMap;

  for (const [key, value] of Object.entries(manifest)) {
    const product = findProductByReference(key);
    if (!product) continue;
    const sources = unique(extractImages(value).map((item) => resolveLocalOrRemoteSource(item, baseDir)));
    if (!sources.length) continue;
    sourceMap.set(product.id, {
      productId: product.id,
      sources,
      sourceType: "external-manifest",
      notes: "Mídias validadas importadas a partir de manifest externo.",
    });
  }

  return sourceMap;
}

async function collectDirectorySources(sourceDir?: string) {
  const sourceMap = new Map<string, ReplacementSource>();
  if (!sourceDir) return sourceMap;

  const absoluteDir = path.resolve(sourceDir);
  const topLevelItems = await fs.readdir(absoluteDir, { withFileTypes: true }).catch(() => []);
  const topLevelFiles = topLevelItems
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name);

  for (const product of catalog) {
    const folderName = toProductFolder(product);
    const localDirCandidates = [folderName, product.id, product.slug || slugify(product.name)]
      .map((candidate) => path.join(absoluteDir, candidate))
      .filter((candidate, index, values) => values.indexOf(candidate) === index);

    let resolvedSources: string[] = [];

    for (const candidateDir of localDirCandidates) {
      const entries = await fs.readdir(candidateDir, { withFileTypes: true }).catch(() => []);
      const files = entries
        .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map((entry) => path.join(candidateDir, entry.name))
        .sort((left, right) => left.localeCompare(right));

      if (files.length) {
        resolvedSources = files;
        break;
      }
    }

    if (!resolvedSources.length) {
      const topLevelMatches = topLevelFiles
        .filter((file) => {
          const lower = file.toLowerCase();
          return (
            lower.includes(folderName.toLowerCase()) ||
            lower.includes(product.id.toLowerCase()) ||
            lower.includes((product.slug || slugify(product.name)).toLowerCase())
          );
        })
        .map((file) => path.join(absoluteDir, file))
        .sort((left, right) => left.localeCompare(right));

      resolvedSources = topLevelMatches;
    }

    if (!resolvedSources.length) continue;

    sourceMap.set(product.id, {
      productId: product.id,
      sources: unique(resolvedSources),
      sourceType: "source-directory",
      notes: "Mídias validadas importadas de lote local.",
    });
  }

  return sourceMap;
}

function mergeSourceMaps(...maps: Array<Map<string, ReplacementSource>>) {
  const merged = new Map<string, ReplacementSource>();

  for (const map of maps) {
    for (const [productId, entry] of map.entries()) {
      const existing = merged.get(productId);
      if (!existing) {
        merged.set(productId, entry);
        continue;
      }

      merged.set(productId, {
        ...existing,
        sourceType: entry.sourceType,
        notes: entry.notes || existing.notes,
        sources: unique([...existing.sources, ...entry.sources]),
      });
    }
  }

  return merged;
}

async function sourceToBuffer(source: string) {
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Falha ao baixar ${source}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  return fs.readFile(source);
}

async function writeNormalizedImage(source: string, targetPath: string) {
  const buffer = await sourceToBuffer(source);
  await sharp(buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toFile(targetPath);
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function countPromptCatalogProducts() {
  const promptsPayload = await readJsonFile<Record<string, unknown>>(PROMPTS_PATH, {});
  if (Array.isArray(promptsPayload.products)) return promptsPayload.products.length;
  if (Array.isArray(promptsPayload.items)) return promptsPayload.items.length;
  if (typeof promptsPayload.productCount === "number") return promptsPayload.productCount;
  return 0;
}

export async function replaceCatalogImages(options: ReplaceCatalogImagesOptions = {}): Promise<ReplaceCatalogImagesReport> {
  const builtInSources = await collectBuiltInSources();
  const manifestSources = await collectManifestSources(options.manifestPath);
  const directorySources = await collectDirectorySources(options.sourceDir);
  const mergedSources = mergeSourceMaps(builtInSources, manifestSources, directorySources);

  const galleryMap = { ...(galleryMapJson as Record<string, string[]>) };
  const productImageMap = { ...(productImageMapJson as Record<string, string>) };
  const plannedImageMap = { ...(plannedProductImageMapJson as Record<string, string>) };
  const realImageStatus = { ...(realImageStatusJson as Record<string, RealImageStatusRecord>) };

  let replacedProducts = 0;
  let replacedFiles = 0;
  const replacedIds: string[] = [];
  const skippedIds: string[] = [];
  const missingIds: string[] = [];

  for (const product of catalog) {
    const sourceEntry = mergedSources.get(product.id);
    if (!sourceEntry?.sources.length) {
      missingIds.push(product.id);
      continue;
    }

    const folderName = toProductFolder(product);
    const targetDir = path.join(process.cwd(), "public", "products", folderName);
    const publicGallery = toPublicGallery(folderName);

    let productWritten = true;

    if (!options.dryRun) {
      await fs.mkdir(targetDir, { recursive: true });

      for (let index = 0; index < SLOT_FILES.length; index += 1) {
        const targetName = SLOT_FILES[index];
        const targetPath = path.join(targetDir, targetName);
        let wroteSlot = false;

        for (let offset = 0; offset < sourceEntry.sources.length; offset += 1) {
          const source = sourceEntry.sources[(index + offset) % sourceEntry.sources.length];

          try {
            await writeNormalizedImage(source, targetPath);
            replacedFiles += 1;
            wroteSlot = true;
            break;
          } catch {
            continue;
          }
        }

        if (!wroteSlot) {
          productWritten = false;
          skippedIds.push(product.id);
          break;
        }
      }
    }

    if (!productWritten) {
      continue;
    }

    galleryMap[product.id] = publicGallery;
    productImageMap[product.id] = publicGallery[0];
    plannedImageMap[product.id] = publicGallery[0];
    realImageStatus[product.id] = {
      status: "real",
      sourceType: sourceEntry.sourceType,
      sourceCount: sourceEntry.sources.length,
      updatedAt: new Date().toISOString(),
      gallery: publicGallery,
      notes: sourceEntry.notes,
    };

    replacedProducts += 1;
    replacedIds.push(product.id);
  }

  if (!options.dryRun) {
    await writeJsonFile(GALLERY_MAP_PATH, galleryMap);
    await writeJsonFile(PRODUCT_IMAGE_MAP_PATH, productImageMap);
    await writeJsonFile(PLANNED_IMAGE_MAP_PATH, plannedImageMap);
    await writeJsonFile(REAL_STATUS_PATH, realImageStatus);
  }

  return {
    totalProducts: catalog.length,
    sourceCandidates: mergedSources.size,
    replacedProducts,
    replacedFiles,
    skippedProducts: skippedIds.length,
    promptCatalogCount: await countPromptCatalogProducts(),
    replacedIds,
    skippedIds,
    missingIds,
  };
}
