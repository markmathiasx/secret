"use client";

import { useEffect } from 'react';

export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Core Web Vitals
    const reportWebVitals = (metric: any) => {
      console.log('Web Vital:', metric);

      // Send to analytics
      if ((window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // Measure LCP
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        reportWebVitals({
          name: 'LCP',
          value: entry.startTime,
          id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        });
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure FID
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any; // PerformanceEventTiming
        reportWebVitals({
          name: 'FID',
          value: fidEntry.processingStart - fidEntry.startTime,
          id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        });
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Measure CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      reportWebVitals({
        name: 'CLS',
        value: clsValue,
        id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      });
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        console.log('Performance Metrics:', {
          'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
          'TCP Connect': navigation.connectEnd - navigation.connectStart,
          'Server Response': navigation.responseStart - navigation.requestStart,
          'Page Load': navigation.loadEventEnd - navigation.fetchStart,
          'DOM Content Loaded': navigation.domContentLoadedEventEnd - navigation.fetchStart,
          'First Paint': paint.find(p => p.name === 'first-paint')?.startTime,
          'First Contentful Paint': paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        });
      }, 0);
    });

    return () => {
      observer.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
}

export function useResourceHints() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Preconnect to external domains
    const domains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://jimhpbvmvhgkfrtprvfs.supabase.co',
    ];

    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for additional domains
    const prefetchDomains = [
      'https://www.google-analytics.com',
      'https://www.googletagmanager.com',
      'https://connect.facebook.net',
    ];

    prefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }, []);
}