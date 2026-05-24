export const CATALOG_PRIMARY_CATEGORIES = [
  "Chaveiros e Acessórios",
  "Geek & Colecionáveis",
  "Casa e Organização",
  "Setup Gamer e Home Office",
  "Presentes Personalizados",
  "Decoração",
  "Peças Técnicas e Sob Medida",
  "Lotes e Brindes Corporativos",
  "Infantil e Educativo",
  "Utilidades Especiais",
] as const;

export const BUYING_INTENTS = [
  "presentear",
  "organizar",
  "decorar",
  "colecionar",
  "personalizar",
  "setup",
  "comprar_em_lote",
  "peça_tecnica",
  "pronta_entrega",
  "sob_encomenda",
  "infantil",
  "corporativo",
] as const;

export const PRODUCT_OBJECT_TYPES = [
  "chaveiro",
  "miniatura",
  "suporte",
  "organizador",
  "porta_objeto",
  "decoração",
  "placa",
  "boneco",
  "medalha",
  "caixa",
  "case",
  "brinde",
  "peça_tecnica",
  "lote",
  "acessório",
  "outro",
] as const;

export type CatalogPrimaryCategory = (typeof CATALOG_PRIMARY_CATEGORIES)[number];
export type BuyingIntent = (typeof BUYING_INTENTS)[number];
export type ProductObjectType = (typeof PRODUCT_OBJECT_TYPES)[number];
export type TaxonomyConfidence = "high" | "medium" | "low";

export type CatalogTaxonomyClassification = {
  primaryCategory: CatalogPrimaryCategory;
  subcategory: string;
  productTypePath: string;
  buyingIntents: BuyingIntent[];
  objectType: ProductObjectType;
  useCaseTags: string[];
  seoKeywords: string[];
  confidence: TaxonomyConfidence;
  classificationReason: string;
};

export type TaxonomyProductInput = {
  id?: string;
  sku?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  collection?: string;
  theme?: string;
  material?: string;
  finish?: string;
  status?: string;
  tags?: string[];
  customizable?: boolean;
  readyToShip?: boolean;
  primaryCategory?: string;
  productTypePath?: string;
  buyingIntents?: string[];
  objectType?: string;
  useCaseTags?: string[];
  seoKeywords?: string[];
  confidence?: string;
  classificationReason?: string;
  makerWorldMeta?: {
    niche?: string;
    nicheKey?: string;
    sourceTitle?: string;
    longDescription?: string;
  };
};

const PRIMARY_CATEGORY_SET = new Set<string>(CATALOG_PRIMARY_CATEGORIES);
const BUYING_INTENT_SET = new Set<string>(BUYING_INTENTS);
const OBJECT_TYPE_SET = new Set<string>(PRODUCT_OBJECT_TYPES);

const SUBCATEGORIES_BY_CATEGORY: Record<CatalogPrimaryCategory, string[]> = {
  "Chaveiros e Acessórios": ["chaveiro", "tag", "pingente", "plaquinha", "identificador", "mini acessório"],
  "Geek & Colecionáveis": [
    "personagens",
    "miniaturas",
    "action figures decorativas",
    "criaturas",
    "cultura pop",
    "anime",
    "games",
    "filmes e séries",
    "fantasia/medieval",
    "decoração geek",
  ],
  "Casa e Organização": [
    "banheiro",
    "cozinha",
    "mesa",
    "gaveta",
    "porta-objetos",
    "suporte doméstico",
    "utilidade funcional",
    "organização de cabos",
  ],
  "Setup Gamer e Home Office": [
    "suporte de controle",
    "suporte de fone",
    "organizador de cabo",
    "suporte de celular",
    "base de mesa",
    "decoração de setup",
    "acessório de monitor/teclado",
  ],
  "Presentes Personalizados": [
    "nome personalizado",
    "data personalizada",
    "lembrança afetiva",
    "presente com tema específico",
    "bonecos personalizados",
    "medalhas personalizadas",
    "placas personalizadas",
  ],
  "Decoração": ["vaso", "escultura", "enfeite", "quadro/placa decorativa", "luminária", "decoração de estante"],
  "Peças Técnicas e Sob Medida": [
    "peça funcional sob medida",
    "suporte técnico",
    "adaptador",
    "protótipo",
    "reposição",
    "componente por STL/medida",
  ],
  "Lotes e Brindes Corporativos": [
    "brindes",
    "kits",
    "lembranças para evento",
    "peças repetitivas",
    "pedido em quantidade",
    "item institucional",
  ],
  "Infantil e Educativo": ["brinquedo", "item educativo", "personagem infantil", "peça lúdica", "lembrança infantil"],
  "Utilidades Especiais": ["utilidade funcional"],
};

