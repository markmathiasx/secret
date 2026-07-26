#!/usr/bin/env node
const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith("--"))
    .map((arg) => {
      const [key, raw = "true"] = arg.slice(2).split("=");
      return [key, raw];
    })
);

function numberArg(name, fallback) {
  const raw = args[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const value = Number(String(raw).replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function money(value) {
  return Number(value.toFixed(2));
}

function commercialNinety(value) {
  const safe = Math.max(0.01, value);
  const whole = Math.floor(safe);
  const candidate = whole + 0.9;
  return money(candidate + 0.000001 >= safe ? candidate : whole + 1.9);
}

const quantity = Math.max(1, Math.floor(numberArg("quantity", 1)));
const grams = numberArg("grams", 15);
const hours = numberArg("hours", 0.6);
const postProcessMinutes = numberArg("minutes", 12);
const personalized = args.personalized === "true" || args.personalized === true;
const includeIndividualPackaging = args["no-individual-packaging"] !== "true";

const costs = {
  spoolPricePerKg: numberArg("spool", 100),
  machineHourlyRate: numberArg("machine-rate", 4.5),
  laborHourlyRate: numberArg("labor-rate", 15),
  splitRingPerUnit: numberArg("split-ring", 0.22),
  chainPerUnit: numberArg("chain", 0.18),
  individualPackagingPerUnit: includeIndividualPackaging
    ? numberArg("individual-packaging", 0.25)
    : 0,
  outerShippingSuppliesPerOrder: numberArg("shipping-supplies", 0.7),
  designSetupPerOrder: numberArg("setup", personalized ? 5 : 0),
  failureReservePercent: numberArg("failure", 8),
  overheadPercent: numberArg("overhead", 8),
  targetGrossMarginPercent: numberArg("margin", 30),
};

const perUnit = {
  filament: grams * (costs.spoolPricePerKg / 1000),
  machine: hours * costs.machineHourlyRate,
  labor: (postProcessMinutes / 60) * costs.laborHourlyRate,
  splitRing: costs.splitRingPerUnit,
  chain: costs.chainPerUnit,
  individualPackaging: costs.individualPackagingPerUnit,
  outerShippingSupplies: costs.outerShippingSuppliesPerOrder / quantity,
  designSetup: costs.designSetupPerOrder / quantity,
};

const directSubtotal = Object.values(perUnit).reduce((sum, value) => sum + value, 0);
const failureReserve = directSubtotal * (costs.failureReservePercent / 100);
const overhead = (directSubtotal + failureReserve) * (costs.overheadPercent / 100);
const totalCostPerUnit = directSubtotal + failureReserve + overhead;
const safeMargin = Math.min(95, costs.targetGrossMarginPercent) / 100;
const minimumPricePerUnit = totalCostPerUnit / (1 - safeMargin);
const recommendedPricePerUnit = commercialNinety(minimumPricePerUnit);
const minimumOrderPrice = minimumPricePerUnit * quantity;
const recommendedOrderPrice = recommendedPricePerUnit * quantity;

const result = {
  assumptions: {
    quantity,
    gramsPerUnit: grams,
    printingHoursPerUnit: hours,
    postProcessMinutesPerUnit: postProcessMinutes,
    personalized,
    freightChargedByCarrierIncluded: false,
  },
  costs,
  perUnitBreakdown: Object.fromEntries(
    Object.entries(perUnit).map(([key, value]) => [key, money(value)])
  ),
  metalHardwarePerUnit: money(costs.splitRingPerUnit + costs.chainPerUnit),
  failureReservePerUnit: money(failureReserve),
  overheadPerUnit: money(overhead),
  totalCostPerUnit: money(totalCostPerUnit),
  minimumPricePerUnitForTargetMargin: money(minimumPricePerUnit),
  recommendedCommercialPricePerUnit: recommendedPricePerUnit,
  minimumOrderPrice: money(minimumOrderPrice),
  recommendedCommercialOrderPrice: money(recommendedOrderPrice),
};

if (args.json === "true") {
  console.log(JSON.stringify(result));
  process.exit(0);
}

console.log(JSON.stringify(result, null, 2));
console.log("");
console.log(
  `Preço comercial recomendado: R$ ${result.recommendedCommercialPricePerUnit
    .toFixed(2)
    .replace(".", ",")} por unidade; pedido R$ ${result.recommendedCommercialOrderPrice
    .toFixed(2)
    .replace(".", ",")}.`
);
console.log("Inclui argola, corrente, montagem, embalagem individual e insumos de postagem.");
console.log("Frete real da transportadora é calculado separadamente.");
