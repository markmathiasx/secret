import { supportedLocales } from "@/src/lib/platform/globalization/locale";

export function buildHreflangPlaceholders(pathname: string) {
  return supportedLocales.map((locale) => ({
    locale,
    href: `/${locale.toLowerCase()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
  }));
}
