import { deliveryZones } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type PaymentMethod = "pix" | "cartao" | "boleto";
export type SalesChannel = "site" | "mercadolivre" | "shopee" | "whatsapp";
export type ProductType = "spare_part" | "upgrade" | "consumable" | "kit" | "accessory";
export type SupplierType = "oem" | "aftermarket" | "dropship" | "remanufaturado";
export type OriginalityLevel = "OEM" | "Compativel" | "Remanufaturado" | "Usado de maquina nova";
export type CompatibilityModel = "A1 Mini" | "A1";
export type ComponentScope = "toolhead" | "extrusora" | "motion" | "mesa" | "eletronica" | "acessorios";

export type ProductTechnical = {
  compatibilityModels: CompatibilityModel[];
  compatibilityVerified: boolean;
  seriesCompatible?: string;
  partNumber?: string;
  typeProduct: ProductType;
  supplierType: SupplierType;
  originalityLevel: OriginalityLevel;
  componentScope: ComponentScope;
  nozzleDiameterMm?: 0.2 | 0.4 | 0.6 | 0.8;
  tempMaxC?: number;
  voltage?: string;
  connectors?: string;
  dimensionsMm?: string;
  packageDimensionsMm?: string;
  weightProductG?: number;
  weightPackageG?: number;
  installTimeMin?: number;
  toolsRequired?: string[];
  safetyWarnings: string[];
  cadFiles?: string[];
  cadLicense?: string;
  bomItems?: { sku: string; name: string; qty: number }[];
  crossRefSkus?: string[];
  symptomTags?: string[];
};

export type Product = {
  id: string;
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
  licenseType?: "personal" | "commercial";
  variants?: { color: string; available: boolean }[];
  pricePix: number;
  priceCard: number;
  marketplaceSuggested: number;
  productionWindow: string;
  imageHint: string;
  image?: string;
  material: string;
  finish: string;
  status: "Pronta entrega" | "Sob encomenda";
  stock: number;
  customizable: boolean;
  readyToShip?: boolean;
  realPhoto?: boolean;
  technical: ProductTechnical;
  seoTitle: string;
  seoMetaDescription: string;
  discountPixPct: number;
  parcelamentoMax: number;
  leadTimeDays: number;
  rating: number;
  reviewCount: number;
};

type CatalogSeed = {
  id: string;
  sku: string;
  name: string;
  imageSrc: string;
  gallery?: string[];
  description: string;
  pricePix: number;
  category?: string;
  subcategory?: string;
  theme?: string;
  collection?: string;
  colors?: string[];
  grams?: number;
  hours?: number;
  complexity?: number;
  featured?: boolean;
  tags?: string[];
  dimensions?: string;
  licenseType?: "personal" | "commercial";
  productionWindow?: string;
  imageHint?: string;
  material?: string;
  finish?: string;
  status?: "Pronta entrega" | "Sob encomenda";
  stock?: number;
  customizable?: boolean;
  technical?: Partial<ProductTechnical>;
  seoTitle?: string;
  seoMetaDescription?: string;
  discountPixPct?: number;
  parcelamentoMax?: number;
  leadTimeDays?: number;
  rating?: number;
  reviewCount?: number;
};

const filamentCostPerGram = 0.11;
const defaultWarnings = [
  "Desligue e desconecte da tomada antes de instalar ou remover qualquer peca.",
  "Aguarde resfriamento completo do hotend antes de tocar no conjunto (A1 Mini pode operar ate 300C).",
];

function toPriceEnding(value: number) {
  const base = Math.max(9, Math.ceil(value));
  return Number((base - 0.1).toFixed(2));
}

function toMoney(value: number) {
  return Number(value.toFixed(2));
}

function buildTechnical(seed: CatalogSeed): ProductTechnical {
  const grams = seed.grams ?? 50;
  const technical: ProductTechnical = {
    compatibilityModels: ["A1 Mini", "A1"],
    compatibilityVerified: true,
    seriesCompatible: "A1 Series",
    partNumber: seed.sku,
    typeProduct: "accessory",
    supplierType: "aftermarket",
    originalityLevel: "Compativel",
    componentScope: "acessorios",
    dimensionsMm: seed.dimensions ?? "100x100x100",
    packageDimensionsMm: "120x120x80",
    weightProductG: grams,
    weightPackageG: grams + 30,
    installTimeMin: 1,
    toolsRequired: [],
    safetyWarnings: defaultWarnings,
    ...seed.technical,
  };
  technical.safetyWarnings = seed.technical?.safetyWarnings?.length ? seed.technical.safetyWarnings : defaultWarnings;
  return technical;
}

