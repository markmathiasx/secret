import type { Product } from "@/lib/catalog";

const GENERIC_DESCRIPTIONS = new Set([
  "Peça compacta e marcante para colecionar, decorar setup ou presentear.",
  "Peça compacta e marcante para colecionar, decorar setup ou presentear. Produzida em PLA Silk com acabamento premium.",
]);

const CATEGORY_MAP = new Map<string, string>([
  ["anime", "Geek & Colecionáveis"],
  ["chibi", "Geek & Colecionáveis"],
  ["desk-toy", "Geek & Colecionáveis"],
  ["mascote", "Geek & Colecionáveis"],
  ["colecionável", "Geek & Colecionáveis"],
  ["articulado", "Geek & Colecionáveis"],
  ["miniatura", "Geek & Colecionáveis"],
  ["acessório", "Geek & Colecionáveis"],
  ["geek & colecionáveis", "Geek & Colecionáveis"],
  ["setup & organização", "Setup & Organização"],
  ["suporte", "Setup & Organização"],
  ["organizador", "Setup & Organização"],
  ["casa & decoração", "Casa & Decoração"],
  ["vaso", "Casa & Decoração"],
  ["busto", "Casa & Decoração"],
  ["luminária", "Casa & Decoração"],
  ["foto", "Casa & Decoração"],
  ["quadro", "Casa & Decoração"],
  ["escultura", "Casa & Decoração"],
  ["relógio", "Casa & Decoração"],
  ["jarro", "Casa & Decoração"],
  ["prateleira", "Casa & Decoração"],
  ["espelho", "Casa & Decoração"],
  ["presentes criativos", "Presentes Criativos"],
  ["chaveiro", "Presentes Criativos"],
  ["nome", "Presentes Criativos"],
  ["caixa", "Presentes Criativos"],
  ["porta-retrato", "Presentes Criativos"],
  ["aniversário", "Presentes Criativos"],
  ["mensagem", "Presentes Criativos"],
  ["troféu", "Presentes Criativos"],
  ["marcador", "Presentes Criativos"],
  ["pingente", "Presentes Criativos"],
  ["calendário", "Presentes Criativos"],
  ["copo", "Presentes Criativos"],
  ["utilidades reais", "Utilidades Reais"],
  ["gancho", "Utilidades Reais"],
]);

