import { getCachedData, cacheTtl } from './cache';

// Supported locales
export const locales = ['pt-BR', 'en-US', 'es-ES'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

// Translation dictionary type
export type Translations = Record<string, string | Record<string, string>>;

// Messages for each locale
const messages: Record<Locale, Translations> = {
  'pt-BR': {
    // Common
    'common.welcome': 'Bem-vindo',
    'common.search': 'Buscar',
    'common.addToCart': 'Adicionar ao Carrinho',
    'common.buyNow': 'Comprar Agora',
    'common.checkout': 'Finalizar Compra',
    'common.continue': 'Continuar',
    'common.back': 'Voltar',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Carregando...',
    'common.error': 'Ocorreu um erro',
    'common.success': 'Sucesso!',

    // Navigation
    'nav.home': 'Início',
    'nav.catalog': 'Catálogo',
    'nav.about': 'Sobre',
    'nav.contact': 'Contato',
    'nav.cart': 'Carrinho',
    'nav.account': 'Minha Conta',

    // Product
    'product.price': 'Preço',
    'product.material': 'Material',
    'product.dimensions': 'Dimensões',
    'product.weight': 'Peso',
    'product.inStock': 'Em Estoque',
    'product.outOfStock': 'Fora de Estoque',
    'product.shipping': 'Envio',
    'product.reviews': 'Avaliações',
    'product.related': 'Produtos Relacionados',
    'product.description': 'Descrição',
    'product.specifications': 'Especificações',

    // Checkout
    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Endereço de Entrega',
    'checkout.payment': 'Forma de Pagamento',
    'checkout.review': 'Revisar Pedido',
    'checkout.total': 'Total',
    'checkout.shippingCost': 'Frete',
    'checkout.discount': 'Desconto',
    'checkout.pix': 'PIX',
    'checkout.creditCard': 'Cartão de Crédito',
    'checkout.boleto': 'Boleto',

    // Footer
    'footer.about': 'Sobre a MDH 3D',
    'footer.help': 'Central de Ajuda',
    'footer.terms': 'Termos de Uso',
    'footer.privacy': 'Política de Privacidade',
    'footer.followUs': 'Siga-nos',

    // Meta
    'meta.title': 'MDH 3D | Impressão 3D Profissional no Rio de Janeiro',
    'meta.description': 'Produção local de peças 3D premium com mídia validada antes da compra. Catálogo com 500+ produtos, entrega em 24-48h no Rio.',
  },
  'en-US': {
    'common.welcome': 'Welcome',
    'common.search': 'Search',
    'common.addToCart': 'Add to Cart',
    'common.buyNow': 'Buy Now',
    'common.checkout': 'Checkout',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',

    'nav.home': 'Home',
    'nav.catalog': 'Catalog',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.account': 'My Account',

    'product.price': 'Price',
    'product.material': 'Material',
    'product.dimensions': 'Dimensions',
    'product.weight': 'Weight',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.shipping': 'Shipping',
    'product.reviews': 'Reviews',
    'product.related': 'Related Products',
    'product.description': 'Description',
    'product.specifications': 'Specifications',

    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Address',
    'checkout.payment': 'Payment Method',
    'checkout.review': 'Review Order',
    'checkout.total': 'Total',
    'checkout.shippingCost': 'Shipping',
    'checkout.discount': 'Discount',
    'checkout.pix': 'PIX',
    'checkout.creditCard': 'Credit Card',
    'checkout.boleto': 'Boleto',

    'footer.about': 'About MDH 3D',
    'footer.help': 'Help Center',
    'footer.terms': 'Terms of Use',
    'footer.privacy': 'Privacy Policy',
    'footer.followUs': 'Follow Us',

    'meta.title': 'MDH 3D | Professional 3D Printing in Rio de Janeiro',
    'meta.description': 'Local production of premium 3D pieces with real photo before purchase. Catalog with 500+ products, 24-48h delivery in Rio.',
  },
  'es-ES': {
    'common.welcome': 'Bienvenido',
    'common.search': 'Buscar',
    'common.addToCart': 'Añadir al Carrito',
    'common.buyNow': 'Comprar Ahora',
    'common.checkout': 'Finalizar Compra',
    'common.continue': 'Continuar',
    'common.back': 'Volver',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando...',
    'common.error': 'Ocurrió un error',
    'common.success': '¡Éxito!',

    'nav.home': 'Inicio',
    'nav.catalog': 'Catálogo',
    'nav.about': 'Nosotros',
    'nav.contact': 'Contacto',
    'nav.cart': 'Carrito',
    'nav.account': 'Mi Cuenta',

    'product.price': 'Precio',
    'product.material': 'Material',
    'product.dimensions': 'Dimensiones',
    'product.weight': 'Peso',
    'product.inStock': 'En Stock',
    'product.outOfStock': 'Sin Stock',
    'product.shipping': 'Envío',
    'product.reviews': 'Reseñas',
    'product.related': 'Productos Relacionados',
    'product.description': 'Descripción',
    'product.specifications': 'Especificaciones',

    'checkout.title': 'Finalizar Compra',
    'checkout.shipping': 'Dirección de Envío',
    'checkout.payment': 'Método de Pago',
    'checkout.review': 'Revisar Pedido',
    'checkout.total': 'Total',
    'checkout.shippingCost': 'Envío',
    'checkout.discount': 'Descuento',
    'checkout.pix': 'PIX',
    'checkout.creditCard': 'Tarjeta de Crédito',
    'checkout.boleto': 'Boleto',

    'footer.about': 'Sobre MDH 3D',
    'footer.help': 'Centro de Ayuda',
    'footer.terms': 'Términos de Uso',
    'footer.privacy': 'Política de Privacidad',
    'footer.followUs': 'Síguenos',

    'meta.title': 'MDH 3D | Impresión 3D Profesional en Río de Janeiro',
    'meta.description': 'Producción local de piezas 3D premium con mídia validada antes de comprar. Catálogo con 500+ productos, entrega en 24-48h en Río.',
  },
};

// Get locale from request
export function getLocaleFromRequest(request: Request): Locale {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return defaultLocale;

  // Parse Accept-Language header
  const preferred = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, quality = '1'] = lang.split(';q=');
      return { code: code.trim().split('-')[0], quality: parseFloat(quality) };
    })
    .sort((a, b) => b.quality - a.quality);

  // Map to our locales
  const localeMap: Record<string, Locale> = {
    'pt': 'pt-BR',
    'en': 'en-US',
    'es': 'es-ES',
  };

  for (const { code } of preferred) {
    const mapped = localeMap[code];
    if (mapped && locales.includes(mapped)) {
      return mapped;
    }
  }

  return defaultLocale;
}