function createProduct(seed: CatalogSeed): Product {
  const colors = seed.colors ?? ["Preto"];
  const grams = seed.grams ?? 50;
  const hours = seed.hours ?? 2;
  const complexity = seed.complexity ?? 1.2;
  const status = seed.status ?? "Pronta entrega";
  const material = seed.material ?? "PLA Premium";
  const finish = seed.finish ?? "Fosco";
  const dimensions = seed.dimensions ?? "10x10x10cm";
  const imageHint = seed.imageHint ?? seed.name.toLowerCase();
  const productionWindow = seed.productionWindow ?? (status === "Pronta entrega" ? "24h a 48h" : "3 a 5 dias");
  const discountPixPct = seed.discountPixPct ?? 10;
  const parcelamentoMax = seed.parcelamentoMax ?? 12;
  const leadTimeDays = seed.leadTimeDays ?? (status === "Pronta entrega" ? 1 : 4);
  const rating = seed.rating ?? 4.8;
  const reviewCount = seed.reviewCount ?? 18;

  const images = [seed.imageSrc, ...(seed.gallery ?? [])];
  return {
    id: seed.id,
    sku: seed.sku,
    name: seed.name,
    category: seed.category ?? "Accessories",
    subcategory: seed.subcategory ?? "Linha marketplace",
    theme: seed.theme ?? "marketplace",
    collection: seed.collection ?? "Fotos reais",
    colors,
    grams,
    hours,
    complexity,
    featured: seed.featured ?? true,
    description: seed.description,
    tags: seed.tags ?? ["a1 mini", "foto real", "marketplace"],
    pricePix: seed.pricePix,
    priceCard: toMoney(seed.pricePix * 1.12),
    marketplaceSuggested: toMoney(seed.pricePix * 1.18),
    price: seed.pricePix,
    printTime: `${hours}h`,
    plaWeight: `${grams}g`,
    dimensions,
    images,
    image: images[0],
    licenseType: seed.licenseType ?? "commercial",
    variants: colors.map((color) => ({ color, available: true })),
    productionWindow,
    imageHint,
    material,
    finish,
    status,
    stock: seed.stock ?? 10,
    customizable: seed.customizable ?? false,
    readyToShip: status === "Pronta entrega",
    realPhoto: true,
    technical: buildTechnical(seed),
    seoTitle: seed.seoTitle ?? seed.name,
    seoMetaDescription: seed.seoMetaDescription ?? seed.description,
    discountPixPct,
    parcelamentoMax,
    leadTimeDays,
    rating,
    reviewCount,
  };
}

