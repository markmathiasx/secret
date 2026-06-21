export type PriceOpsProductInput = {
  id: string;
  sku: string;
  name: string;
  costBrl: number;
  currentPixBrl: number;
  currentCardBrl: number;
};

export type PriceOpsProposal = PriceOpsProductInput & {
  targetMarginPercent: number;
  proposedPixBrl: number;
  proposedCardBrl: number;
  marginPercent: number;
  belowCost: boolean;
  canApply: boolean;
  reason: string;
};

export type PriceOpsRun = {
  generatedAt: string;
  mode: "dry-run" | "apply";
  autoApply: boolean;
  proposals: PriceOpsProposal[];
  blocked: PriceOpsProposal[];
  ok: boolean;
};