function normalizeKey(value: string) {
  return value.trim().toLowerCase();
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toSentenceList(values: string[]) {
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} e ${values[1]}`;
  return `${values.slice(0, -1).join(", ")} e ${values.at(-1)}`;
}

function dedupe(values: string[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeKey(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const SEARCH_SYNONYMS = new Map<string, string[]>([
  ["geek & colecionáveis", ["geek", "colecionavel", "colecionaveis", "miniatura", "personagem", "fandom"]],
  ["setup & organização", ["setup", "organizacao", "organizador", "suporte", "mesa", "bancada", "home office"]],
  ["casa & decoração", ["casa", "decoracao", "decor", "estante", "nicho", "ambiente"]],
  ["presentes criativos", ["presente", "lembranca", "lembrancinha", "personalizado", "criativo", "brinde"]],
  ["utilidades reais", ["utilidade", "funcional", "uso diario", "pratico", "rotina"]],
  ["anime", ["anime", "otaku", "manga", "personagem"]],
  ["game", ["game", "gamer", "videogame", "jogo"]],
  ["gaming", ["gaming", "gamer", "setup gamer", "console"]],
  ["chibi", ["chibi", "cabecudo", "fofo", "colecionavel"]],
  ["miniatura", ["mini", "miniatura", "figure", "figurine"]],
  ["mascote", ["mascote", "buddy", "desk toy", "toy"]],
  ["articulado", ["articulado", "flexivel", "movel"]],
  ["suporte", ["suporte", "base", "holder"]],
  ["organizador", ["organizador", "organizacao", "arrumacao"]],
  ["personalizado", ["personalizado", "sob medida", "customizado", "customizavel"]],
  ["pla premium", ["pla premium", "impressao 3d", "bambulab", "produto 3d"]],
  ["pla silk", ["pla silk", "silk", "acetinado", "premium"]],
  ["premium", ["premium", "acabamento premium", "catalogo"]],
  ["texturizado", ["texturizado", "textura", "fosco"]],
  ["pronta entrega", ["pronta entrega", "envio rapido", "estoque", "entrega rapida"]],
  ["sob encomenda", ["sob encomenda", "produzido sob pedido", "feito por encomenda"]],
  ["pokemon", ["pokemon", "pikachu", "monstro de bolso"]],
  ["minecraft", ["minecraft", "blocky", "cubico"]],
  ["one piece", ["one piece", "pirata", "anime"]],
  ["frozen", ["frozen", "disney", "princesa"]],
  ["nintendo", ["nintendo", "game", "console"]],
  ["dragões", ["dragao", "dragoes", "dragon", "fantasia"]],
  ["oceano", ["oceano", "marinho", "mar", "aquatico"]],
  ["espacial", ["espacial", "espaco", "space", "foguete"]],
  ["medieval", ["medieval", "cavaleiro", "castelo", "fantasia"]],
]);

function collectSearchAliases(product: Product) {
  const normalizedCategory = normalizeProductCategory(product);
  const rawTerms = dedupe([
    normalizedCategory,
    product.category,
    product.subcategory,
    product.theme,
    product.collection,
    product.material,
    product.finish,
    product.readyToShip ? "Pronta entrega" : "Sob encomenda",
    product.customizable ? "Personalizado" : "",
    ...product.tags,
  ]).filter(Boolean);

  const aliasSet = new Set<string>();

  rawTerms.forEach((term) => {
    const normalized = normalizeSearchValue(term);
    const options = SEARCH_SYNONYMS.get(normalized) || [];
    options.forEach((option) => aliasSet.add(option));
    aliasSet.add(term);
    aliasSet.add(normalized);
  });

  if (normalizedCategory === "Geek & Colecionáveis") {
    aliasSet.add("presente geek");
    aliasSet.add("mini colecionavel");
  }

  if (normalizedCategory === "Setup & Organização") {
    aliasSet.add("organizacao de mesa");
    aliasSet.add("utilidade para setup");
  }

  if (product.customizable) {
    aliasSet.add("com nome");
    aliasSet.add("ajuste de cor");
  }

  if (product.readyToShip) {
    aliasSet.add("envio imediato");
    aliasSet.add("saida rapida");
  }

  return [...aliasSet];
}

function getAvailabilityCopy(product: Product) {
  return product.readyToShip
    ? "já tem pronta entrega para acelerar o envio"
    : `é produzido sob encomenda com janela de ${product.productionWindow.toLowerCase()}`;
}

function getUseCase(product: Product, normalizedCategory: string) {
  switch (normalizedCategory) {
    case "Geek & Colecionáveis":
      return `colecionar, decorar setup ou presentear fãs de ${product.theme || product.subcategory || "cultura pop"}`;
    case "Setup & Organização":
      return "organizar mesa, home office, bancada gamer ou acessórios do dia a dia";
    case "Casa & Decoração":
      return "compor nichos, estantes, aparadores e presentes com apelo visual";
    case "Presentes Criativos":
      return "datas especiais, kits comemorativos e lembranças personalizadas";
    case "Utilidades Reais":
      return "resolver uso diário com impressão 3D funcional e acabamento limpo";
    default:
      return "presentear, decorar ou organizar com produção local em 3D";
  }
}

function getCustomizationCopy(product: Product) {
  return product.customizable
    ? "Aceita ajuste de cor, personalização ou pequenas variações sob consulta."
    : "Segue o padrão visual apresentado no catálogo, respeitando disponibilidade de material e cor.";
}

export function normalizeProductCategory(product: Product) {
  return CATEGORY_MAP.get(normalizeKey(product.category)) || product.category;
}

export function isGenericProductDescription(description: string) {
  return GENERIC_DESCRIPTIONS.has(description.trim());
}

export function getProductCardDescription(product: Product) {
  if (!isGenericProductDescription(product.description) && product.description.trim().length >= 58) {
    return product.description.trim();
  }

  const normalizedCategory = normalizeProductCategory(product);
  const useCase = getUseCase(product, normalizedCategory);

  switch (normalizedCategory) {
    case "Geek & Colecionáveis":
      return `${product.name} em ${product.material} com acabamento ${product.finish.toLowerCase()} para ${useCase}.`;
    case "Setup & Organização":
      return `${product.name} pensado para ${useCase}, com estrutura em ${product.material} e visual limpo para uso constante.`;
    case "Casa & Decoração":
      return `${product.name} com impressão em ${product.material} e acabamento ${product.finish.toLowerCase()} para ${useCase}.`;
    case "Presentes Criativos":
      return `${product.name} criado para ${useCase}, com produção local em ${product.material} e foco em apresentação premium.`;
    case "Utilidades Reais":
      return `${product.name} feito em ${product.material} para ${useCase}, priorizando resistência, encaixe e rotina prática.`;
    default:
      return `${product.name} produzido em ${product.material} para presentear, organizar ou decorar com acabamento ${product.finish.toLowerCase()}.`;
  }
}

export function getProductLongDescription(product: Product) {
  const normalizedCategory = normalizeProductCategory(product);
  const colors = dedupe(product.colors).slice(0, 3);
  const colorCopy = colors.length ? ` As cores mais recorrentes nessa linha são ${toSentenceList(colors).toLowerCase()}.` : "";

  return `${getProductCardDescription(product)} ${product.name} faz parte da linha ${normalizedCategory.toLowerCase()} da MDH 3D, com dimensões de ${product.dimensions}, consumo estimado de ${product.plaWeight ?? `${product.grams}g`} e tempo médio de ${product.printTime ?? `${product.hours}h`} por unidade. ${getAvailabilityCopy(product)} e utiliza ${product.material} com acabamento ${product.finish.toLowerCase()}, pensado para ${getUseCase(product, normalizedCategory)}.${colorCopy} ${getCustomizationCopy(product)}`.replace(/\s+/g, " ").trim();
}

export function getProductHighlights(product: Product) {
  const availability = product.readyToShip ? "Pronta entrega quando disponível em estoque" : `Produção em ${product.productionWindow}`;
  const customization = product.customizable ? "Aceita personalização de cor ou ajustes sob consulta" : "Modelo padronizado com acabamento consistente";
  return [
    `${product.material} com acabamento ${product.finish.toLowerCase()}`,
    availability,
    customization,
  ];
}

export function buildProductSearchText(product: Product) {
  return [
    product.name,
    normalizeProductCategory(product),
    product.category,
    product.subcategory,
    product.theme,
    product.collection,
    getProductCardDescription(product),
    getProductLongDescription(product),
    product.material,
    product.finish,
    product.sku,
    ...product.colors,
    ...product.tags,
    ...collectSearchAliases(product),
  ]
    .join(" ")
    .split(/\s+/)
    .map((token) => normalizeSearchValue(token))
    .filter(Boolean)
    .join(" ");
}

export function getProductSearchScore(product: Product, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return 1;

  const normalizedName = normalizeSearchValue(product.name);
  const normalizedSku = normalizeSearchValue(product.sku);
  const normalizedCategory = normalizeSearchValue(normalizeProductCategory(product));
  const searchText = buildProductSearchText(product);
  const tokens = dedupe(normalizedQuery.split(/\s+/).filter((token) => token.length >= 2));

  let score = 0;

  if (normalizedSku === normalizedQuery) score += 220;
  else if (normalizedSku.startsWith(normalizedQuery)) score += 150;

  if (normalizedName === normalizedQuery) score += 180;
  else if (normalizedName.startsWith(normalizedQuery)) score += 130;
  else if (normalizedName.includes(normalizedQuery)) score += 95;

  if (normalizedCategory === normalizedQuery) score += 80;
  else if (normalizedCategory.includes(normalizedQuery)) score += 50;

  if (searchText.includes(normalizedQuery)) score += 35;

  let matchedTokens = 0;
  tokens.forEach((token) => {
    if (normalizedName.includes(token)) {
      score += 24;
      matchedTokens += 1;
      return;
    }
    if (normalizedSku.includes(token)) {
      score += 20;
      matchedTokens += 1;
      return;
    }
    if (searchText.includes(token)) {
      score += 10;
      matchedTokens += 1;
    }
  });

  if (tokens.length && matchedTokens === tokens.length) score += 36;
  if (tokens.length > 1 && matchedTokens >= Math.ceil(tokens.length / 2)) score += 14;

  return matchedTokens === 0 && !searchText.includes(normalizedQuery) ? 0 : score;
}