const baseCatalog: Product[] = [
  createProduct({
    id: "real-001",
    sku: "A1M-CONS-GRINDER-HEX-BLK-R1",
    name: "Moedor Hex Black para limpeza de residuos (A1 Mini)",
    imageSrc: "/products/foto-001-grinder-01.webp",
    gallery: ["/products/foto-extra-real-001-01.jpg"],
    description: "Foto real do moedor preto com textura lateral e tampa rosqueada para rotina de bancada.",
    pricePix: 49.9,
    category: "Consumables",
    subcategory: "Limpeza e manutencao",
    tags: ["moedor", "limpeza", "bancada", "a1 mini"],
    technical: { typeProduct: "consumable", symptomTags: ["limpeza", "residuo"] },
  }),
  createProduct({
    id: "real-002",
    sku: "A1M-UPG-GRINDER-TURBINE-BLK-R1",
    name: "Moedor Turbine Pro de dupla tampa (A1 Mini)",
    imageSrc: "/products/foto-002-grinder-02.webp",
    gallery: ["/products/foto-extra-real-003-02.jpg"],
    description: "Moedor de dupla tampa com dentes altos para trituracao eficiente e limpeza rapida da bancada.",
    pricePix: 57.9,
    category: "Upgrades",
    subcategory: "Bancada e processo",
    technical: { typeProduct: "upgrade", crossRefSkus: ["A1M-CONS-GRINDER-HEX-BLK-R1"] },
  }),
  createProduct({
    id: "real-003",
    sku: "A1M-ACC-PASTA-HOLDER-R1",
    name: "Suporte compacto para tubo de pasta ou cola",
    imageSrc: "/products/foto-003-porta-creme-dental.webp",
    gallery: ["/products/foto-extra-real-003-01.jpg"],
    description: "Suporte compacto para cola e pasta de bancada, com pegada firme e acesso rapido durante montagem.",
    pricePix: 27.9,
    category: "Accessories",
    subcategory: "Organizacao de bancada",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-004",
    sku: "A1M-ACC-DEMOGORGON-DISPLAY-R1",
    name: "Display Demogorgon 3D para setup de oficina",
    imageSrc: "/products/foto-004-demogorgon.webp",
    gallery: ["/products/foto-extra-real-004-01.jpg"],
    description: "Miniatura premium em cenario cinematografico para vitrine geek e decoracao de estacao de trabalho.",
    pricePix: 119.9,
    status: "Sob encomenda",
    category: "Accessories",
    subcategory: "Decoracao geek",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-005",
    sku: "A1M-ACC-KITTY-JEDI-R1",
    name: "Hello Kitty Jedi Edition para mesa de impressao",
    imageSrc: "/products/foto-005-hello-kitty-jedi.webp",
    gallery: ["/products/foto-extra-real-005-01.jpg"],
    description: "Edicao tematica colecionavel com base detalhada para presente geek e destaque no setup.",
    pricePix: 109.9,
    status: "Sob encomenda",
    category: "Accessories",
    subcategory: "Decoracao geek",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-006",
    sku: "A1M-SPARE-PLACA-PORTAL-R1",
    name: "Placa decorativa Portal para setup A1 Mini",
    imageSrc: "/products/foto-006-stencil-rick-morty.webp",
    gallery: ["/products/foto-extra-real-004-02.jpg"],
    description: "Placa vazada estilo sci-fi para parede, setup gamer e estacao de impressao com visual neon.",
    pricePix: 42.9,
    category: "Spare parts",
    subcategory: "Placa e recorte",
    customizable: true,
    technical: { typeProduct: "spare_part", cadFiles: ["/downloads/cad/placa-portal.stl"] },
  }),
  createProduct({
    id: "real-007",
    sku: "A1M-KIT-FAMILIA-CUSTOM-R1",
    name: "Kit estatueta familia personalizada",
    imageSrc: "/products/foto-007-familia-custom.webp",
    gallery: ["/products/foto-extra-real-006-01.jpg"],
    description: "Estatueta personalizada com base premium para presente afetivo, memoria de casal ou familia.",
    pricePix: 169.9,
    category: "Kits",
    subcategory: "Personalizados",
    status: "Sob encomenda",
    customizable: true,
    technical: {
      typeProduct: "kit",
      bomItems: [
        { sku: "BASE-CUSTOM-WHITE", name: "Base personalizada", qty: 1 },
        { sku: "BONECO-CUSTOM-FAMILIA", name: "Conjunto de personagens", qty: 1 },
      ],
    },
  }),
  createProduct({
    id: "real-008",
    sku: "A1M-ACC-BONECA-RAINBOW-R1",
    name: "Boneca Arco-Iris para vitrine infantil",
    imageSrc: "/products/foto-008-boneca-crianca.webp",
    gallery: ["/products/foto-extra-real-003-03.jpg"],
    description: "Boneca em estilo artesanal com base decorada para quarto infantil e kits comemorativos.",
    pricePix: 129.9,
    category: "Accessories",
    subcategory: "Decoracao infantil",
    status: "Sob encomenda",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-009",
    sku: "A1M-SPARE-CASE-LIGHTER-SKULL-R1",
    name: "Case Skull para isqueiro - reposicao premium",
    imageSrc: "/products/foto-009-case-isqueiro-caveira.webp",
    gallery: ["/products/foto-extra-real-005-02.jpg"],
    description: "Case premium com relevo de caveira, acabamento fosco e encaixe firme para uso diario.",
    pricePix: 34.9,
    category: "Spare parts",
    subcategory: "Case de protecao",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "spare_part" },
  }),
  createProduct({
    id: "real-010",
    sku: "A1M-ACC-HOMER-PIKA-R1",
    name: "Homer Pikachu Mashup para colecao geek",
    imageSrc: "/products/foto-010-homer-pikachu.webp",
    gallery: ["/products/foto-extra-real-010-01.jpg"],
    description: "Figure mashup em alta definicao para colecao geek, presente criativo e decoracao de bancada.",
    pricePix: 84.9,
    category: "Accessories",
    subcategory: "Decoracao geek",
    status: "Sob encomenda",
    licenseType: "personal",
    technical: { compatibilityModels: ["A1 Mini"], typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-011",
    sku: "A1M-ACC-KEYTAG-MASON-R1",
    name: "Chaveiro medalha personalizado premium",
    imageSrc: "/products/foto-011-chaveiro-maconaria.webp",
    gallery: ["/products/foto-extra-real-004-03.jpg"],
    description: "Medalha personalizada com corrente metalica para brindes de evento, loja e encomenda em lote.",
    pricePix: 22.9,
    featured: false,
    category: "Accessories",
    subcategory: "Chaveiros e tags",
    customizable: true,
    technical: { typeProduct: "accessory", cadFiles: ["/downloads/cad/chaveiro-medalha.stl"] },
  }),
  createProduct({
    id: "real-012",
    sku: "A1M-ACC-KEYCHAIN-BRASIL-R1",
    name: "Chaveiro Brasil multicor em camadas",
    imageSrc: "/products/foto-012-chaveiro-brasil.webp",
    description: "Foto real na mao mostrando bandeira e escudo em camadas para lembrancas e presentes.",
    pricePix: 18.9,
    category: "Accessories",
    subcategory: "Chaveiros e tags",
    customizable: true,
    technical: { typeProduct: "accessory" },
  }),
  createProduct({
    id: "real-013",
    sku: "A1M-ACC-KEYCHAIN-YOSHI-R1",
    name: "Chaveiro Yoshi verde para colecao gamer",
    imageSrc: "/products/foto-013-chaveiro-yoshi.webp",
    description: "Foto real do lote de chaveiros verdes em mesa de impressora para giro rapido.",
    pricePix: 19.9,
    category: "Accessories",
    subcategory: "Chaveiros e tags",
    technical: { typeProduct: "accessory", symptomTags: ["lote", "evento gamer"] },
  }),
  createProduct({
    id: "real-014",
    sku: "A1M-KIT-MASCOTE-GAMER-CAT-R1",
    name: "Kit mascote gata gamer personalizada",
    imageSrc: "/products/foto-014-gatinha-headset.webp",
    gallery: ["/products/foto-014-gatinha-headset.gif"],
    description: "Foto real da mascote laranja com headset para kits de creator e streamers.",
    pricePix: 69.9,
    category: "Kits",
    subcategory: "Mascotes custom",
    status: "Sob encomenda",
    customizable: true,
    technical: {
      compatibilityModels: ["A1 Mini"],
      typeProduct: "kit",
      bomItems: [
        { sku: "MASCOTE-CAT-BODY", name: "Corpo principal", qty: 1 },
        { sku: "MASCOTE-CAT-HEADSET", name: "Headset e aderecos", qty: 1 },
      ],
    },
  }),
  createProduct({
    id: "proj-101",
    sku: "A1M-ACC-ORG-3DRAWER-R1",
    name: "Organizador de mesa 3 gavetas print-in-place",
    imageSrc: "/products/bambu-018-organizador-de-mesa-3-gavetas.webp",
    gallery: ["/products/bambu-018-organizador-3gavetas.webp"],
    description: "Organizador robusto com tres gavetas para ferramentas, bicos e pecas pequenas da bancada de impressao.",
    pricePix: 64.9,
    category: "Accessories",
    subcategory: "Organizacao de bancada",
    collection: "Projetos para vender",
    tags: ["organizador", "gavetas", "bancada", "ferramentas"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-ORG-3DRAWER",
      symptomTags: ["organizacao da bancada", "gavetas", "ferramentas pequenas"],
    },
  }),
  createProduct({
    id: "proj-102",
    sku: "A1M-ACC-DESK-CABLE-KIT-R1",
    name: "Kit passa-fios de mesa modular",
    imageSrc: "/products/util-011-organizador-fios.webp",
    gallery: ["/products/util-006-organizador-cabos.webp"],
    description: "Kit modular para organizar cabos e fios na mesa, reduzindo bagunca visual e enroscos no uso diario.",
    pricePix: 29.9,
    category: "Accessories",
    subcategory: "Gerenciamento de cabos",
    collection: "Projetos para vender",
    tags: ["passa-fio", "organizador", "cabo", "mesa"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-DESK-CABLE-KIT",
      symptomTags: ["cabos embaracados", "organizacao de fios", "setup limpo"],
    },
  }),
  createProduct({
    id: "proj-103",
    sku: "A1M-ACC-GLASSES-STAND-R1",
    name: "Suporte para oculos dobravel",
    imageSrc: "/products/util-015-suporte-oculos.webp",
    description: "Suporte compacto para oculos com abertura rapida, ideal para mesa de trabalho e home office.",
    pricePix: 32.9,
    category: "Accessories",
    subcategory: "Organizacao pessoal",
    collection: "Projetos para vender",
    tags: ["oculos", "suporte", "mesa", "organizacao"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-GLASSES-STAND",
      symptomTags: ["oculos sem lugar", "mesa organizada", "acesso rapido"],
    },
  }),
  createProduct({
    id: "proj-104",
    sku: "A1M-ACC-GAMEPAD-STAND-R1",
    name: "Suporte para controle gamer",
    imageSrc: "/products/util-009-suporte-controle.webp",
    description: "Base de apoio para controle com encaixe firme e visual clean para setup gamer e bancada.",
    pricePix: 39.9,
    category: "Accessories",
    subcategory: "Setup gamer",
    collection: "Projetos para vender",
    tags: ["controle", "gamer", "suporte", "organizacao"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-GAMEPAD-STAND",
      symptomTags: ["controle solto", "setup gamer", "organizacao da mesa"],
    },
  }),
  createProduct({
    id: "proj-105",
    sku: "A1M-ACC-SPINNER-TRI-R1",
    name: "Spinner triangular antiestresse",
    imageSrc: "/products/fidget-003-spinner-triangular.webp",
    description: "Fidget compacto de giro suave para aliviar stress durante estudo, trabalho ou atendimento.",
    pricePix: 17.9,
    category: "Accessories",
    subcategory: "Fidget e desk toys",
    collection: "Projetos para vender",
    tags: ["spinner", "fidget", "antiestresse", "presente"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-SPINNER-TRI",
      symptomTags: ["antiestresse", "fidget de bolso", "presente rapido"],
    },
  }),
  createProduct({
    id: "proj-106",
    sku: "A1M-ACC-ROBO-PENHOLDER-R1",
    name: "Porta-canetas robo multiuso",
    imageSrc: "/products/util-003-porta-canetas-robo.webp",
    description: "Organizador em formato robo para canetas e ferramentas leves, com apelo visual para escritorio.",
    pricePix: 34.9,
    category: "Accessories",
    subcategory: "Organizacao de escritorio",
    collection: "Projetos para vender",
    tags: ["porta-canetas", "robo", "escritorio", "organizacao"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-ROBO-PENHOLDER",
      symptomTags: ["mesa baguncada", "canetas espalhadas", "decoracao funcional"],
    },
  }),
  createProduct({
    id: "proj-107",
    sku: "A1M-ACC-CABLE-RAIL-R1",
    name: "Organizador de cabos com trilho",
    imageSrc: "/products/util-006-organizador-cabos.webp",
    gallery: ["/products/util-011-organizador-fios.webp"],
    description: "Trilho para passagem de cabos com fixacao rapida, ideal para setup de impressora, notebook e monitor.",
    pricePix: 24.9,
    category: "Accessories",
    subcategory: "Gerenciamento de cabos",
    collection: "Projetos para vender",
    tags: ["organizador de cabos", "trilho", "setup limpo", "mesa"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-CABLE-RAIL",
      symptomTags: ["cabo aparente", "fios na mesa", "setup organizado"],
    },
  }),
  createProduct({
    id: "proj-108",
    sku: "A1M-ACC-PHONE-EXO-R1",
    name: "Suporte de celular exoskeleton",
    imageSrc: "/products/bambu-016-suporte-de-celular-exoskeleton.webp",
    gallery: ["/products/bambu-016-suporte-exoskeleton.webp"],
    description: "Suporte com design exoskeleton para celular, excelente para lives, videochamadas e bancada tecnica.",
    pricePix: 44.9,
    category: "Accessories",
    subcategory: "Suportes para celular",
    collection: "Projetos para vender",
    tags: ["suporte celular", "exoskeleton", "mesa", "live"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-PHONE-EXO",
      symptomTags: ["celular sem apoio", "suporte para live", "ergonomia de mesa"],
    },
  }),
  createProduct({
    id: "proj-109",
    sku: "A1M-ACC-WATCH-STAND-R1",
    name: "Suporte para relogio e smartwatch",
    imageSrc: "/products/util-013-suporte-relogio.webp",
    description: "Base elegante para relogio com encaixe seguro e visual premium para loja, quarto ou escritorio.",
    pricePix: 28.9,
    category: "Accessories",
    subcategory: "Organizacao pessoal",
    collection: "Projetos para vender",
    tags: ["smartwatch", "relogio", "suporte", "organizador"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-WATCH-STAND",
      symptomTags: ["relogio sem apoio", "organizacao pessoal", "expositor de relogio"],
    },
  }),
  createProduct({
    id: "proj-110",
    sku: "A1M-ACC-ORG-2DRAWER-R1",
    name: "Organizador compacto 2 gavetas",
    imageSrc: "/products/util-002-organizador-2gavetas.webp",
    gallery: ["/products/bambu-018-organizador-3gavetas.webp"],
    description: "Organizador compacto com duas gavetas para parafusos, bits, conectores e pequenos componentes.",
    pricePix: 49.9,
    category: "Accessories",
    subcategory: "Organizacao de ferramentas",
    collection: "Projetos para vender",
    tags: ["organizador", "2 gavetas", "pecas pequenas", "ferramentas"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-ORG-2DRAWER",
      symptomTags: ["ferramentas espalhadas", "pecas pequenas", "organizacao rapida"],
    },
  }),
  createProduct({
    id: "proj-111",
    sku: "A1M-ACC-MAKEUP-ORGANIZER-R1",
    name: "Organizador modular de maquiagem e utilitarios",
    imageSrc: "/products/util-014-organizador-maquiagem.webp",
    description: "Modulo organizador para maquiagem, pincel, ferramentas leves e itens de uso diario.",
    pricePix: 52.9,
    category: "Accessories",
    subcategory: "Organizacao pessoal",
    collection: "Projetos para vender",
    tags: ["organizador modular", "maquiagem", "mesa", "utilitarios"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-MAKEUP-ORGANIZER",
      symptomTags: ["maquiagem espalhada", "organizacao de bancada", "modulo multiuso"],
    },
  }),
  createProduct({
    id: "proj-112",
    sku: "A1M-ACC-DRAGON-STAND-R1",
    name: "Suporte Dragon multiuso",
    imageSrc: "/products/util-001-suporte-dragon.webp",
    gallery: ["/products/util-012-suporte-tablet.webp"],
    description: "Suporte com visual dragon para celular ou tablet, combinando decoracao e funcionalidade no setup.",
    pricePix: 37.9,
    category: "Accessories",
    subcategory: "Suportes para dispositivos",
    collection: "Projetos para vender",
    tags: ["dragon", "suporte", "celular", "tablet"],
    technical: {
      typeProduct: "accessory",
      componentScope: "acessorios",
      partNumber: "MW-DRAGON-STAND",
      symptomTags: ["suporte de celular", "suporte de tablet", "decoracao funcional"],
    },
  }),
];

