"use client";

import { useEffect } from 'react';

// Analytics events
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }

    // Facebook Pixel
    if ((window as any).fbq) {
      (window as any).fbq('track', 'Lead', properties);
    }

    // Custom analytics
    console.log('Analytics Event:', event, properties);
  }
};

export const trackProductView = (product: any) => {
  trackEvent('view_item', {
    currency: 'BRL',
    value: product.pricePix,
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.pricePix,
    }]
  });
};

export const trackAddToCart = (product: any, quantity = 1) => {
  trackEvent('add_to_cart', {
    currency: 'BRL',
    value: product.pricePix * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      price: product.pricePix,
      quantity,
    }]
  });
};

export const trackPurchase = (order: any) => {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'BRL',
    value: order.total,
    items: order.items?.map((item: any) => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackWhatsAppClick = (source: string) => {
  trackEvent('whatsapp_click', { source });
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