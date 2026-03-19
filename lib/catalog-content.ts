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
    ...product.colors,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();
}
