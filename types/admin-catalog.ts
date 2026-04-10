export type ProductionStage = "recebido" | "imprimindo" | "pronto";

export type AdminProductOverride = {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  collection?: string;
  material?: string;
  finish?: string;
  status?: "Pronta entrega" | "Sob encomenda";
  stock?: number;
  readyToShip?: boolean;
  customizable?: boolean;
  featured?: boolean;
  costBase?: number;
  pricePix?: number;
  productionStage?: ProductionStage;
  updatedAt?: string;
};

export type RealImageStatusRecord = {
  status: "real";
  sourceType: string;
  sourceCount: number;
  updatedAt: string;
  gallery: string[];
  notes?: string;
};