const CATEGORY_SLUG_KEYWORDS: Record<CatalogPrimaryCategory, string[]> = {
  "Chaveiros e Acessórios": ["chaveiro", "tag", "pingente", "plaquinha", "identificador", "mini acessorio"],
  "Geek & Colecionáveis": [
    "geek",
    "colecionavel",
    "colecionaveis",
    "anime",
    "game",
    "gamer",
    "miniatura",
    "personagem",
    "cultura pop",
    "fantasia",
  ],
  "Casa e Organização": ["casa", "organizacao", "organizador", "banheiro", "cozinha", "gaveta", "porta objeto", "utilidade"],
  "Setup Gamer e Home Office": ["setup", "home office", "controle", "fone", "headset", "monitor", "teclado", "mouse", "mesa gamer"],
  "Presentes Personalizados": ["presente personalizado", "personalizado", "lembranca", "medalha personalizada", "placa personalizada"],
  "Decoração": ["decoracao", "decorativo", "vaso", "escultura", "enfeite", "quadro", "luminaria", "estante"],
  "Peças Técnicas e Sob Medida": ["sob medida", "stl", "tecnica", "adaptador", "prototipo", "reposicao", "componente"],
  "Lotes e Brindes Corporativos": ["brinde", "lote", "corporativo", "evento", "kit", "institucional"],
  "Infantil e Educativo": ["infantil", "crianca", "educativo", "brinquedo", "ludico"],
  "Utilidades Especiais": ["utilidade especial", "funcional", "acessorio"],
};

const PUBLIC_TEXT_BANNED_TERMS = [
  "foto real",
  "fotos reais",
  "render fiel",
  "foto real x render fiel",
  "peças com foto real",
  "pecas com foto real",
];

function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function displayText(value: unknown) {
  return String(value ?? "").trim();
}

function splitWords(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);
}

