import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import sharp from "sharp";

type ProductRecord = {
  id: string;
  slug?: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  theme: string;
  collection: string;
  colors: string[];
  grams: number;
  hours: number;
  complexity: number;
  featured: boolean;
  description: string;
  tags: string[];
  price?: number;
  printTime?: string;
  plaWeight?: string;
  dimensions: string;
  images: string[];
  image?: string;
  imageAlt?: string;
  licenseType?: "personal" | "commercial";
  variants?: Array<{ color: string; available: boolean }>;
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  material: string;
  finish: string;
  status: "Pronta entrega" | "Sob encomenda";
  stock: number;
  customizable: boolean;
  readyToShip?: boolean;
};

type PromptSet = {
  hero: string;
  closeup: string;
  in_use: string;
  packshot: string;
};

type PromptProductRecord = {
  produto_slug: string;
  slug_limpo: string;
  produto_id: string;
  titulo: string;
  descricao: string;
  material: string | null;
  cores: string[];
  acabamento: string | null;
  categoria: string | null;
  subcategoria: string | null;
  colecao: string | null;
  visual_atual: string;
  fonte_catalogo: string;
  imagens_atuais: string[];
  imagens_planejadas: string[];
  arquivos: {
    folder: string;
    hero: string;
    closeup: string;
    in_use: string;
    packshot: string;
  };
  referencia_prompt_existente: string | null;
  prompts: PromptSet;
};

type CatalogPhotoEntry = {
  id: string;
  name: string;
  sourceFilename: string;
  kind: "foto-real" | "render-fiel" | "imagem-conceitual";
  gallery?: string[];
};

const ROOT = process.cwd();
const PROMPTS_OUTPUT_PATH = path.join(ROOT, "prompts_txt", "full_product_image_prompts_v2.json");
const PRODUCT_IMAGE_MAP_PATH = path.join(ROOT, "product-image-map.json");
const PLANNED_PRODUCT_IMAGE_MAP_PATH = path.join(ROOT, "planned-product-image-map.json");
const GALLERY_MAP_OUTPUT_PATH = path.join(ROOT, "data", "product-gallery-map.json");
const SNAPSHOT_OUTPUT_PATH = path.join(ROOT, "data", "local-catalog-image-snapshot.json");
const PROMPTS_TEXT_DIR = path.join(ROOT, "prompts_txt", "by_slug");
const PUBLIC_PRODUCTS_DIR = path.join(ROOT, "public", "products");
const PLACEHOLDER_SOURCE_PATH = path.join(ROOT, "public", "catalog-assets", "product-placeholder.jpg");
const CSV_FEATURED_PER_CATEGORY = 4;
const PLACEHOLDER_IMAGE = "/catalog-assets/product-placeholder.webp";

const REQUIRED_SOURCE_FILES = [
  "product-image-map.json",
  "planned-product-image-map.json",
  "real-images-manifest.json",
  "CATALOG_VALIDATION_REPORT.json",
  "prompts_batch.json",
  "data/catalog-photo-manifest.json",
  "data/catalogo_curado_160_itens_ptbr.json",
  "data/products.json",
  "lib/catalog.ts",
  "lib/verified-catalog.ts",
  "lib/catalog-csv-curated.ts",
];

function readText(relativePath: string) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

function ensureDir(targetDir: string) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function slugify(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function toNumber(value: string, fallback: number) {
  const normalized = String(value || "").replace(",", ".").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listFilesRecursive(relativeDir: string) {
  const targetDir = path.join(ROOT, relativeDir);
  const entries: string[] = [];

  function walk(currentDir: string) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        entries.push(path.relative(ROOT, fullPath).replace(/\\/g, "/"));
      }
    }
  }

  walk(targetDir);
  return entries.sort((left, right) => left.localeCompare(right));
}

function extractArrayLiteral(source: string, anchor: string) {
  const anchorIndex = source.indexOf(anchor);
  if (anchorIndex === -1) {
    throw new Error(`Anchor not found: ${anchor}`);
  }

  const arrayStart = anchorIndex + anchor.length - 1;
  if (source[arrayStart] !== "[") {
    throw new Error(`Array start not found for anchor: ${anchor}`);
  }

  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let blockComment = false;
  let lineComment = false;

  for (let index = arrayStart; index < source.length; index += 1) {
    const char = source[index];
    const nextChar = source[index + 1];

    if (blockComment) {
      if (char === "*" && nextChar === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "[") {
      depth += 1;
      continue;
    }

    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(arrayStart, index + 1);
      }
    }
  }

  throw new Error(`Array end not found for anchor: ${anchor}`);
}

function evaluateArrayLiteral<T>(arrayLiteral: string) {
  return vm.runInNewContext(`(${arrayLiteral})`, {}, { timeout: 5000 }) as T;
}

function normalizeCategory(category: string) {
  const key = String(category || "").trim().toLowerCase();
  if (key === "chaveiros") return "Presentes Criativos";
  if (key === "decoração" || key === "decoracao") return "Casa & Decoração";
  if (key === "utilitários/ferramentas" || key === "utilitarios/ferramentas") return "Setup & Organização";
  if (key === "colecionáveis/merch" || key === "colecionaveis/merch") return "Geek & Colecionáveis";
  return category;
}

