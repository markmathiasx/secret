export const defaultLocale = "pt-BR";
export const supportedLocales = ["pt-BR", "en-US", "es-ES"] as const;

export function normalizeLocale(locale: string | undefined) {
  return supportedLocales.includes(locale as (typeof supportedLocales)[number]) ? locale : defaultLocale;
}
