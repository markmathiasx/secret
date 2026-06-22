export type NeoGlassPreviewProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  href: string;
  image: string;
  imageAlt: string;
  description: string;
  pricePixLabel: string;
  priceCardLabel: string;
  pricePix: number;
  priceCard: number;
  material: string;
  productionWindow: string;
  stock: number;
  customizable: boolean;
  badges: string[];
};

export type NeoGlassPreviewMetrics = {
  activeProducts: number;
  smartStoreProducts: number;
  metaFeedValid: number;
  metaFeedSkipped: number;
  googleFeedItems: number;
  genericDescriptions: number;
  scoreLabel: string;
  validatedMedia: number;
  readyToShip: number;
};

export type NeoGlassPreviewDropRail = {
  id: string;
  title: string;
  subtitle: string;
  products: NeoGlassPreviewProduct[];
};

export type NeoGlassPreviewData = {
  metrics: NeoGlassPreviewMetrics;
  categories: string[];
  featuredProducts: NeoGlassPreviewProduct[];
  dropRails: NeoGlassPreviewDropRail[];
  heroProduct: NeoGlassPreviewProduct;
  cinematicProduct: NeoGlassPreviewProduct;
  whatsappUrl: string;
  catalogUrl: string;
};