// Translation function
export function t(key: string, locale: Locale = defaultLocale): string {
  const message = messages[locale][key];
  if (typeof message === 'string') {
    return message;
  }
  return key; // Fallback to key if translation not found
}

// Get translations for a namespace
export function getTranslations(namespace: string, locale: Locale): Record<string, string> {
  const result: Record<string, string> = {};
  const prefix = `${namespace}.`;

  for (const [key, value] of Object.entries(messages[locale])) {
    if (key.startsWith(prefix) && typeof value === 'string') {
      result[key.slice(prefix.length)] = value;
    }
  }

  return result;
}

// Format date according to locale
export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format currency according to locale
export function formatCurrency(value: number, locale: Locale): string {
  const currencies: Record<Locale, string> = {
    'pt-BR': 'BRL',
    'en-US': 'USD',
    'es-ES': 'EUR',
  };

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencies[locale],
  }).format(value);
}

// SEO helpers
export function generateHreflang(path: string): Array<{ locale: Locale; url: string }> {
  return locales.map((locale) => ({
    locale,
    url: `https://mdh3d.com.br${locale === defaultLocale ? '' : `/${locale}`}${path}`,
  }));
}

export function getAlternateUrls(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  locales.forEach((locale) => {
    const url = `https://mdh3d.com.br${locale === defaultLocale ? '' : `/${locale}`}${path}`;
    alternates[locale] = url;
  });

  // Add x-default
  alternates['x-default'] = `https://mdh3d.com.br${path}`;

  return alternates;
}

// Cookie management
export function getLocaleFromCookies(cookies: string): Locale {
  const match = cookies.match(/locale=([^;]+)/);
  const locale = match?.[1] as Locale;
  return locales.includes(locale) ? locale : defaultLocale;
}

export function setLocaleCookie(locale: Locale): string {
  return `locale=${locale}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Strict`;
}

// Localized paths
export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return `/${locale}${path}`;
}

export function delocalizePath(path: string): { path: string; locale: Locale } {
  for (const locale of locales) {
    if (locale !== defaultLocale && path.startsWith(`/${locale}/`)) {
      return { path: path.slice(locale.length + 1), locale };
    }
  }
  return { path, locale: defaultLocale };
}

// Sitemap generation for i18n
export function generateSitemapUrls(basePath: string): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: Record<string, string>;
}> {
  const urls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    alternates?: Record<string, string>;
  }> = [];

  locales.forEach((locale) => {
    const path = localizePath(basePath, locale);
    urls.push({
      url: `https://mdh3d.com.br${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: getAlternateUrls(basePath),
    });
  });

  return urls;
}

// RTL support check
export function isRTL(locale: Locale): boolean {
  return ['ar', 'he', 'fa'].includes(locale.split('-')[0]);
}

// Locale display names
export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'es-ES': 'Español',
};

// Locale flags/icons
export const localeFlags: Record<Locale, string> = {
  'pt-BR': '🇧🇷',
  'en-US': '🇺🇸',
  'es-ES': '🇪🇸',
};
