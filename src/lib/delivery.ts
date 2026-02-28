import { deliveryKm } from "@/lib/constants";

export function estimateDeliveryFeeKm(distanceKm: number) {
  const km = Math.max(0, Number(distanceKm || 0));
  const fee = deliveryKm.baseFee + km * deliveryKm.feePerKm;
  return Math.min(deliveryKm.capFee, Number(fee.toFixed(2)));
}

export function estimateExpressDeliveryFee(distanceKm: number) {
  return Number((estimateDeliveryFeeKm(distanceKm) * deliveryKm.expressMultiplier).toFixed(2));
}
