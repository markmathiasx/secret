export function classifyDiff(diff: string) {
  return {
    touchesCatalog: /data\/catalog|data\/produtos|lib\/catalog/i.test(diff),
    touchesPrices: /price|preco|pricePix|priceCard/i.test(diff),
    touchesSecrets: /\.env|SECRET|TOKEN|PASSWORD/i.test(diff),
  };
}
