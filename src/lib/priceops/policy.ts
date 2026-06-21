import { calculateCardPrice, normalizeMoney, roundToCents } from "@/lib/payment-pricing";
import type { PriceOpsProductInput, PriceOpsProposal, PriceOpsRun } from "./types";

const DEFAULT_TARGET_MARGIN_PERCENT = 30;
const MINIMUM_ALLOWED_MARGIN_PERCENT = 20;

export function calculatePixFromCost(costBrl: number, targetMarginPercent = DEFAULT_TARGET_MARGIN_PERCENT) {
  const cost = normalizeMoney(costBrl);
  return roundToCents(cost * (1 + targetMarginPercent / 100));
}

export function evaluatePriceProposal(
  product: PriceOpsProductInput,
  targetMarginPercent = DEFAULT_TARGET_MARGIN_PERCENT
): PriceOpsProposal {
  const cost = normalizeMoney(product.costBrl);
  const proposedPixBrl = calculatePixFromCost(cost, targetMarginPercent);
  const marginPercent = proposedPixBrl > 0 ? roundToCents(((proposedPixBrl - cost) / proposedPixBrl) * 100) : 0;
  const belowCost = proposedPixBrl < cost;
  const canApply = !belowCost && marginPercent >= MINIMUM_ALLOWED_MARGIN_PERCENT;

  return {
    ...product,
    costBrl: cost,
    currentPixBrl: normalizeMoney(product.currentPixBrl),
    currentCardBrl: normalizeMoney(product.currentCardBrl),
    targetMarginPercent,
    proposedPixBrl,
    proposedCardBrl: calculateCardPrice(proposedPixBrl),
    marginPercent,
    belowCost,
    canApply,
    reason: canApply
      ? "dry-run aprovado; exige backup e rollback antes de aplicar"
      : "bloqueado por custo/margem minima",
  };
}

export function buildPriceOpsDryRun(
  products: PriceOpsProductInput[],
  targetMarginPercent = DEFAULT_TARGET_MARGIN_PERCENT
): PriceOpsRun {
  const proposals = products.map((product) => evaluatePriceProposal(product, targetMarginPercent));
  const blocked = proposals.filter((proposal) => !proposal.canApply);
  return {
    generatedAt: new Date().toISOString(),
    mode: "dry-run",
    autoApply: false,
    proposals,
    blocked,
    ok: blocked.length === 0,
  };
}