function inferTheme(title: string, tags: string[]) {
  const blob = `${title} ${tags.join(" ")}`.toLowerCase();
  if (blob.includes("valorant")) return "Valorant";
  if (blob.includes("league of legends")) return "League of Legends";
  if (blob.includes("call of duty")) return "Call of Duty";
  if (blob.includes("marvel")) return "Marvel";
  if (blob.includes("star wars")) return "Star Wars";
  if (blob.includes("anime")) return "Anime";
  if (blob.includes("pokémon") || blob.includes("pokemon")) return "Pokémon";
  return "Nerd/Gamer";
}

function inferMaterial(category: string) {
  const key = String(category || "").toLowerCase();
  if (key.includes("utilit")) return "PLA+ Reforçado";
  if (key.includes("decor")) return "PLA Silk";
  return "PLA Premium";
}

function inferFinish(category: string) {
  return String(category || "").toLowerCase().includes("utilit") ? "Texturizado" : "Premium";
}

function estimateHoursFromWeight(weightGrams: number) {
  return Number(Math.max(0.9, Math.min(12, weightGrams / 30)).toFixed(1));
}

function parseTags(tags: string) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toImageList(row: Record<string, string>) {
  const candidates = [row.photo_url_1, row.photo_url_2, row.photo_url_3, row.thumbnail_url]
    .map((value) => String(value || "").trim())
    .filter((value) => /^https?:\/\//i.test(value) && !/não verificado/i.test(value));

  return candidates.length ? candidates : [PLACEHOLDER_IMAGE];
}

function hasUnverifiedMedia(row: Record<string, string>) {
  return [row.photo_url_1, row.photo_url_2, row.photo_url_3, row.thumbnail_url].some((value) =>
    /não verificado/i.test(value || "")
  );
}

function makeIdFromSku(sku: string) {
  return `csv-${String(sku || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function buildCsvProduct(row: Record<string, string>, featured: boolean): ProductRecord {
  const tags = parseTags(row.tags_pt || "");
  const category = normalizeCategory(row.category || "");
  const weightGrams = Math.max(8, Math.round(toNumber(row.shipping_weight_g || "", 60)));
  const lengthCm = Math.max(4, toNumber(row.shipping_length_cm || "", 12));
  const widthCm = Math.max(4, toNumber(row.shipping_width_cm || "", 8));
  const heightCm = Math.max(2, toNumber(row.shipping_height_cm || "", 6));
  const images = toImageList(row);
  const priceLow = toNumber(row.price_low_brl || "", 19.9);
  const priceMedian = toNumber(row.price_median_brl || "", Math.max(24.9, priceLow));
  const priceHigh = toNumber(row.price_high_brl || "", Number((priceMedian * 1.2).toFixed(2)));
  const hours = estimateHoursFromWeight(weightGrams);
  const unverifiedMedia = hasUnverifiedMedia(row);

  return {
    id: makeIdFromSku(row.sku || ""),
    sku: String(row.sku || "").trim(),
    name: String(row.title_pt || "").trim(),
    category,
    subcategory: String(row.subcategory || "").trim(),
    theme: inferTheme(row.title_pt || "", tags),
    collection: `Curadoria CSV 160 • ${String(row.category || "").trim()}`,
    colors: ["Sob consulta"],
    grams: weightGrams,
    hours,
    complexity: 1.28,
    featured,
    description: String(row.description_pt_2lines || "").trim(),
    tags: unique([
      ...tags,
      String(row.category || "").trim(),
      String(row.subcategory || "").trim(),
      "deep-research-report",
      "csv-curado-160",
      ...(unverifiedMedia ? ["midia-nao-verificada"] : []),
    ]),
    price: priceMedian,
    printTime: `${hours}h`,
    plaWeight: `${weightGrams}g`,
    dimensions: `${lengthCm}x${widthCm}x${heightCm}cm`,
    images,
    image: images[0],
    licenseType: "personal",
    variants: [{ color: "Sob consulta", available: true }],
    pricePix: priceMedian,
    priceCard: Number((priceMedian * 1.12).toFixed(2)),
    marketplaceSuggested: priceHigh,
    productionWindow: "3 a 7 dias",
    imageHint: String(row.title_pt || "").trim(),
    material: inferMaterial(row.category || ""),
    finish: inferFinish(row.category || ""),
    status: "Sob encomenda",
    stock: 8,
    customizable: true,
    readyToShip: false,
  };
}

function buildCsvCatalog(rows: Array<Record<string, string>>) {
  const featuredCategoryCount = new Map<string, number>();
  return rows.map((row) => {
    const category = String(row.category || "").trim();
    const current = featuredCategoryCount.get(category) || 0;
    const featured = current < CSV_FEATURED_PER_CATEGORY;
    featuredCategoryCount.set(category, current + 1);
    return buildCsvProduct(row, featured);
  });
}

function cleanDescription(description: string) {
  return String(description || "").replace(/\s+/g, " ").trim();
}

function colorListToText(colors: string[]) {
  const filtered = unique((Array.isArray(colors) ? colors : []).map((value) => String(value || "").trim()).filter(Boolean));
  if (!filtered.length) return "cor personalizada sob consulta";
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} e ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(", ")} e ${filtered[filtered.length - 1]}`;
}

function inferSourceFromId(productId: string) {
  if (productId.startsWith("real-")) return "verifiedCatalog";
  if (productId.startsWith("mdh-")) return "curatedCatalog";
  if (productId.startsWith("csv-")) return "csvCuratedCatalog";
  return "unknown";
}

function buildPromptBatchMap(records: Array<Record<string, unknown>>) {
  const map = new Map<string, Record<string, unknown>>();
  for (const record of records) {
    if (record?.id) {
      map.set(String(record.id), record);
    }
  }
  return map;
}

function buildValidationMap(validationReport: { validItems?: Array<Record<string, unknown>> }) {
  const map = new Map<string, Record<string, unknown>>();
  for (const item of validationReport.validItems || []) {
    map.set(String(item.id), item);
  }
  return map;
}

function buildPhotoManifestMap(entries: CatalogPhotoEntry[]) {
  const map = new Map<string, CatalogPhotoEntry>();
  for (const entry of entries) {
    map.set(String(entry.id), entry);
  }
  return map;
}

function buildCombinedSlug(product: ProductRecord) {
  return `${product.id}-${slugify(product.slug?.trim() || product.name)}`;
}

function buildLocalImagePaths(folderSlug: string) {
  const base = `/products/${folderSlug}`;
  return {
    folder: base,
    hero: `${base}/01-hero.jpg`,
    closeup: `${base}/02-closeup.jpg`,
    in_use: `${base}/03-in_use.jpg`,
    packshot: `${base}/04-packshot.jpg`,
  };
}

function resolvePublicPath(publicPath: string) {
  return path.join(ROOT, "public", publicPath.replace(/^\//, ""));
}

function fileExistsForPublicPath(publicPath: string) {
  return fs.existsSync(resolvePublicPath(publicPath));
}

function inferVisualKind(
  product: ProductRecord,
  validationMap: Map<string, Record<string, unknown>>,
  photoManifestMap: Map<string, CatalogPhotoEntry>,
) {
  const photoEntry = photoManifestMap.get(product.id);
  if (photoEntry?.kind) return photoEntry.kind;
  const validation = validationMap.get(product.id);
  if (typeof validation?.visualKind === "string") return validation.visualKind;
  const joinedSources = [...(product.images || []), product.image || ""].join(" ").toLowerCase();
  if (joinedSources.includes("/products/foto-") || product.id.startsWith("real-")) return "foto-real";
  if (joinedSources.includes("/products/render-")) return "render-fiel";
  return "imagem-conceitual";
}

function extractReferenceDescriptor(promptRecord?: Record<string, unknown>) {
  const rawPrompt = String(promptRecord?.prompt || "").trim();
  if (!rawPrompt) return "";
  return rawPrompt
    .replace(/^realistic product photo of\s+/i, "")
    .replace(/,\s*printed on a Bambu Lab[\s\S]*$/i, "")
    .replace(/,\s*single character centered$/i, "")
    .replace(/,\s*single collectible object centered$/i, "")
    .trim();
}

const TRAIT_PATTERNS = [
  { match: /\bgrinder\b/i, traits: "duas partes de encaixe, dentes internos e leitura visual claramente funcional" },
  { match: /creme dental|toothpaste/i, traits: "suporte de bancada compacto para tubo, base estável e abertura frontal bem definida" },
  { match: /demogorgon/i, traits: "silhueta de criatura sci-fi, cabeça aberta em pétalas e pose de colecionável premium" },
  { match: /hello kitty/i, traits: "rosto de gatinha branca, laço marcante e proporções chibi colecionáveis" },
  { match: /rick and morty|stencil/i, traits: "painel recortado com linhas nítidas e leitura gráfica forte de decoração geek" },
  { match: /fam[ií]lia custom|familia custom/i, traits: "miniatura personalizada com composição afetiva e base expositora" },
  { match: /boneca/i, traits: "personagem infantil em estilo chibi com expressão delicada e apelo afetivo" },
  { match: /isqueiro|lighter/i, traits: "case cilíndrica com relevo de caveira e encaixe preciso para uso real" },
  { match: /homer|pikachu mashup/i, traits: "mashup cartoon divertido com linguagem pop e proporções de miniatura de coleção" },
  { match: /ma[çc][oô]nica|ma[çc]onaria/i, traits: "medalha ou chaveiro circular com símbolo central em destaque e argola metálica" },
  { match: /naruto/i, traits: "cabelo loiro espetado, bandana ninja e roupa laranja" },
  { match: /sasuke/i, traits: "cabelo preto espetado, visual ninja escuro e postura precisa" },
  { match: /goku/i, traits: "cabelo preto espetado, roupa laranja e azul e leitura de personagem clássico" },
  { match: /luffy/i, traits: "chapéu de palha, colete vermelho e energia de aventura" },
  { match: /elsa/i, traits: "trança loira, vestido azul gelo e presença elegante" },
  { match: /totoro/i, traits: "corpo arredondado cinza, barriga clara e expressão amigável" },
  { match: /kirby/i, traits: "corpo redondo rosa, pés vermelhos e visual fofo" },
  { match: /mario/i, traits: "boné vermelho, bigode e macacão azul" },
  { match: /sonic/i, traits: "cor azul intensa, espinhos marcantes e sapatos vermelhos" },
  { match: /pikachu|pok[eé]mon/i, traits: "corpo amarelo, orelhas pontudas e rosto expressivo" },
  { match: /minecraft steve/i, traits: "geometria voxel fiel, camisa azul e proporções blocadas" },
  { match: /creeper/i, traits: "geometria voxel verde e leitura imediata do universo Minecraft" },
  { match: /tripulante|crewmate/i, traits: "corpo arredondado de astronauta e visor frontal marcante" },
  { match: /pok[eé]bola|esfera monstro/i, traits: "esfera bipartida com faixa central e leitura instantânea de item colecionável" },
  { match: /polvo/i, traits: "tentáculos articulados e cabeça arredondada com personalidade lúdica" },
  { match: /tubar[aã]o/i, traits: "forma compacta de tubarão com leitura oceânica clara" },
  { match: /drag[aã]o oriental/i, traits: "corpo serpentino longo, chifres e linguagem mítica oriental" },
  { match: /drag[aã]o europeu/i, traits: "asas abertas, volume de criatura fantástica e leitura medieval" },
  { match: /coruja/i, traits: "olhos grandes, presença florestal e superfícies que sugerem penas" },
  { match: /foguete/i, traits: "corpo retrô com aletas bem definidas e leitura espacial imediata" },
  { match: /cavaleiro/i, traits: "armadura medieval compacta e pose de miniatura de coleção" },
  { match: /rob[oô]/i, traits: "silhueta mecânica forte, volumes geométricos e presença geek de bancada" },
  { match: /fone|headphone/i, traits: "apoio estável com curvatura pensada para headset de mesa" },
  { match: /celular|smartphone/i, traits: "base inclinada para visualização confortável do telefone" },
  { match: /tablet/i, traits: "suporte inclinado com apoio firme para tablet ou leitura" },
  { match: /controle|ps5|xbox/i, traits: "apoio ergonômico para controle gamer com leitura funcional de setup" },
  { match: /monitor/i, traits: "elevação de monitor com linhas limpas e foco em organização de mesa" },
  { match: /cabos|cabo usb/i, traits: "canais e encaixes precisos para roteamento e organização de cabos" },
  { match: /canetas/i, traits: "compartimentos verticais limpos para organização de mesa" },
  { match: /livros/i, traits: "apoio robusto para livros com leitura clara de organização e estabilidade" },
  { match: /caixa organizadora|caixa para joias/i, traits: "corpo de armazenamento com tampa ou divisórias e leitura premium de organização" },
  { match: /plantas|vaso|jarro/i, traits: "volumetria decorativa para ambiente residencial com acabamento visível e limpo" },
  { match: /prateleira/i, traits: "estrutura de apoio de parede com leitura minimalista e funcional" },
  { match: /gancho/i, traits: "gancho de parede com geometria simples, resistente e limpa" },
  { match: /lumin[aá]ria|litofania/i, traits: "efeito luminoso decorativo pensado para mesa ou ambiente interno" },
  { match: /quadro|rel[oó]gio|espelho/i, traits: "peça decorativa de parede com leitura gráfica bem definida" },
  { match: /nome 3d|mensagem em 3d|anivers[aá]rio 3d/i, traits: "tipografia tridimensional personalizada com presença de presente criativo" },
];

function inferTraits(product: ProductRecord, promptRecord?: Record<string, unknown>) {
  const referenceDescriptor = extractReferenceDescriptor(promptRecord);
  if (referenceDescriptor) return referenceDescriptor;

  const blob = `${product.name} ${product.subcategory} ${product.category} ${product.description} ${product.tags.join(" ")}`;
  for (const pattern of TRAIT_PATTERNS) {
    if (pattern.match.test(blob)) {
      return pattern.traits;
    }
  }
  return cleanDescription(product.description) || `geometria fiel ao produto "${product.name}"`;
}

function inferLifestyleScene(product: ProductRecord) {
  const blob = `${product.name} ${product.subcategory} ${product.category} ${product.collection} ${product.description}`.toLowerCase();
  if (/creme dental|banheiro|toothpaste/.test(blob)) return "sobre uma bancada de banheiro limpa, ao lado de uma escova de dentes e de um tubo de creme dental";
  if (/grinder/.test(blob)) return "sobre uma mesa minimalista escura, com o produto semiaberto e o ambiente bem controlado";
  if (/isqueiro|lighter/.test(blob)) return "na mão de uma pessoa, em enquadramento fechado, mostrando escala real e encaixe funcional";
  if (/chaveiro|medalha|pingente/.test(blob)) return "na mão ou preso a um chaveiro premium sobre uma mesa clara, com foco total no produto";
  if (/celular|smartphone/.test(blob)) return "sobre uma mesa de trabalho minimalista sustentando um smartphone real, com teclado desfocado ao fundo";
  if (/tablet/.test(blob)) return "sobre uma mesa clara sustentando um tablet em uso, com ambiente de home office sofisticado";
  if (/fone|headphone/.test(blob)) return "em um setup clean com headset apoiado no suporte, teclado mecânico e monitor desfocados ao fundo";
  if (/controle|ps5|xbox/.test(blob)) return "em um setup gamer premium com controle apoiado, iluminação suave e fundo desfocado";
  if (/cabos|canetas|organizador|caixa|joias|maquiagem/.test(blob)) return "em uso sobre uma bancada organizada, mostrando a função real do item com poucos objetos de apoio";
  if (/vaso|jarro|plantas|porta-velas|quadro|espelho|rel[oó]gio|prateleira|gancho/.test(blob)) return "em um ambiente residencial elegante, sobre estante ou parede, com styling discreto e realista";
  if (/lumin[aá]ria|litofania/.test(blob)) return "sobre um criado-mudo ou aparador, levemente aceso, em ambiente interno sofisticado e realista";
  if (/nome 3d|mensagem em 3d|anivers[aá]rio 3d|trof[eé]u|porta-retrato|marcador/.test(blob)) return "sobre uma mesa de presente ou escrivaninha elegante, com contexto sutil e foco total na peça";
  if (/fam[ií]lia|boneca|chibi|miniatura|colecion[aá]vel|anime|game|geek|mascote|naruto|sasuke|goku|luffy|elsa|totoro|kirby|mario|sonic|pikachu|demogorgon|rob[oô]|drag[aã]o|coruja|foguete|cavaleiro|polvo|tubar[aã]o/.test(blob)) {
    return "sobre uma mesa de setup premium ou prateleira de coleção, com fundo desfocado e atmosfera de colecionador";
  }
  if (/setup|organiza/.test(blob)) return "sobre uma mesa clean de home office, com poucos elementos desfocados ao redor";
  if (/casa|decor/.test(blob)) return "em um ambiente de sala ou quarto contemporâneo, com styling discreto e realista";
  return "em um ambiente realista e minimalista que mostre claramente a função ou presença decorativa do item";
}

function inferCloseupFocus(product: ProductRecord) {
  const blob = `${product.name} ${product.subcategory} ${product.category} ${product.description}`.toLowerCase();
  if (/grinder/.test(blob)) return "os dentes internos, o encaixe entre as peças e a textura fina das camadas";
  if (/creme dental|organizador|caixa|suporte|gancho|prateleira/.test(blob)) return "os cantos, encaixes, bordas funcionais e a consistência do acabamento da impressão";
  if (/chaveiro|medalha|pingente/.test(blob)) return "o relevo do símbolo, as bordas e a precisão das letras ou elementos centrais";
  if (/fam[ií]lia|boneca|chibi|miniatura|colecion[aá]vel|anime|game|geek|naruto|sasuke|goku|luffy|elsa|totoro|kirby|mario|sonic|pikachu|demogorgon|rob[oô]|drag[aã]o|coruja|foguete|cavaleiro|polvo|tubar[aã]o/.test(blob)) {
    return "o rosto, texturas finas, pintura ou acabamento e as linhas sutis da impressão 3D";
  }
  return "a textura fina da impressão 3D, a precisão das bordas e a qualidade do acabamento";
}

function inferPackshotArrangement(product: ProductRecord) {
  const printableColors = unique(product.colors.map((value) => String(value || "").trim()).filter(Boolean)).filter((value) => !/^sob consulta$/i.test(value));
  const blob = `${product.name} ${product.subcategory} ${product.category} ${product.description}`.toLowerCase();
  if (printableColors.length >= 2 && !printableColors.includes("Colorido") && !printableColors.includes("Temática")) {
    return `duas a quatro peças lado a lado mostrando as variações de cor ${colorListToText(printableColors)}`;
  }
  if (/grinder/.test(blob)) return "o produto fechado, semiaberto e aberto, evidenciando as partes internas";
  if (/suporte|organizador|caixa|gancho|prateleira|vaso|jarro|porta-velas|lumin[aá]ria|quadro|rel[oó]gio|espelho/.test(blob)) {
    return "múltiplos ângulos do mesmo item, incluindo frente, três quartos e vista superior";
  }
  if (/chaveiro|medalha|pingente|marcador/.test(blob)) return "a peça frontal, verso e um detalhe aproximado da área personalizada";
  return "duas a quatro unidades ou ângulos complementares que mostrem frente, lateral e perspectiva de coleção";
}

function buildPromptSet(product: ProductRecord, promptRecord?: Record<string, unknown>): PromptSet {
  const colorsText = colorListToText(product.colors);
  const materialText = product.material ? `impresso em ${product.material}` : "impresso em material de alta qualidade";
  const finishText = product.finish ? `acabamento ${String(product.finish).toLowerCase()}` : "acabamento premium";
  const traits = inferTraits(product, promptRecord);
  const closeupFocus = inferCloseupFocus(product);
  const lifestyleScene = inferLifestyleScene(product);
  const packArrangement = inferPackshotArrangement(product);
  const dimensionsText = product.dimensions ? `dimensões proporcionais e realistas (${product.dimensions})` : "proporções realistas";
  const statusText = product.status ? `status comercial ${product.status.toLowerCase()}` : "";
  const baseRules = "professional product photography, studio lighting, white background, highly detailed, 8k, real 3D print texture, foto realista de produto, sem aparência de IA óbvia, sem render 3D, sem texto, sem embalagem, sem marca d'água";

  return {
    hero: [
      baseRules,
      `hero shot centralizado do item "${product.name}"`,
      traits,
      materialText,
      finishText,
      `cores fiéis: ${colorsText}`,
      dimensionsText,
      "fundo branco puro #FFFFFF, iluminação suave de estúdio estilo Apple, sombras macias, reflexos controlados, foco extremamente nítido",
      "mostrar claramente que é uma impressão 3D premium com textura fina e camadas sutis apenas de perto",
      statusText,
    ].filter(Boolean).join(", "),
    closeup: [
      baseRules,
      `macro close-up do item "${product.name}"`,
      `foco em ${closeupFocus}`,
      materialText,
      finishText,
      `cores fiéis: ${colorsText}`,
      "fundo light gray studio #F8F8F8, lente macro, profundidade de campo profissional, nitidez alta, microtextura de impressão 3D visível e elegante",
      "foto de catálogo premium, aparência física real, sem defeitos exagerados",
    ].join(", "),
    in_use: [
      "professional product photography, highly detailed, 8k, real 3D print texture, foto lifestyle realista de produto, luz suave natural combinada com iluminação de apoio de estúdio",
      `mostrar "${product.name}" em uso ou em contexto real`,
      lifestyleScene,
      traits,
      materialText,
      finishText,
      `cores fiéis: ${colorsText}`,
      "o produto deve ser o protagonista do enquadramento, com ambiente realista e discretamente desfocado",
      "camadas sutis da impressão 3D ainda visíveis, porém acabamento premium e convincente, sem aparência de CGI, sem texto, sem marca d'água",
    ].join(", "),
    packshot: [
      baseRules,
      `packshot de estúdio do item "${product.name}"`,
      `mostrar ${packArrangement}`,
      materialText,
      finishText,
      `cores fiéis: ${colorsText}`,
      "superfície branca ou cinza-claro de estúdio, composição limpa, iluminação uniforme, sombra macia sob as peças, e-commerce premium, múltiplos ângulos coerentes com o produto real",
      "textura fina da impressão 3D visível, aparência física de peça pronta para venda",
    ].join(", "),
  };
}

function detectCatalogPhotoCandidates(id: string) {
  const base = `/products/catalog/${id}`;
  const candidates = [`${base}.webp`, `${base}.png`, `${base}.jpg`, `${base}.jpeg`];
  return candidates.filter(fileExistsForPublicPath);
}

function buildPublishedGallery(product: ProductRecord, photoEntry: CatalogPhotoEntry | undefined, localPaths: ReturnType<typeof buildLocalImagePaths>) {
  const productLocalImages = unique(
    [...(product.images || []), product.image || ""].filter((item) => typeof item === "string" && item.startsWith("/") && !item.includes("picsum.photos")),
  );
  if (photoEntry?.gallery?.length) return unique(photoEntry.gallery);
  if (photoEntry?.kind === "foto-real" || photoEntry?.kind === "render-fiel") {
    const candidates = unique([...productLocalImages, ...detectCatalogPhotoCandidates(product.id)]);
    if (candidates.length) return candidates;
  }
  if (product.id.startsWith("real-") && productLocalImages.length) return productLocalImages;
  return [localPaths.hero, localPaths.closeup, localPaths.in_use, localPaths.packshot];
}

function buildAccentFromSlug(slug: string) {
  const hash = createHash("md5").update(slug).digest("hex");
  return {
    primary: `#${hash.slice(0, 6)}`,
    secondary: `#${hash.slice(6, 12)}`,
  };
}

function buildPlaceholderSvg(product: ProductRecord, shotKey: keyof PromptSet, folderSlug: string) {
  const shotLabelMap: Record<keyof PromptSet, string> = {
    hero: "01 HERO",
    closeup: "02 CLOSE-UP",
    in_use: "03 IN USE",
    packshot: "04 PACKSHOT",
  };
  const accent = buildAccentFromSlug(folderSlug);
  const bg = shotKey === "closeup" ? "#f8f8f8" : "#ffffff";
  const title = product.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const material = (product.material || "Material sob consulta").replace(/&/g, "&amp;");
  const colors = colorListToText(product.colors).replace(/&/g, "&amp;");
  const category = `${product.category} • ${product.subcategory}`.replace(/&/g, "&amp;");

  return `
    <svg width="1600" height="1200" viewBox="0 0 1600 1200" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="1200" fill="${bg}"/>
      <rect x="90" y="90" width="1420" height="1020" rx="36" fill="none" stroke="${accent.primary}" stroke-width="6" opacity="0.22"/>
      <rect x="130" y="130" width="1340" height="940" rx="30" fill="url(#grad)" opacity="0.3"/>
      <circle cx="1320" cy="260" r="140" fill="${accent.secondary}" opacity="0.08"/>
      <circle cx="300" cy="930" r="200" fill="${accent.primary}" opacity="0.08"/>
      <text x="140" y="210" font-size="42" font-family="Arial, Helvetica, sans-serif" fill="${accent.primary}" font-weight="700">${shotLabelMap[shotKey]}</text>
      <text x="140" y="310" font-size="78" font-family="Arial, Helvetica, sans-serif" fill="#111111" font-weight="800">${title}</text>
      <text x="140" y="390" font-size="30" font-family="Arial, Helvetica, sans-serif" fill="#4b5563">${category}</text>
      <text x="140" y="450" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#374151">Material: ${material}</text>
      <text x="140" y="500" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#374151">Cores: ${colors}</text>
      <text x="140" y="550" font-size="28" font-family="Arial, Helvetica, sans-serif" fill="#374151">Placeholder local criado automaticamente para fluxo de imagens</text>
      <text x="140" y="985" font-size="26" font-family="Arial, Helvetica, sans-serif" fill="#6b7280">MDH 3D Store • ${folderSlug}</text>
      <text x="140" y="1035" font-size="22" font-family="Arial, Helvetica, sans-serif" fill="#9ca3af">Substitua por foto final gerada mantendo o mesmo nome do arquivo.</text>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent.primary}"/>
          <stop offset="100%" stop-color="${accent.secondary}"/>
        </linearGradient>
      </defs>
    </svg>
  `.trim();
}

async function createPlaceholderImageIfMissing(targetPath: string, product: ProductRecord, shotKey: keyof PromptSet, folderSlug: string) {
  if (fs.existsSync(targetPath)) return false;
  ensureDir(path.dirname(targetPath));
  const svg = buildPlaceholderSvg(product, shotKey, folderSlug);
  await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(targetPath);
  return true;
}

async function main() {
  if (!fs.existsSync(PLACEHOLDER_SOURCE_PATH)) {
    throw new Error(`Arquivo de placeholder base não encontrado em ${PLACEHOLDER_SOURCE_PATH}`);
  }

  const verifiedCatalogSource = readText("lib/verified-catalog.ts");
  const curatedCatalogSource = readText("lib/catalog.ts");
  const csvRows = readJson<Array<Record<string, string>>>("data/catalogo_curado_160_itens_ptbr.json");
  const productImageMap = readJson<Record<string, string>>("product-image-map.json");
  const plannedProductImageMap = readJson<Record<string, string>>("planned-product-image-map.json");
  const validationReport = readJson<{ validItems?: Array<Record<string, unknown>> }>("CATALOG_VALIDATION_REPORT.json");
  const promptsBatch = readJson<Array<Record<string, unknown>>>("prompts_batch.json");
  const photoManifest = readJson<CatalogPhotoEntry[]>("data/catalog-photo-manifest.json");
  const legacyProducts = readJson<Array<Record<string, unknown>>>("data/products.json");
  const realImagesManifest = readJson<Array<Record<string, unknown>>>("real-images-manifest.json");
  const promptsIaText = readText("prompts-ia-imagens.txt");
  const dataFiles = listFilesRecursive("data");

  const verifiedCatalog = evaluateArrayLiteral<ProductRecord[]>(
    extractArrayLiteral(verifiedCatalogSource, "export const verifiedCatalog: Product[] = ["),
  );
  const curatedCatalog = evaluateArrayLiteral<ProductRecord[]>(
    extractArrayLiteral(curatedCatalogSource, "const curatedCatalog: Product[] = ["),
  );
  const csvCuratedCatalog = buildCsvCatalog(csvRows);

  const runtimeProducts = [...verifiedCatalog, ...curatedCatalog, ...csvCuratedCatalog];
  const promptBatchMap = buildPromptBatchMap(promptsBatch);
  const validationMap = buildValidationMap(validationReport);
  const photoManifestMap = buildPhotoManifestMap(photoManifest);

  ensureDir(path.dirname(PROMPTS_OUTPUT_PATH));
  ensureDir(path.dirname(GALLERY_MAP_OUTPUT_PATH));
  ensureDir(PROMPTS_TEXT_DIR);

  const runtimeImageMap: Record<string, string> = {};
  const plannedImageMap: Record<string, string> = {};
  const galleryMap: Record<string, string[]> = {};
  const localCatalogSnapshot: Array<Record<string, unknown>> = [];
  const promptProducts: PromptProductRecord[] = [];

  let createdFolders = 0;
  let createdPlaceholderFiles = 0;

  for (const product of runtimeProducts) {
    const folderSlug = buildCombinedSlug(product);
    const localPaths = buildLocalImagePaths(folderSlug);
    const productDir = path.join(PUBLIC_PRODUCTS_DIR, folderSlug);
    if (!fs.existsSync(productDir)) {
      ensureDir(productDir);
      createdFolders += 1;
    }

    const shotPathMap: Array<[keyof PromptSet, string]> = [
      ["hero", localPaths.hero],
      ["closeup", localPaths.closeup],
      ["in_use", localPaths.in_use],
      ["packshot", localPaths.packshot],
    ];

    for (const [shotKey, publicPath] of shotPathMap) {
      const created = await createPlaceholderImageIfMissing(resolvePublicPath(publicPath), product, shotKey, folderSlug);
      if (created) createdPlaceholderFiles += 1;
    }

    const photoEntry = photoManifestMap.get(product.id);
    const visualKind = inferVisualKind(product, validationMap, photoManifestMap);
    const publishedGallery = buildPublishedGallery(product, photoEntry, localPaths);
    const plannedGallery = [localPaths.hero, localPaths.closeup, localPaths.in_use, localPaths.packshot];
    const promptRecord = promptBatchMap.get(product.id);
    const prompts = buildPromptSet(product, promptRecord);

    runtimeImageMap[product.id] = publishedGallery[0] || localPaths.hero;
    plannedImageMap[product.id] = localPaths.hero;
    galleryMap[product.id] = publishedGallery;

    localCatalogSnapshot.push({
      id: product.id,
      slug: folderSlug,
      name: product.name,
      image: publishedGallery[0] || localPaths.hero,
      images: publishedGallery,
      material: product.material,
      category: product.category,
      collection: product.collection,
      visualKind,
    });

    const promptProduct: PromptProductRecord = {
      produto_slug: folderSlug,
      slug_limpo: slugify(product.slug?.trim() || product.name),
      produto_id: product.id,
      titulo: product.name,
      descricao: cleanDescription(product.description),
      material: product.material || null,
      cores: product.colors || [],
      acabamento: product.finish || null,
      categoria: product.category || null,
      subcategoria: product.subcategory || null,
      colecao: product.collection || null,
      visual_atual: visualKind,
      fonte_catalogo: inferSourceFromId(product.id),
      imagens_atuais: unique([...(publishedGallery || []), productImageMap[product.id] || "", plannedProductImageMap[product.id] || ""]),
      imagens_planejadas: plannedGallery,
      arquivos: {
        folder: localPaths.folder,
        hero: localPaths.hero,
        closeup: localPaths.closeup,
        in_use: localPaths.in_use,
        packshot: localPaths.packshot,
      },
      referencia_prompt_existente: promptRecord?.prompt ? String(promptRecord.prompt) : null,
      prompts,
    };

    promptProducts.push(promptProduct);

    const promptTextPath = path.join(PROMPTS_TEXT_DIR, `${folderSlug}.txt`);
    const promptText = [
      `Produto: ${product.name}`,
      `ID: ${product.id}`,
      `Slug: ${folderSlug}`,
      "",
      "[hero]",
      prompts.hero,
      "",
      "[closeup]",
      prompts.closeup,
      "",
      "[in_use]",
      prompts.in_use,
      "",
      "[packshot]",
      prompts.packshot,
      "",
    ].join("\n");
    fs.writeFileSync(promptTextPath, promptText, "utf8");
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    runtimeCatalogCount: runtimeProducts.length,
    bySource: {
      verifiedCatalog: verifiedCatalog.length,
      curatedCatalog: curatedCatalog.length,
      csvCuratedCatalog: csvCuratedCatalog.length,
    },
    foldersCreated: createdFolders,
    placeholderFilesCreated: createdPlaceholderFiles,
    updatedFiles: [
      "prompts_txt/full_product_image_prompts_v2.json",
      "prompts_txt/by_slug/*",
      "product-image-map.json",
      "planned-product-image-map.json",
      "data/product-gallery-map.json",
      "data/local-catalog-image-snapshot.json",
    ],
    readFiles: unique([...REQUIRED_SOURCE_FILES, ...dataFiles]),
    diagnostics: {
      legacyDataProductsCount: legacyProducts.length,
      realImagesManifestCount: realImagesManifest.length,
      promptsBatchCount: promptsBatch.length,
      promptsIaTextLength: promptsIaText.length,
      snapletSeedDependencyRemoved: true,
    },
  };

  promptProducts.sort((left, right) => left.produto_slug.localeCompare(right.produto_slug));

  fs.writeFileSync(PROMPTS_OUTPUT_PATH, JSON.stringify({ summary, products: promptProducts }, null, 2), "utf8");
  fs.writeFileSync(PRODUCT_IMAGE_MAP_PATH, JSON.stringify(runtimeImageMap, null, 2), "utf8");
  fs.writeFileSync(PLANNED_PRODUCT_IMAGE_MAP_PATH, JSON.stringify(plannedImageMap, null, 2), "utf8");
  fs.writeFileSync(GALLERY_MAP_OUTPUT_PATH, JSON.stringify(galleryMap, null, 2), "utf8");
  fs.writeFileSync(SNAPSHOT_OUTPUT_PATH, JSON.stringify(localCatalogSnapshot, null, 2), "utf8");

  console.log(JSON.stringify({
    productsProcessed: runtimeProducts.length,
    foldersCreated: createdFolders,
    placeholderFilesCreated: createdPlaceholderFiles,
    updatedFilesCount: summary.updatedFiles.length,
    promptsOutput: path.relative(ROOT, PROMPTS_OUTPUT_PATH).replace(/\\/g, "/"),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