const geekCatalogSeeds: CatalogSeed[] = [
  {
    id: "geek-001",
    sku: "A1M-ACC-KNIGHT-MEDIEVAL-R1",
    name: "Cavaleiro Medieval Mini",
    imageSrc: "/products/geek/cavaleiro-medieval-mini/cavaleiro-medieval-mini.png",
    gallery: ["/products/geek/cavaleiro-medieval-mini/cavaleiro-medieval-mini-original.png"],
    description: "Miniatura de cavaleiro medieval em foto real de catalogo, com acabamento premium e alto apelo colecionavel.",
    pricePix: 89.9,
    category: "Accessories",
    subcategory: "Colecionaveis geek",
    collection: "Geek fotos reais",
    theme: "medieval",
    tags: ["cavaleiro", "miniatura", "colecionavel", "foto real"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-002",
    sku: "A1M-ACC-OWL-FOREST-R1",
    name: "Coruja Floresta Articulada",
    imageSrc: "/products/geek/coruja-floresta-articulada/coruja-floresta-articulada.png",
    description: "Coruja articulada em estilo colecionavel para decoracao de bancada e presentes criativos.",
    pricePix: 54.9,
    category: "Accessories",
    subcategory: "Criaturas e mascotes",
    collection: "Geek fotos reais",
    theme: "nature",
    tags: ["coruja", "articulado", "criatura", "colecionavel"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-003",
    sku: "A1M-ACC-DRAGON-EUROPE-R1",
    name: "Dragao Europeu Mini",
    imageSrc: "/products/geek/dragao-europeu-mini/dragao-europeu-mini.png",
    description: "Dragao europeu mini com acabamento escuro e linhas de camada visiveis para vitrine geek.",
    pricePix: 79.9,
    category: "Accessories",
    subcategory: "Criaturas e mascotes",
    collection: "Geek fotos reais",
    theme: "fantasy",
    tags: ["dragao", "mini", "fantasia", "decoracao geek"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-004",
    sku: "A1M-ACC-DRAGON-ORIENTAL-R1",
    name: "Dragao Oriental Articulado",
    imageSrc: "/products/geek/dragao-oriental-articulado/dragao-oriental-articulado.png",
    description: "Dragao oriental articulado com visual premium para colecionadores e setups personalizados.",
    pricePix: 99.9,
    category: "Accessories",
    subcategory: "Criaturas e mascotes",
    collection: "Geek fotos reais",
    theme: "fantasy",
    tags: ["dragao oriental", "articulado", "colecionavel", "premium"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-005",
    sku: "A1M-ACC-ELSA-CHIBI-R1",
    name: "Elsa Frozen Chibi",
    imageSrc: "/products/geek/elsa-frozen-chibi/elsa-frozen-chibi.png",
    gallery: ["/products/geek/elsa-frozen-chibi/elsa-frozen-chibi-original.png"],
    description: "Figura chibi inspirada em princesa gelada, com foto principal e variante original para anuncio.",
    pricePix: 74.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "chibi",
    tags: ["elsa", "chibi", "princesa", "colecionavel"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-006",
    sku: "A1M-ACC-ROCKET-MINI-R1",
    name: "Foguete Espacial Mini",
    imageSrc: "/products/geek/foguete-espacial-mini/foguete-espacial-mini.png",
    gallery: ["/products/geek/foguete-espacial-mini/foguete-espacial-mini-original.png"],
    description: "Mini foguete espacial para decoracao de mesa e colecoes sci-fi com acabamento limpo.",
    pricePix: 69.9,
    category: "Accessories",
    subcategory: "Decoracao geek",
    collection: "Geek fotos reais",
    theme: "sci-fi",
    tags: ["foguete", "espacial", "decoracao", "miniatura"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-007",
    sku: "A1M-ACC-GOKU-CHIBI-R1",
    name: "Goku Dragon Ball Chibi",
    imageSrc: "/products/geek/goku-dragon-ball-chibi/goku-dragon-ball-chibi.png",
    gallery: ["/products/geek/goku-dragon-ball-chibi/goku-dragon-ball-chibi-original.png"],
    description: "Personagem chibi inspirado em lutador anime, excelente para linha geek de pronta entrega.",
    pricePix: 84.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "anime",
    tags: ["goku", "dragon ball", "chibi", "anime"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-008",
    sku: "A1M-ACC-KIRBY-CHIBI-R1",
    name: "Kirby Nintendo Chibi",
    imageSrc: "/products/geek/kirby-nintendo-chibi/kirby-nintendo-chibi.png",
    gallery: ["/products/geek/kirby-nintendo-chibi/kirby-nintendo-chibi-original.png"],
    description: "Miniatura chibi inspirada em personagem classico Nintendo para kits de presente geek.",
    pricePix: 64.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "game",
    tags: ["kirby", "nintendo", "chibi", "colecionavel"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-009",
    sku: "A1M-ACC-LUFFY-CHIBI-R1",
    name: "Luffy One Piece Chibi",
    imageSrc: "/products/geek/luffy-one-piece-chibi/luffy-one-piece-chibi.png",
    gallery: ["/products/geek/luffy-one-piece-chibi/luffy-one-piece-chibi-original.png"],
    description: "Figura chibi inspirada em pirata anime, pensada para colecionadores e vendas por demanda.",
    pricePix: 89.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "anime",
    tags: ["luffy", "one piece", "chibi", "anime"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-010",
    sku: "A1M-ACC-MARIO-CHIBI-R1",
    name: "Mario Nintendo Chibi",
    imageSrc: "/products/geek/mario-nintendo-chibi/mario-nintendo-chibi.png",
    gallery: ["/products/geek/mario-nintendo-chibi/mario-nintendo-chibi-original.png"],
    description: "Mario em estilo chibi com visual colorido, pronto para vitrine gamer e presentes.",
    pricePix: 79.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "game",
    tags: ["mario", "nintendo", "chibi", "gamer"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-011",
    sku: "A1M-ACC-PIKACHU-CHIBI-R1",
    name: "Pikachu Pokemon Chibi",
    imageSrc: "/products/geek/pikachu-pokemon-chibi/pikachu-pokemon-chibi.png",
    gallery: ["/products/geek/pikachu-pokemon-chibi/pikachu-pokemon-chibi-original.png"],
    description: "Pikachu em estilo chibi com alta procura no nicho geek e excelente taxa de conversao visual.",
    pricePix: 84.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "game",
    tags: ["pikachu", "pokemon", "chibi", "colecionavel"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-012",
    sku: "A1M-ACC-OCTOPUS-ART-R1",
    name: "Polvo Oceano Articulado",
    imageSrc: "/products/geek/polvo-oceano-articulado/polvo-oceano-articulado.png",
    gallery: ["/products/geek/polvo-oceano-articulado/polvo-oceano-articulado-original.png"],
    description: "Polvo articulado em varias cores, muito bom para kits de mesa, criancas e presentes.",
    pricePix: 59.9,
    category: "Accessories",
    subcategory: "Criaturas e mascotes",
    collection: "Geek fotos reais",
    theme: "ocean",
    tags: ["polvo", "articulado", "oceano", "fidget"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-013",
    sku: "A1M-ACC-SASUKE-CHIBI-R1",
    name: "Sasuke Uchiha Chibi",
    imageSrc: "/products/geek/sasuke-uchiha-chibi/sasuke-uchiha-chibi.png",
    description: "Sasuke em estilo chibi com acabamento detalhado para linha anime premium sob encomenda.",
    pricePix: 92.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "anime",
    tags: ["sasuke", "naruto", "chibi", "anime"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-014",
    sku: "A1M-ACC-SONIC-CHIBI-R1",
    name: "Sonic Hedgehog Chibi",
    imageSrc: "/products/geek/sonic-hedgehog-chibi/sonic-hedgehog-chibi.png",
    gallery: ["/products/geek/sonic-hedgehog-chibi/sonic-hedgehog-chibi-original.png"],
    description: "Sonic chibi para colecao gamer, com opcao de foto complementar original no anuncio.",
    pricePix: 79.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "game",
    tags: ["sonic", "hedgehog", "chibi", "gamer"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-015",
    sku: "A1M-ACC-TOTORO-CHIBI-R1",
    name: "Totoro My Neighbor Chibi",
    imageSrc: "/products/geek/totoro-my-neighbor-chibi/totoro-my-neighbor-chibi.png",
    gallery: ["/products/geek/totoro-my-neighbor-chibi/totoro-my-neighbor-chibi-original.png"],
    description: "Totoro estilo chibi com visual fofo e alta atratividade para linha presenteavel geek.",
    pricePix: 76.9,
    category: "Accessories",
    subcategory: "Anime e game chibi",
    collection: "Geek fotos reais",
    theme: "anime",
    tags: ["totoro", "chibi", "anime", "colecionavel"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
  {
    id: "geek-016",
    sku: "A1M-ACC-SHARK-MINI-R1",
    name: "Tubarao Oceano Mini",
    imageSrc: "/products/geek/tubarao-oceano-mini/tubarao-oceano-mini.png",
    description: "Mini tubarao de oceano com acabamento suave para decoracao de bancada e kits criativos.",
    pricePix: 49.9,
    category: "Accessories",
    subcategory: "Criaturas e mascotes",
    collection: "Geek fotos reais",
    theme: "ocean",
    tags: ["tubarao", "oceano", "miniatura", "decoracao"],
    technical: { typeProduct: "accessory", componentScope: "acessorios" },
  },
];

const curatedCatalog: Product[] = [...baseCatalog, ...geekCatalogSeeds.map((seed) => createProduct(seed))];

export const catalog = curatedCatalog;
export const featuredCatalog = curatedCatalog.filter((item) => item.featured).slice(0, 12);
export const categories = Array.from(new Set(curatedCatalog.map((item) => item.category)));
export const collections = Array.from(new Set(curatedCatalog.map((item) => item.collection)));
export const technicalScopes = Array.from(new Set(curatedCatalog.map((item) => item.technical.componentScope)));
export const supportedCompatibilityModels: CompatibilityModel[] = ["A1 Mini", "A1"];

export function getProductUrl(product: Product) {
  return `/catalogo/${product.id}-${slugify(product.name)}`;
}

export function findProduct(id: string) {
  return curatedCatalog.find((item) => item.id === id);
}

export function findProductBySlug(slug: string) {
  return curatedCatalog.find((item) => getProductUrl(item).endsWith(slug));
}

export function getProductsByType(typeProduct: ProductType) {
  return curatedCatalog.filter((item) => item.technical.typeProduct === typeProduct);
}

export function searchCatalog(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return curatedCatalog;

  return curatedCatalog.filter((item) =>
    [
      item.name,
      item.category,
      item.subcategory,
      item.theme,
      item.description,
      item.collection,
      item.material,
      item.finish,
      item.sku,
      item.technical.partNumber || "",
      item.technical.typeProduct,
      item.technical.componentScope,
      ...(item.tags || []),
      ...(item.technical.symptomTags || []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}

export function calculateBaseCost(grams: number, hours: number, complexity = 1) {
  const material = grams * filamentCostPerGram;
  const machine = Math.max(2, hours * 2.75);
  const acabamento = Math.max(1.5, complexity * 2.2);
  return Number((material + machine + acabamento).toFixed(2));
}

export function calculateSalePrice(
  grams: number,
  hours: number,
  complexity = 1,
  paymentMethod: PaymentMethod = "pix",
  channel: SalesChannel = "site"
) {
  let price = calculateBaseCost(grams, hours, complexity) * 1.95;
  if (paymentMethod === "cartao") price *= 1.12;
  if (paymentMethod === "boleto") price *= 1.08;
  if (channel === "mercadolivre") price *= 1.15;
  if (channel === "shopee") price *= 1.12;
  return toPriceEnding(price);
}

export const defaultPricingExamples = [
  { title: "Chaveiro multicor", grams: 18, hours: 0.9, complexity: 1.12 },
  { title: "Case para isqueiro", grams: 26, hours: 1.1, complexity: 1.16 },
  { title: "Display colecionavel", grams: 96, hours: 4.9, complexity: 1.47 },
  { title: "Kit personalizado", grams: 162, hours: 7.4, complexity: 1.72 },
].map((item) => ({
  ...item,
  pricePix: calculateSalePrice(item.grams, item.hours, item.complexity, "pix", "site"),
  priceCard: calculateSalePrice(item.grams, item.hours, item.complexity, "cartao", "site"),
}));

export const deliverySummary = [...deliveryZones];
