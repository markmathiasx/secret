"use client";

import { useEffect } from 'react';

type AnalyticsProduct = {
  id: string;
  sku?: string;
  name: string;
  category?: string;
  collection?: string;
  pricePix?: number;
  priceCard?: number;
};

type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_category2?: string;
  item_variant?: string;
  item_list_name?: string;
  index?: number;
  price?: number;
  quantity?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function sanitizeProperties(properties?: Record<string, unknown>) {
  if (!properties) return undefined;

  const blocked = /email|phone|telefone|whatsapp|password|senha|token|secret|session|cpf|cnpj|address|endereco/i;
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (blocked.test(key)) return false;
      if (typeof value === "string" && value.length > 300) return false;
      return true;
    })
  );
}

function toGa4Item(product: AnalyticsProduct, quantity = 1, index?: number, itemListName?: string): EcommerceItem {
  return {
    item_id: product.sku || product.id,
    item_name: product.name,
    item_brand: "MDH 3D",
    item_category: product.category,
    item_category2: product.collection,
    item_list_name: itemListName,
    index,
    price: product.pricePix,
    quantity,
  };
}

export const trackEvent = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined') {
    const safeProperties = sanitizeProperties(properties);

    if (window.gtag) {
      window.gtag('event', event, safeProperties);
    }

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...safeProperties });
    }

    if (window.fbq && event === "whatsapp_click") {
      window.fbq('track', 'Contact', safeProperties);
    }
  }
};

export const trackViewItemList = (products: AnalyticsProduct[], itemListName = "Catalogo") => {
  trackEvent('view_item_list', {
    item_list_name: itemListName,
    items: products.slice(0, 24).map((product, index) => toGa4Item(product, 1, index, itemListName)),
  });
};

export const trackSelectItem = (product: AnalyticsProduct, itemListName = "Catalogo", index?: number) => {
  trackEvent('select_item', {
    item_list_name: itemListName,
    items: [toGa4Item(product, 1, index, itemListName)],
  });
};

export const trackProductView = (product: AnalyticsProduct) => {
  trackEvent('view_item', {
    currency: 'BRL',
    value: product.pricePix || 0,
    items: [toGa4Item(product)],
  });
};

export const trackAddToCart = (product: AnalyticsProduct, quantity = 1) => {
  trackEvent('add_to_cart', {
    currency: 'BRL',
    value: (product.pricePix || 0) * quantity,
    items: [toGa4Item(product, quantity)],
  });
};

export const trackBeginCheckout = (product: AnalyticsProduct, quantity = 1, value?: number) => {
  trackEvent('begin_checkout', {
    currency: 'BRL',
    value: value ?? (product.pricePix || 0) * quantity,
    items: [toGa4Item(product, quantity)],
  });
};

export const trackAddPaymentInfo = (product: AnalyticsProduct, paymentType: string, quantity = 1, value?: number) => {
  trackEvent('add_payment_info', {
    currency: 'BRL',
    value: value ?? (product.pricePix || 0) * quantity,
    payment_type: paymentType,
    items: [toGa4Item(product, quantity)],
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  shipping?: number;
  paymentType?: string;
  items?: Array<AnalyticsProduct & { quantity?: number; price?: number }>;
}) => {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'BRL',
    value: order.total,
    shipping: order.shipping,
    payment_type: order.paymentType,
    items: order.items?.map((item) => ({
      ...toGa4Item(item, item.quantity || 1),
      price: item.price ?? item.pricePix,
    })),
  });
};

export const trackWhatsAppClick = (source: string) => {
  trackEvent('whatsapp_click', { source });
};

export const trackFilterApplied = (filterName: string, filterValue: string, results: number) => {
  trackEvent('filter_applied', { filter_name: filterName, filter_value: filterValue, results });
};

export const trackCatalogPageChange = (page: number, totalPages: number) => {
  trackEvent('page_change_catalog', { page, total_pages: totalPages });
};

export const trackBackToCatalogRestored = (productId?: string) => {
  trackEvent('back_to_catalog_restored', { product_id: productId || "unknown" });
};

export const trackPaymentError = (paymentMethod: string, reason: string) => {
  trackEvent('payment_error', { payment_method: paymentMethod, reason });
};

export const trackRouteError = (route: string, reason: string) => {
  trackEvent('route_error', { route, reason });
};

export const trackCacheErrorDetected = (route: string, status?: number) => {
  trackEvent('cache_error_detected', { route, status });
};

export const trackSearch = (query: string, results: number) => {
  trackEvent('search', { search_term: query, results_count: results });
};

// Performance monitoring
export const trackPerformance = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    trackEvent('page_load', {
      load_time: navigation.loadEventEnd - navigation.fetchStart,
      dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      first_paint: paint.find(p => p.name === 'first-paint')?.startTime,
      first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
    });
  }
};

// Scroll tracking
export const useScrollTracking = () => {
  useEffect(() => {
    let maxScroll = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
        maxScroll = scrollPercent;
        trackEvent('scroll_depth', { percent: scrollPercent });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

// Time on page tracking
export const useTimeTracking = () => {
  useEffect(() => {
    const startTime = Date.now();

    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent('time_on_page', { seconds: timeSpent });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
};
