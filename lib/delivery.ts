const num = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const deliveryKm = {
  baseFee: num(process.env.DELIVERY_BASE_FEE, 8),
  feePerKm: num(process.env.DELIVERY_FEE_PER_KM, 0.6),
  capFee: num(process.env.DELIVERY_FEE_CAP, 35),
  expressMultiplier: num(process.env.DELIVERY_EXPRESS_MULTIPLIER, 2),
};

export function estimateDeliveryFeeKm(distanceKm: number) {
  const km = Math.max(0, Number(distanceKm || 0));
  const fee = deliveryKm.baseFee + km * deliveryKm.feePerKm;
  return Math.min(deliveryKm.capFee, Number(fee.toFixed(2)));
}

export function estimateExpressDeliveryFee(distanceKm: number) {
  return Number((estimateDeliveryFeeKm(distanceKm) * deliveryKm.expressMultiplier).toFixed(2));
}
