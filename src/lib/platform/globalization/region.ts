export const defaultRegion = "BR-RJ";

export function getRegionConfig(region = defaultRegion) {
  return {
    region,
    timezone: "America/Sao_Paulo",
    shippingEnabled: region.startsWith("BR"),
  };
}