function unique<T extends string>(values: T[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectBlob(product: TaxonomyProductInput) {
  return normalizeText(
    [
      product.id,
      product.sku,
      product.name,
      product.title,
      product.slug,
      product.description,
      product.category,
      product.subcategory,
      product.collection,
      product.theme,
      product.material,
      product.finish,
      product.status,
      product.makerWorldMeta?.niche,
      product.makerWorldMeta?.nicheKey,
      product.makerWorldMeta?.sourceTitle,
      product.makerWorldMeta?.longDescription,
      ...(product.tags || []),
    ].join(" ")
  );
}

function collectPrimaryBlob(product: TaxonomyProductInput) {
  return normalizeText(
    [
      product.id,
      product.sku,
      product.name,
      product.title,
      product.slug,
      product.description,
      product.category,
      product.subcategory,
      product.collection,
      product.theme,
      product.material,
      product.finish,
    ].join(" ")
  );
}

function collectIdentityBlob(product: TaxonomyProductInput) {
  return normalizeText(
    [
      product.id,
      product.sku,
      product.name,
      product.title,
      product.slug,
      product.category,
      product.subcategory,
      product.collection,
      product.theme,
    ].join(" ")
  );
}

function hasAny(blob: string, terms: string[]) {
  return terms.some((term) => blob.includes(normalizeText(term)));
}

function hasWord(blob: string, word: string) {
  const normalized = normalizeText(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${normalized}(\\s|$)`).test(blob);
}

function isValidPrimaryCategory(value: unknown): value is CatalogPrimaryCategory {
  return typeof value === "string" && PRIMARY_CATEGORY_SET.has(value);
}

export function isValidBuyingIntent(value: unknown): value is BuyingIntent {
  return typeof value === "string" && BUYING_INTENT_SET.has(value);
}

function isValidObjectType(value: unknown): value is ProductObjectType {
  return typeof value === "string" && OBJECT_TYPE_SET.has(value);
}

function normalizeIntentList(values: unknown): BuyingIntent[] {
  if (!Array.isArray(values)) return [];
  return unique(values.filter(isValidBuyingIntent));
}

function normalizeStringList(values: unknown, max = 18) {
  if (!Array.isArray(values)) return [];
  return unique(
    values
      .map((value) => displayText(value))
      .filter(Boolean)
      .slice(0, max)
  );
}

function buildProductTypePath(primaryCategory: CatalogPrimaryCategory, subcategory: string) {
  return `Catálogo > ${primaryCategory} > ${subcategory}`;
}

function addIntent(intents: BuyingIntent[], value: BuyingIntent) {
  if (!intents.includes(value)) intents.push(value);
}

function inferObjectType(blob: string, category: CatalogPrimaryCategory): ProductObjectType {
  if (hasAny(blob, ["chaveiro", "keychain"])) return "chaveiro";
  if (hasAny(blob, ["medalha"])) return "medalha";
  if (hasAny(blob, ["placa", "plaquinha", "quadro", "stencil"])) return "placa";
  if (hasAny(blob, ["boneco", "boneca", "action figure", "personagem"])) return "boneco";
  if (hasAny(blob, ["miniatura", "figure", "figurine", "colecionavel"])) return "miniatura";
  if (hasAny(blob, ["suporte", "holder", "stand", "base"])) return "suporte";
  if (hasAny(blob, ["organizador", "divisoria", "bandeja", "porta cabos", "porta cabo"])) return "organizador";
  if (hasAny(blob, ["porta creme", "porta escova", "porta objeto", "porta objetos", "porta joias", "porta controle"])) return "porta_objeto";
  if (hasAny(blob, ["caixa", "box"])) return "caixa";
  if (hasAny(blob, ["case", "capa"])) return "case";
  if (hasAny(blob, ["brinde", "lembrancinha"])) return "brinde";
  if (hasAny(blob, ["lote", "kit"])) return "lote";
  if (hasAny(blob, ["adaptador", "reposicao", "componente", "prototipo", "stl", "sob medida"])) return "peça_tecnica";
  if (hasAny(blob, ["vaso", "escultura", "enfeite", "decoracao", "decorativo", "luminaria"])) return "decoração";
  if (category === "Peças Técnicas e Sob Medida") return "peça_tecnica";
  if (category === "Decoração") return "decoração";
  if (category === "Geek & Colecionáveis") return "miniatura";
  return "outro";
}

function inferSubcategory(blob: string, category: CatalogPrimaryCategory, objectType: ProductObjectType) {
  switch (category) {
    case "Chaveiros e Acessórios":
      if (hasAny(blob, ["tag", "identificador"])) return "tag";
      if (hasAny(blob, ["pingente"])) return "pingente";
      if (hasAny(blob, ["plaquinha", "placa"])) return "plaquinha";
      if (hasAny(blob, ["mini acessorio", "acessorio"])) return "mini acessório";
      return "chaveiro";
    case "Geek & Colecionáveis":
      if (hasAny(blob, ["anime", "otaku", "manga", "hello kitty", "jedi", "pokemon", "pikachu"])) return "anime";
      if (hasAny(blob, ["game", "gamer", "valorant", "league of legends", "minecraft", "nintendo"])) return "games";
      if (hasAny(blob, ["filme", "serie", "demogorgon", "rick", "morty", "star wars", "marvel"])) return "filmes e séries";
      if (hasAny(blob, ["dragao", "cavaleiro", "medieval", "fantasia", "criatura"])) return "fantasia/medieval";
      if (hasAny(blob, ["criatura", "monstro"])) return "criaturas";
      if (hasAny(blob, ["setup", "estante", "nicho", "decoracao"])) return "decoração geek";
      if (objectType === "boneco") return "personagens";
      return "miniaturas";
    case "Casa e Organização":
      if (hasAny(blob, ["banheiro", "creme dental", "escova"])) return "banheiro";
      if (hasAny(blob, ["cozinha", "talher", "talheres", "geladeira"])) return "cozinha";
      if (hasAny(blob, ["gaveta", "gridfinity", "divisoria"])) return "gaveta";
      if (hasAny(blob, ["cabo", "cabos", "usb"])) return "organização de cabos";
      if (hasAny(blob, ["porta objeto", "porta objetos", "porta joia", "porta joias", "porta treco"])) return "porta-objetos";
      if (hasAny(blob, ["suporte", "gancho"])) return "suporte doméstico";
      if (hasAny(blob, ["mesa", "bancada"])) return "mesa";
      return "utilidade funcional";
    case "Setup Gamer e Home Office":
      if (hasAny(blob, ["controle", "joystick", "gamepad"])) return "suporte de controle";
      if (hasAny(blob, ["fone", "headset", "headphone"])) return "suporte de fone";
      if (hasAny(blob, ["cabo", "cabos", "usb"])) return "organizador de cabo";
      if (hasAny(blob, ["celular", "telefone", "smartphone"])) return "suporte de celular";
      if (hasAny(blob, ["monitor", "teclado", "mouse"])) return "acessório de monitor/teclado";
      if (hasAny(blob, ["decoracao", "miniatura", "geek"])) return "decoração de setup";
      return "base de mesa";
    case "Presentes Personalizados":
      if (hasAny(blob, ["medalha"])) return "medalhas personalizadas";
      if (hasAny(blob, ["placa", "plaquinha", "quadro"])) return "placas personalizadas";
      if (hasAny(blob, ["boneco", "boneca", "familia", "avatar"])) return "bonecos personalizados";
      if (hasAny(blob, ["nome"])) return "nome personalizado";
      if (hasAny(blob, ["data", "aniversario"])) return "data personalizada";
      if (hasAny(blob, ["tema"])) return "presente com tema específico";
      return "lembrança afetiva";
    case "Decoração":
      if (hasAny(blob, ["vaso"])) return "vaso";
      if (hasAny(blob, ["escultura", "busto"])) return "escultura";
      if (hasAny(blob, ["quadro", "placa", "stencil"])) return "quadro/placa decorativa";
      if (hasAny(blob, ["luminaria", "luz"])) return "luminária";
      if (hasAny(blob, ["estante", "prateleira", "nicho"])) return "decoração de estante";
      return "enfeite";
    case "Peças Técnicas e Sob Medida":
      if (hasAny(blob, ["adaptador"])) return "adaptador";
      if (hasAny(blob, ["prototipo", "protótipo"])) return "protótipo";
      if (hasAny(blob, ["reposicao", "reposição"])) return "reposição";
      if (hasAny(blob, ["stl", "3mf", "medida"])) return "componente por STL/medida";
      if (hasAny(blob, ["suporte tecnico", "suporte técnico"])) return "suporte técnico";
      return "peça funcional sob medida";
    case "Lotes e Brindes Corporativos":
      if (hasWord(blob, "kit") || hasWord(blob, "kits")) return "kits";
      if (hasAny(blob, ["evento", "lembrancinha", "lembranca"])) return "lembranças para evento";
      if (hasAny(blob, ["quantidade", "repetitivo", "repetitivas"])) return "peças repetitivas";
      if (hasAny(blob, ["corporativo", "empresa", "institucional"])) return "item institucional";
      return "brindes";
    case "Infantil e Educativo":
      if (hasAny(blob, ["educativo", "aprendizado", "didatico"])) return "item educativo";
      if (hasAny(blob, ["personagem infantil", "princesa", "frozen"])) return "personagem infantil";
      if (hasAny(blob, ["lembrancinha", "lembranca"])) return "lembrança infantil";
      if (hasAny(blob, ["ludico", "lúdico"])) return "peça lúdica";
      return "brinquedo";
    default:
      return "utilidade funcional";
  }
}

function mapLegacyCategory(blob: string, value: string | undefined): CatalogPrimaryCategory | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  const direct = CATALOG_PRIMARY_CATEGORIES.find((category) => normalizeText(category) === normalized);
  if (direct) return direct;

  if (normalized === "geek & colecionaveis" || normalized === "anime" || normalized === "desk toy") return "Geek & Colecionáveis";
  if (normalized === "presentes criativos") return "Presentes Personalizados";
  if (normalized === "setup & organizacao") return "Setup Gamer e Home Office";
  if (normalized === "casa & decoracao") return hasAny(blob, ["organizador", "banheiro", "cozinha", "gaveta"]) ? "Casa e Organização" : "Decoração";
  if (normalized === "utilidades reais") return "Casa e Organização";
  if (normalized === "chaveiros") return "Chaveiros e Acessórios";
  if (normalized === "decoracao" || normalized === "decoração" || normalized === "home decor") return "Decoração";
  return null;
}

function inferCategory(product: TaxonomyProductInput, blob: string) {
  const primaryBlob = collectPrimaryBlob(product);
  const identityBlob = collectIdentityBlob(product);
  const reasons: string[] = [];
  let confidence: TaxonomyConfidence = "high";

  const personalizedTerms = ["personalizada", "personalizado", "personalizavel", "customizada", "customizado", "nome", "data", "familia"];
  const personalizedObjectTerms = ["medalha", "placa", "plaquinha", "boneco", "boneca", "trofeu", "nome", "letreiro", "familia"];
  const isAccessoryObject =
    hasWord(primaryBlob, "chaveiro") || hasWord(primaryBlob, "chaveiros") || hasWord(primaryBlob, "keychain") || hasWord(primaryBlob, "pingente") || hasWord(primaryBlob, "tag");
  if (hasAny(primaryBlob, personalizedTerms) && hasAny(primaryBlob, personalizedObjectTerms) && (!isAccessoryObject || hasWord(primaryBlob, "medalha"))) {
    reasons.push("objeto personalizado com categoria própria de presente");
    return { primaryCategory: "Presentes Personalizados" as const, reasons, confidence };
  }

  if (
    hasWord(primaryBlob, "chaveiro") ||
    hasWord(primaryBlob, "chaveiros") ||
    hasWord(primaryBlob, "keychain") ||
    hasWord(primaryBlob, "pingente") ||
    hasWord(primaryBlob, "tag")
  ) {
    reasons.push("objeto principal identificado como chaveiro/acessório");
    return { primaryCategory: "Chaveiros e Acessórios" as const, reasons, confidence };
  }

  const setupTerms = ["controle", "fone", "headset", "setup", "gamer", "monitor", "teclado", "mouse", "mousepad", "home office", "celular", "smartphone"];
  const setupEquipmentTerms = ["controle", "fone", "headset", "monitor", "teclado", "mouse", "mousepad", "home office", "celular", "smartphone"];
  const setupObjectTerms = ["suporte", "organizador", "base", "porta", "stand", "holder", "cabo", "keycap", "dock"];
  const decorativeSetupObject = hasAny(identityBlob, ["placa", "decoracao", "decorativo", "enfeite", "retro", "retrô"]);
  const explicitSetupContext = hasAny(identityBlob, setupEquipmentTerms) || (hasAny(identityBlob, ["setup", "gamer"]) && !decorativeSetupObject);
  if (hasAny(identityBlob, setupTerms) && explicitSetupContext && hasAny(identityBlob, setupObjectTerms)) {
    reasons.push("objeto de mesa/setup identificado");
    return { primaryCategory: "Setup Gamer e Home Office" as const, reasons, confidence };
  }

  const childTerms = ["brinquedo", "infantil", "crianca", "criança", "educativo", "ludico", "lúdico"];
  if (hasAny(primaryBlob, childTerms)) {
    reasons.push("uso infantil/educativo identificado");
    return { primaryCategory: "Infantil e Educativo" as const, reasons, confidence };
  }

  const houseTerms = [
    "porta creme",
    "porta escova",
    "banheiro",
    "cozinha",
    "joias",
    "caixa",
    "organizador",
    "organizador de gaveta",
    "divisoria de gaveta",
    "bandeja modular de gaveta",
    "gancho",
    "gaveta",
    "talher",
    "talheres",
    "porta objetos",
    "porta objeto",
    "porta ferramentas",
    "suporte domestico",
    "apoio compacto",
  ];
  if (hasAny(primaryBlob, houseTerms)) {
    reasons.push("utilidade doméstica/organização identificada");
    return { primaryCategory: "Casa e Organização" as const, reasons, confidence };
  }

  const geekTerms = [
    "homer",
    "pikachu",
    "pokemon",
    "demogorgon",
    "dragao",
    "cavaleiro",
    "anime",
    "jedi",
    "personagem",
    "rick",
    "morty",
    "hello kitty",
    "marvel",
    "star wars",
    "minecraft",
    "valorant",
    "league of legends",
    "one piece",
    "cultura pop",
    "geek",
    "nerd",
    "retro",
    "retrô",
    "arcade",
  ];
  const genericCollectibleTerms = ["colecionavel", "miniatura", "action figure", "desk toy"];
  if (hasAny(primaryBlob, geekTerms) || (hasAny(primaryBlob, genericCollectibleTerms) && mapLegacyCategory(primaryBlob, product.category) === "Geek & Colecionáveis")) {
    reasons.push("termos de personagem, cultura pop ou colecionável");
    return { primaryCategory: "Geek & Colecionáveis" as const, reasons, confidence };
  }

  const decorTerms = ["vaso", "escultura", "enfeite", "quadro", "placa decorativa", "luminaria", "estante", "decoracao", "decorativo"];
  if (hasAny(primaryBlob, decorTerms)) {
    reasons.push("objeto decorativo identificado");
    return { primaryCategory: "Decoração" as const, reasons, confidence };
  }

  const technicalTerms = ["stl", "3mf", "sob medida", "tecnica", "tecnico", "adaptador", "prototipo", "reposicao", "componente por medida"];
  if (
    hasAny(primaryBlob, technicalTerms) ||
    (hasAny(primaryBlob, ["peca", "peça"]) &&
      hasAny(primaryBlob, ["sob medida", "tecnica", "tecnico", "adaptador", "stl", "reposicao", "componente", "prototipo"]))
  ) {
    reasons.push("termos de peça técnica/sob medida");
    return { primaryCategory: "Peças Técnicas e Sob Medida" as const, reasons, confidence };
  }

  const lotTerms = ["lote", "corporativo", "institucional", "pedido em quantidade", "venda em lote", "pecas repetitivas", "peças repetitivas"];
  if (hasAny(primaryBlob, lotTerms) || (hasWord(primaryBlob, "kit") && hasAny(primaryBlob, ["brinde", "corporativo", "evento", "lote"]))) {
    reasons.push("termos de lote/brinde/corporativo");
    return { primaryCategory: "Lotes e Brindes Corporativos" as const, reasons, confidence };
  }

  const mapped = mapLegacyCategory(blob, product.category);
  if (mapped) {
    reasons.push(`categoria anterior mapeada de "${displayText(product.category)}"`);
    confidence = "medium";
    return { primaryCategory: mapped, reasons, confidence };
  }

  reasons.push("sem regra forte; mantido em utilidade especial para revisão");
  return { primaryCategory: "Utilidades Especiais" as const, reasons, confidence: "low" as const };
}

function inferBuyingIntents(
  product: TaxonomyProductInput,
  blob: string,
  primaryCategory: CatalogPrimaryCategory,
  objectType: ProductObjectType
) {
  const intents: BuyingIntent[] = [];

  if (product.readyToShip || normalizeText(product.status).includes("pronta")) addIntent(intents, "pronta_entrega");
  else addIntent(intents, "sob_encomenda");

  if (product.customizable || hasAny(blob, ["personalizado", "personalizada", "nome", "data", "cor sob consulta", "sob medida", "logo"])) {
    addIntent(intents, "personalizar");
  }

  if (primaryCategory === "Chaveiros e Acessórios") {
    addIntent(intents, "presentear");
    if (product.customizable || hasAny(blob, ["nome", "logo", "personalizado", "personalizada"])) addIntent(intents, "personalizar");
  }
  if (primaryCategory === "Geek & Colecionáveis") {
    addIntent(intents, "colecionar");
    addIntent(intents, "decorar");
    addIntent(intents, "presentear");
  }
  if (primaryCategory === "Casa e Organização") addIntent(intents, "organizar");
  if (primaryCategory === "Setup Gamer e Home Office") {
    addIntent(intents, "setup");
    addIntent(intents, "organizar");
  }
  if (primaryCategory === "Presentes Personalizados") {
    addIntent(intents, "presentear");
    addIntent(intents, "personalizar");
  }
  if (primaryCategory === "Decoração") addIntent(intents, "decorar");
  if (primaryCategory === "Peças Técnicas e Sob Medida") {
    addIntent(intents, "peça_tecnica");
    addIntent(intents, "personalizar");
  }
  if (primaryCategory === "Lotes e Brindes Corporativos") {
    addIntent(intents, "comprar_em_lote");
    addIntent(intents, "corporativo");
    addIntent(intents, "personalizar");
  }
  if (primaryCategory === "Infantil e Educativo") {
    addIntent(intents, "infantil");
    addIntent(intents, "presentear");
  }
  if (primaryCategory === "Utilidades Especiais" && objectType !== "outro") addIntent(intents, "organizar");

  if (hasAny(blob, ["presente", "lembranca", "lembrancinha"])) addIntent(intents, "presentear");
  if (hasAny(blob, ["decor", "estante", "nicho"])) addIntent(intents, "decorar");
  if (
    hasAny(blob, ["lote", "corporativo", "evento", "pedido em quantidade", "venda em lote", "brinde corporativo"]) ||
    (hasWord(blob, "kit") && hasAny(blob, ["brinde", "corporativo", "evento", "lote"]))
  ) {
    addIntent(intents, "comprar_em_lote");
    addIntent(intents, "corporativo");
  }
  if (hasAny(blob, ["setup", "gamer", "controle", "fone", "monitor", "teclado", "mouse"])) addIntent(intents, "setup");
  if (hasAny(blob, ["organizador", "suporte", "gaveta", "banheiro", "cozinha", "cabo"])) addIntent(intents, "organizar");
  if (hasAny(blob, ["brinquedo", "infantil", "crianca", "educativo"])) addIntent(intents, "infantil");

  return intents;
}

function buildUseCaseTags(
  product: TaxonomyProductInput,
  classification: Pick<CatalogTaxonomyClassification, "primaryCategory" | "subcategory" | "objectType" | "buyingIntents">
) {
  const source = [
    classification.primaryCategory,
    classification.subcategory,
    classification.objectType,
    ...classification.buyingIntents,
    product.material,
    product.finish,
    product.readyToShip ? "pronta entrega" : "sob encomenda",
    product.customizable ? "personalizável" : "",
  ];
  return unique(source.map(displayText).filter(Boolean)).slice(0, 14);
}

function buildSeoKeywords(
  product: TaxonomyProductInput,
  classification: Pick<CatalogTaxonomyClassification, "primaryCategory" | "subcategory" | "objectType" | "buyingIntents">
) {
  const productName = displayText(product.name || product.title);
  const words = splitWords(productName).filter((token) => !["para", "com", "por", "uma", "dos", "das"].includes(token));
  const source = [
    productName,
    ...words.slice(0, 5),
    classification.primaryCategory,
    classification.subcategory,
    classification.objectType,
    ...classification.buyingIntents,
    product.material,
    "impressão 3D",
    "MDH 3D",
  ];
  return unique(source.map(displayText).filter(Boolean)).slice(0, 16);
}

export function classifyCatalogProduct(product: TaxonomyProductInput): CatalogTaxonomyClassification {
  const blob = collectBlob(product);
  const primaryBlob = collectPrimaryBlob(product);
  const categoryResult = inferCategory(product, blob);
  const objectType = inferObjectType(primaryBlob, categoryResult.primaryCategory);
  const subcategory = inferSubcategory(primaryBlob, categoryResult.primaryCategory, objectType);
  const buyingIntents = inferBuyingIntents(product, blob, categoryResult.primaryCategory, objectType);
  const classification = {
    primaryCategory: categoryResult.primaryCategory,
    subcategory,
    productTypePath: buildProductTypePath(categoryResult.primaryCategory, subcategory),
    buyingIntents,
    objectType,
    useCaseTags: [],
    seoKeywords: [],
    confidence: categoryResult.confidence,
    classificationReason: categoryResult.reasons.join("; "),
  } satisfies CatalogTaxonomyClassification;

  return {
    ...classification,
    useCaseTags: buildUseCaseTags(product, classification),
    seoKeywords: buildSeoKeywords(product, classification),
  };
}

export function applyCatalogTaxonomy<T extends TaxonomyProductInput>(product: T): T & CatalogTaxonomyClassification {
  const automatic = classifyCatalogProduct(product);
  const manualPrimary = isValidPrimaryCategory(product.primaryCategory) ? product.primaryCategory : null;
  const primaryCategory = manualPrimary || automatic.primaryCategory;
  const existingSubcategory = displayText(product.subcategory);
  const validOfficialSubcategory = SUBCATEGORIES_BY_CATEGORY[primaryCategory].some(
    (subcategory) => normalizeText(subcategory) === normalizeText(existingSubcategory)
  );
  const subcategory =
    manualPrimary && existingSubcategory
      ? existingSubcategory
      : validOfficialSubcategory
        ? existingSubcategory
        : automatic.subcategory;
  const buyingIntents = normalizeIntentList(product.buyingIntents);
  const objectType = isValidObjectType(product.objectType) ? product.objectType : automatic.objectType;
  const classification: CatalogTaxonomyClassification = {
    primaryCategory,
    subcategory,
    productTypePath: displayText(product.productTypePath) || buildProductTypePath(primaryCategory, subcategory),
    buyingIntents: buyingIntents.length ? buyingIntents : automatic.buyingIntents,
    objectType,
    useCaseTags: normalizeStringList(product.useCaseTags).length ? normalizeStringList(product.useCaseTags) : automatic.useCaseTags,
    seoKeywords: normalizeStringList(product.seoKeywords).length ? normalizeStringList(product.seoKeywords) : automatic.seoKeywords,
    confidence:
      product.confidence === "high" || product.confidence === "medium" || product.confidence === "low"
        ? product.confidence
        : automatic.confidence,
    classificationReason: displayText(product.classificationReason) || automatic.classificationReason,
  };
  const cleanedTags = normalizeStringList(product.tags, 80).filter((tag) => {
    const normalized = normalizeText(tag);
    return !PUBLIC_TEXT_BANNED_TERMS.some((term) => normalized.includes(normalizeText(term)));
  });

  return {
    ...product,
    ...classification,
    category: classification.primaryCategory,
    subcategory: classification.subcategory,
    tags: unique([
      ...cleanedTags,
      ...classification.useCaseTags,
      ...classification.seoKeywords,
      classification.objectType,
      ...classification.buyingIntents,
    ]).slice(0, 90),
  };
}

export function normalizePublicTaxonomyText(value: string) {
  let next = value;
  const replacements: Array<[RegExp, string]> = [
    [/fotos?\s+rea(?:l|is)/gi, "imagens do produto"],
    [/render\s+fiel/gi, "visual validado"],
    [/foto\s+real\s+x\s+render\s+fiel/gi, "mídia validada do produto"],
    [/pe[cç]as\s+com\s+foto\s+real/gi, "produtos com imagem validada"],
  ];

  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }

  return next;
}

export const TAXONOMY_WEB_CLASSIFICATION_LIMIT = 100;
