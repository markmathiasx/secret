import "server-only";

import fs from "node:fs";
import path from "node:path";
import { getNuvemshopBaseUrl } from "@/lib/mdh-store/config";
import { slugify } from "@/lib/utils";

export type SmartStoreProduct = {
  slug: string;
  name: string;
  category: string;
  material: string;
  colors: string[];
  personalizable: boolean;
  price: number;
  promotionalPrice?: number;
  pixPrice: number;
  cardPrice?: number;
  stock: number;
  sku: string;
  description: string;
  tags: string[];
  dimensions: {
    heightCm?: number;
    widthCm?: number;
    lengthCm?: number;
  };
  weightKg?: number;
  seoTitle: string;
  seoDescription: string;
  brand: string;
  physical: boolean;
  nuvemshopUrl?: string;
  image?: string;
  gallery: string[];
  videoUrl?: string;
  careInstructions: string[];
  faqs: Array<{ question: string; answer: string }>;
  productionWindow: string;
  featured: boolean;
  marketplaceScore: number;
};

const CSV_PATH = path.join(process.cwd(), "data", "produtos.csv");

function parseNumber(value?: string) {
  let normalized = (value || "").replace(/\s/g, "").replace(/[R$]/gi, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    const decimalSeparator = comma > dot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.replace(new RegExp(`\\${thousandSeparator}`, "g"), "").replace(decimalSeparator, ".");
  } else if (comma >= 0) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (dot >= 0 && !/\.\d{1,2}$/.test(normalized)) {
    normalized = normalized.replace(/\./g, "");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clean(value?: string) {
  return (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function splitTags(value?: string) {
  return clean(value)
    .split(/[;,|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function splitList(value?: string) {
  return clean(value)
    .split(/[;,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value?: string) {
  return /^(sim|yes|true|1)$/i.test(clean(value));
}

function pick(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const exact = row[key];
    if (exact !== undefined && clean(exact)) return exact;
  }
  const normalized = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase(), value])
  );
  for (const key of keys) {
    const normalizedKey = key.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    const value = normalized[normalizedKey];
    if (value !== undefined && clean(value)) return value;
  }
  return "";
}

function parseDelimited(text: string) {
  const source = text.replace(/^\uFEFF/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] || "";
  const delimiter = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && char === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => clean(cell))) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => clean(cell))) rows.push(row);
  return rows;
}

function normalizeNuvemshopUrl(value: string) {
  const raw = clean(value);
  if (!raw) return undefined;
  if (/^(blob:|data:|javascript:)/i.test(raw)) return undefined;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(parsed.hostname)) return undefined;
      return parsed.toString();
    } catch {
      return undefined;
    }
  }

  const baseUrl = getNuvemshopBaseUrl();
  if (!baseUrl) return undefined;

  try {
    return new URL(raw.startsWith("/") ? raw : `/produtos/${raw}`, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function normalizeImage(value: string) {
  const raw = clean(value);
  if (!raw) return undefined;
  if (/^(blob:|data:|javascript:)/i.test(raw)) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function buildFallbackGallery(primaryImage: string | undefined, index: number) {
  const start = (index % 24) + 1;
  const candidates = [
    primaryImage,
    `/catalog-assets/mdh-${start}.webp`,
    `/catalog-assets/mdh-${start + 1}.webp`,
    `/catalog-assets/mdh-${start + 2}.webp`,
    `/catalog-assets/mdh-${start + 3}.webp`,
    `/catalog-assets/mdh-${start + 4}.webp`,
  ].filter(Boolean) as string[];

  return Array.from(new Set(candidates)).slice(0, 6);
}

function inferMaterial(row: Record<string, string>, tags: string[]) {
  const explicit = clean(pick(row, ["Material", "Materiais"]));
  if (explicit) return explicit;
  if (tags.some((tag) => /petg/i.test(tag))) return "PETG";
  if (tags.some((tag) => /resina/i.test(tag))) return "Resina";
  return "PLA";
}

function inferColors(row: Record<string, string>) {
  const explicit = splitList(pick(row, ["Cores", "Cores disponíveis", "Cores disponiveis"]));
  if (explicit.length) return explicit;
  return ["Preto", "Branco", "Vermelho", "Azul", "Verde", "Sob consulta"];
}

function inferPersonalizable(row: Record<string, string>, rawName: string, tags: string[], category: string) {
  const explicit = clean(pick(row, ["Personalizável", "Personalizavel", "Sob medida"]));
  if (explicit) return parseBoolean(explicit);
  return /personaliz|sob medida|nome|logo/i.test(`${rawName} ${category} ${tags.join(" ")}`);
}

function buildCareInstructions(material: string) {
  const base = [
    "Limpar com pano seco ou levemente úmido.",
    "Evitar exposição prolongada ao sol forte ou calor intenso.",
    "Não usar álcool, solventes ou abrasivos na peça.",
  ];
  if (/pla/i.test(material)) {
    return [...base, "PLA é indicado para uso decorativo e organizadores internos."];
  }
  if (/petg/i.test(material)) {
    return [...base, "PETG oferece maior resistência para peças funcionais."];
  }
  return base;
}

function buildProductFaqs(productName: string, productionWindow: string, material: string) {
  return [
    {
      question: "Posso escolher a cor?",
      answer: "Sim. A cor é confirmada no WhatsApp antes da produção, conforme disponibilidade de material.",
    },
    {
      question: "Qual é o prazo de produção?",
      answer: `O prazo estimado para ${productName} é ${productionWindow}, podendo variar conforme fila e acabamento.`,
    },
    {
      question: "Qual material é usado?",
      answer: `A peça usa ${material} por padrão, com alternativas sob consulta quando o projeto exigir.`,
    },
  ];
}

function rowToProduct(row: Record<string, string>, index: number): SmartStoreProduct | null {
  const rawName = clean(pick(row, ["Nome", "name"]));
  const rawSlug = clean(pick(row, ["Identificador URL", "Slug", "URL"]));
  if (!rawName && !rawSlug) return null;
  if (!rawName) return null;

  const slug = slugify(rawSlug || rawName);
  if (!slug) return null;

  const price = parseNumber(pick(row, ["Preço", "Preco", "price"])) || 0;
  const promotionalPrice = parseNumber(pick(row, ["Preço promocional", "Preco promocional", "Promocional"]));
  const pixPrice = promotionalPrice && promotionalPrice > 0 && promotionalPrice < price ? promotionalPrice : price;
  const cardPrice = price > 0 && Math.abs(price - pixPrice) > 0.01 ? price : undefined;
  const category = clean(pick(row, ["Categorias", "Categoria"])) || "Impressão 3D";
  const sku = clean(pick(row, ["SKU", "Código de barras", "Codigo de barras"])) || `MDH-${String(index + 1).padStart(3, "0")}`;
  const description =
    clean(pick(row, ["Descrição", "Descricao"])) ||
    `${rawName} produzido em impressão 3D pela MDH3D, com atendimento pelo WhatsApp para cor, prazo e acabamento.`;
  const tags = splitTags(pick(row, ["Tags"]));
  const material = inferMaterial(row, tags);
  const colors = inferColors(row);
  const personalizable = inferPersonalizable(row, rawName, tags, category);
  const seoTitle = clean(pick(row, ["Título para SEO", "Titulo para SEO"])) || `${rawName} | MDH3D`;
  const seoDescription = clean(pick(row, ["Descrição para SEO", "Descricao para SEO"])) || description.slice(0, 155);
  const image = normalizeImage(pick(row, ["Imagem", "Image", "Foto"]));
  const gallery = splitList(pick(row, ["Galeria", "Imagens", "Fotos"]))
    .map(normalizeImage)
    .filter(Boolean) as string[];
  const productionWindow = clean(pick(row, ["Prazo de produção", "Prazo de producao"])) || "2 a 5 dias úteis";

  const physicalRaw = clean(pick(row, ["Produto Físico", "Produto Fisico"]));

  return {
    slug,
    name: rawName,
    category,
    material,
    colors,
    personalizable,
    price,
    promotionalPrice,
    pixPrice,
    cardPrice,
    stock: Math.max(0, Math.floor(parseNumber(pick(row, ["Estoque", "stock"])) || 0)),
    sku,
    description,
    tags,
    dimensions: {
      heightCm: parseNumber(pick(row, ["Altura (cm)", "Altura"])),
      widthCm: parseNumber(pick(row, ["Largura (cm)", "Largura"])),
      lengthCm: parseNumber(pick(row, ["Comprimento (cm)", "Comprimento"])),
    },
    weightKg: parseNumber(pick(row, ["Peso (kg)", "Peso"])),
    seoTitle,
    seoDescription,
    brand: clean(pick(row, ["Marca"])) || "MDH3D",
    physical: physicalRaw ? parseBoolean(physicalRaw) : true,
    nuvemshopUrl: normalizeNuvemshopUrl(
      pick(row, ["Nuvemshop URL", "URL Nuvemshop", "Link Nuvemshop", "Checkout URL", "Link do produto"])
    ),
    image,
    gallery: gallery.length ? gallery : buildFallbackGallery(image, index),
    videoUrl: normalizeImage(pick(row, ["Vídeo", "Video", "Video URL", "Vídeo URL"])),
    careInstructions: buildCareInstructions(material),
    faqs: buildProductFaqs(rawName, productionWindow, material),
    productionWindow,
    featured: index < 4 || tags.some((tag) => /destaque|presente|geek/i.test(tag)),
    marketplaceScore:
      Number(index < 4) * 20 +
      Number(personalizable) * 8 +
      Math.max(0, 12 - index) +
      tags.length,
  };
}

export function parseProductsCsv(csvText: string) {
  const matrix = parseDelimited(csvText);
  const [header, ...body] = matrix;
  if (!header?.length) return [] as SmartStoreProduct[];
  const headers = header.map((cell) => clean(cell));
  const products = new Map<string, SmartStoreProduct>();

  body.forEach((cells, index) => {
    const row = Object.fromEntries(headers.map((key, headerIndex) => [key, cells[headerIndex] || ""]));
    const product = rowToProduct(row, index);
    if (!product) return;
    const existing = products.get(product.slug);
    if (existing) {
      products.set(product.slug, {
        ...existing,
        stock: existing.stock + product.stock,
        tags: Array.from(new Set([...existing.tags, ...product.tags])),
      });
      return;
    }
    products.set(product.slug, product);
  });

  return Array.from(products.values()).sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
}

export function getLocalStoreProducts() {
  if (!fs.existsSync(CSV_PATH)) return [] as SmartStoreProduct[];
  return parseProductsCsv(fs.readFileSync(CSV_PATH, "utf8"));
}

export function getLocalStoreCategories(products = getLocalStoreProducts()) {
  return Array.from(new Set(products.map((product) => product.category))).sort((a, b) => a.localeCompare(b));
}

export function findLocalStoreProduct(slug: string) {
  return getLocalStoreProducts().find((product) => product.slug === slug);
}

export function getRelatedLocalProducts(product: SmartStoreProduct, limit = 4) {
  return getLocalStoreProducts()
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => {
      const aScore = Number(a.category === product.category) * 4 + a.tags.filter((tag) => product.tags.includes(tag)).length;
      const bScore = Number(b.category === product.category) * 4 + b.tags.filter((tag) => product.tags.includes(tag)).length;
      return bScore - aScore || a.pixPrice - b.pixPrice;
    })
    .slice(0, limit);
}
