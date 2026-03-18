"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

interface Translations {
  'pt-BR': TranslationDictionary;
  'en-US': TranslationDictionary;
  'es-ES': TranslationDictionary;
}

const translations: Translations = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Salvar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      open: 'Abrir',
      yes: 'Sim',
      no: 'Não',
    },
    navigation: {
      home: 'Início',
      products: 'Produtos',
      services: 'Serviços',
      about: 'Sobre',
      contact: 'Contato',
      cart: 'Carrinho',
      checkout: 'Finalizar Compra',
    },
    products: {
      title: 'Produtos 3D',
      description: 'Explore nossa coleção de produtos de impressão 3D',
      addToCart: 'Adicionar ao Carrinho',
      outOfStock: 'Fora de Estoque',
      inStock: 'Em Estoque',
      price: 'Preço',
      category: 'Categoria',
      material: 'Material',
      dimensions: 'Dimensões',
    },
    cart: {
      empty: 'Seu carrinho está vazio',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Frete',
      tax: 'Imposto',
      checkout: 'Finalizar Compra',
      continueShopping: 'Continuar Comprando',
    },
    forms: {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      address: 'Endereço',
      city: 'Cidade',
      state: 'Estado',
      zipCode: 'CEP',
      country: 'País',
      required: 'Campo obrigatório',
      invalidEmail: 'E-mail inválido',
      submit: 'Enviar',
    },
    errors: {
      network: 'Erro de conexão',
      notFound: 'Página não encontrada',
      server: 'Erro do servidor',
      validation: 'Erro de validação',
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
    },
    navigation: {
      home: 'Home',
      products: 'Products',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      checkout: 'Checkout',
    },
    products: {
      title: '3D Products',
      description: 'Explore our collection of 3D printed products',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      category: 'Category',
      material: 'Material',
      dimensions: 'Dimensions',
    },
    cart: {
      empty: 'Your cart is empty',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
    },
    forms: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country',
      required: 'Required field',
      invalidEmail: 'Invalid email',
      submit: 'Submit',
    },
    errors: {
      network: 'Network error',
      notFound: 'Page not found',
      server: 'Server error',
      validation: 'Validation error',
    },
  },
  'es-ES': {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      open: 'Abrir',
      yes: 'Sí',
      no: 'No',
    },
    navigation: {
      home: 'Inicio',
      products: 'Productos',
      services: 'Servicios',
      about: 'Acerca de',
      contact: 'Contacto',
      cart: 'Carrito',
      checkout: 'Finalizar Compra',
    },
    products: {
      title: 'Productos 3D',
      description: 'Explora nuestra colección de productos de impresión 3D',
      addToCart: 'Agregar al Carrito',
      outOfStock: 'Agotado',
      inStock: 'En Stock',
      price: 'Precio',
      category: 'Categoría',
      material: 'Material',
      dimensions: 'Dimensiones',
    },
    cart: {
      empty: 'Tu carrito está vacío',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      tax: 'Impuesto',
      checkout: 'Finalizar Compra',
      continueShopping: 'Continuar Comprando',
    },
    forms: {
      name: 'Nombre',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      message: 'Mensaje',
      address: 'Dirección',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: 'Código Postal',
      country: 'País',
      required: 'Campo obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      submit: 'Enviar',
    },
    errors: {
      network: 'Error de conexión',
      notFound: 'Página no encontrada',
      server: 'Error del servidor',
      validation: 'Error de validación',
    },
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
  storageKey?: string;
}

export function I18nProvider({
  children,
  defaultLanguage = 'pt-BR',
  storageKey = 'mdh-language',
}: I18nProviderProps) {
  const languages = useMemo(() => [
    { code: 'pt-BR' as Language, name: 'Português', flag: '🇧🇷' },
    { code: 'en-US' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es-ES' as Language, name: 'Español', flag: '🇪🇸' },
  ], []);

  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && languages.some(lang => lang.code === stored)) {
      setLanguageState(stored as Language);
    }
  }, [storageKey, languages]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, language);
    document.documentElement.lang = language;
  }, [language, storageKey]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const getNestedValue = (obj: any, path: string[]): string => {
    return path.reduce((current, key) => current?.[key], obj) || path.join('.');
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let translation = getNestedValue(translations[language], keys);

    // Fallback to Portuguese if translation not found
    if (translation === key && language !== 'pt-BR') {
      translation = getNestedValue(translations['pt-BR'], keys);
    }

    // Replace parameters
    if (params && typeof translation === 'string') {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }

    return typeof translation === 'string' ? translation : key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

// Language selector component
interface LanguageSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showName?: boolean;
}

export function LanguageSelector({
  className = '',
  size = 'md',
  showFlag = true,
  showName = true,
}: LanguageSelectorProps) {
  const { language, setLanguage, languages } = useI18n();

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className={`
        border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-cyan-glow focus:border-transparent
        dark:border-gray-600 dark:bg-gray-800 dark:text-white
        ${sizeClasses[size]} ${className}
      `}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {showFlag && lang.flag} {showName && lang.name}
        </option>
      ))}
    </select>
  );
}

// Translated text component
interface TProps {
  id: string;
  params?: Record<string, string | number>;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function T({ id, params, className = '', as: Component = 'span' }: TProps) {
  const { t } = useI18n();
  const translated = t(id, params);

  return (
    <Component className={className} title={id}>
      {translated}
    </Component>
  );
}

// Number formatting hook
export function useNumberFormatter() {
  const { language } = useI18n();

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(language, options).format(num);
  };

  const formatCurrency = (amount: number, currency = 'BRL') => {
    return formatNumber(amount, {
      style: 'currency',
      currency,
    });
  };

  const formatPercent = (value: number) => {
    return formatNumber(value, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  return { formatNumber, formatCurrency, formatPercent };
}

// Date formatting hook
export function useDateFormatter() {
  const { language } = useI18n();

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(language, options).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = [
      { label: 'segundo', seconds: 1 },
      { label: 'minuto', seconds: 60 },
      { label: 'hora', seconds: 3600 },
      { label: 'dia', seconds: 86400 },
      { label: 'semana', seconds: 604800 },
      { label: 'mês', seconds: 2592000 },
      { label: 'ano', seconds: 31536000 },
    ];

    for (let i = intervals.length - 1; i >= 0; i--) {
      const interval = intervals[i];
      const count = Math.floor(diffInSeconds / interval.seconds);

      if (count >= 1) {
        const suffix = count === 1 ? '' : 's';
        return `${count} ${interval.label}${suffix} atrás`;
      }
    }

    return 'agora mesmo';
  };

  return { formatDate, formatRelativeTime };
}

// Pluralization helper
export function usePlural() {
  const { language } = useI18n();

  const pluralize = (count: number, singular: string, plural: string) => {
    if (language === 'pt-BR') {
      return count === 1 ? singular : plural;
    }
    // For English and Spanish, use simple pluralization
    return count === 1 ? singular : plural;
  };

  return { pluralize };
}