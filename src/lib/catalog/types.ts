export type ProductMasterSource = "public-catalog" | "smart-store";

export type ProductMasterDimensions = {
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  label?: string;
};

export type ProductMasterRecord = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  tags: string[];
  pricePix: number;
  priceCard: number;
  stock: number;
  status: "Pronta entrega" | "Sob encomenda" | "Indisponivel";
  productionWindow: string;
  dimensions: ProductMasterDimensions;
  weightKg?: number;
  images: string[];
  primaryImage?: string;
  seoTitle: string;
  seoDescription: string;
  source: ProductMasterSource;
  productUrl: string;
  nuvemshopUrl?: string;
  whatsappEligible: boolean;
};

export type ProductMasterDiagnostics = {
  generatedAt: string;
  total: number;
  bySource: Record<ProductMasterSource, number>;
  duplicateSkus: string[];
  duplicateProductUrls: string[];
  unsafeLinks: Array<{ id: string; field: string; value: string }>;
  missingRequired: Array<{ id: string; fields: string[] }>;
  ok: boolean;
};
