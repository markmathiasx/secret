import { calculateCardPrice, roundToCents } from "@/lib/payment-pricing";

export type CompetitivePriceInput = {
  competitorPrice: number;
  totalCost: number;
  discountBrl?: number;
  channelFeePercent?: number;
  minimumNetMarginPercent?: number;
};

export type CompetitivePriceResult = {
  targetBelowCompetitor: number;
  profitabilityFloor: number;
  suggestedPix: number;
  suggestedCard: number;
  netProfit: number;
  netMarginPercent: number;
  undercutsCompetitor: boolean;
  protectedByMargin: boolean;
};

function safeMoney(value: number) {
  return Number.isFinite(value) ? Math.max(0, roundToCents(value)) : 0;
}

export function calculateCompetitivePrice(input: CompetitivePriceInput): CompetitivePriceResult {
  const competitorPrice = safeMoney(input.competitorPrice);
  const totalCost = safeMoney(input.totalCost);
  const discount = safeMoney(input.discountBrl ?? 2);
  const feeRate = Math.min(0.6, Math.max(0, (input.channelFeePercent ?? 0) / 100));
  const marginRate = Math.min(0.8, Math.max(0.2, (input.minimumNetMarginPercent ?? 30) / 100));

  if (competitorPrice <= 0) throw new Error("Informe um preço concorrente válido.");
  if (totalCost <= 0) throw new Error("Informe o custo total real da peça.");
  if (feeRate + marginRate >= 0.95) throw new Error("Taxa e margem deixam a operação inviável.");

  const targetBelowCompetitor = safeMoney(Math.max(0.01, competitorPrice - discount));
  const profitabilityFloor = safeMoney(totalCost / (1 - feeRate - marginRate));
  const suggestedPix = safeMoney(Math.max(targetBelowCompetitor, profitabilityFloor));
  const fee = suggestedPix * feeRate;
  const netProfit = safeMoney(suggestedPix - fee - totalCost);
  const netMarginPercent = roundToCents((netProfit / suggestedPix) * 100);

  return {
    targetBelowCompetitor,
    profitabilityFloor,
    suggestedPix,
    suggestedCard: calculateCardPrice(suggestedPix),
    netProfit,
    netMarginPercent,
    undercutsCompetitor: suggestedPix < competitorPrice,
    protectedByMargin: suggestedPix > targetBelowCompetitor,
  };
}

