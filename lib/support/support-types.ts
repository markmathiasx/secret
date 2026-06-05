export type SupportIntent =
  | "produto_categoria"
  | "produto_preco"
  | "produto_barato"
  | "produto_caro"
  | "presente"
  | "presente_barato"
  | "chaveiro"
  | "geek"
  | "decoracao"
  | "utilidade"
  | "setup"
  | "organizador"
  | "personalizado"
  | "lote_brinde"
  | "material"
  | "prazo"
  | "pagamento"
  | "pix_cartao"
  | "envio"
  | "troca_devolucao"
  | "rastreio"
  | "status_pedido"
  | "humano"
  | "saudacao"
  | "fallback";

export type SupportProduct = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  url: string;
  pricePix: number;
  priceCard: number;
  material: string;
  finish: string;
  productionWindow: string;
  status: string;
  stock: number;
  customizable: boolean;
  tags: string[];
  description: string;
  image: string;
  searchText: string;
};

export type SupportProductFilters = {
  intent?: SupportIntent;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  customizable?: boolean;
  limit?: number;
  sort?: "relevance" | "price_asc" | "price_desc";
};

export type SupportPriceRange = {
  min: number;
  max: number;
  count: number;
};

export type SupportCategorySummary = {
  category: string;
  count: number;
  priceRange: SupportPriceRange;
  materials: string[];
  collections: string[];
};

export type SupportReply = {
  ok: true;
  intent: SupportIntent;
  reply: string;
  products: SupportProduct[];
  suggestions: string[];
  handoff: boolean;
  whatsappUrl?: string;
  priceRange?: SupportPriceRange;
};

export type SupportSessionContext = {
  sessionId?: string;
  sourcePage?: string;
  lastProductId?: string;
};
