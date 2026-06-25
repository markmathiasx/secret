export const defaultCurrency = "BRL";

export function formatPlatformCurrency(value: number, locale = "pt-BR", currency = defaultCurrency) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}
