"use client";

import { useEffect, useState, useRef, ReactNode } from 'react';
import { Activity, Zap, HardDrive, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  domContentLoaded: number | null;
  loadComplete: number | null;
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
  });

  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      setMetrics(prev => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
      }));

      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.value * 1000) / 1000,
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        });
      }
    };

    // FCP - First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          reportWebVitals({
            name: 'FCP',
            value: entry.startTime,
            id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          });
        }
      }
    });

    // LCP - Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      reportWebVitals({
        name: 'LCP',
        value: lastEntry.startTime,
        id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      });
    });

    // FID - First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        reportWebVitals({
          name: 'FID',
          value: (entry as any).processingStart - entry.startTime,
          id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        });
      }
    });

    // CLS - Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
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

    try {
      fcpObserver.observe({ entryTypes: ['paint'] });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }

    // Traditional metrics
    const updateTraditionalMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        }));
      }
    };

    if (document.readyState === 'complete') {
      updateTraditionalMetrics();
    } else {
      window.addEventListener('load', updateTraditionalMetrics);
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      window.removeEventListener('load', updateTraditionalMetrics);
    };
  }, []);

  return metrics;
}

// Performance dashboard component
interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
  className?: string;
}

export function PerformanceDashboard({ metrics, className = '' }: PerformanceDashboardProps) {
  const getScoreColor = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'text-gray-500';
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (value: number | null, thresholds: { good: number; poor: number }) => {
    if (value === null) return 'bg-gray-100';
    if (value <= thresholds.good) return 'bg-green-100';
    if (value <= thresholds.poor) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A';
    return `${Math.round(ms)}ms`;
  };

  const formatScore = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toFixed(2);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* FCP */}
      <div className={`p-4 rounded-lg border ${getScoreBg(metrics.fcp, { good: 1800, poor: 3000 })}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className={`h-5 w-5 ${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`} />
          <span className="font-semibold text-sm">FCP</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
          {formatTime(metrics.fcp)}
        </div>
        <div className="text-xs text-gray-600 mt-1">First Contentful Paint</div>
      </div>

      {/* LCP */}
      <div className={`p-4 rounded-lg border ${getScoreBg(metrics.lcp, { good: 2500, poor: 4000 })}`}>
        <div className="flex items-center gap-2 mb-2">
          <Activity className={`h-5 w-5 ${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`} />
          <span className="font-semibold text-sm">LCP</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
          {formatTime(metrics.lcp)}
        </div>
        <div className="text-xs text-gray-600 mt-1">Largest Contentful Paint</div>
      </div>

      {/* FID */}
      <div className={`p-4 rounded-lg border ${getScoreBg(metrics.fid, { good: 100, poor: 300 })}`}>
        <div className="flex items-center gap-2 mb-2">
          <Wifi className={`h-5 w-5 ${getScoreColor(metrics.fid, { good: 100, poor: 300 })}`} />
          <span className="font-semibold text-sm">FID</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(metrics.fid, { good: 100, poor: 300 })}`}>
          {formatTime(metrics.fid)}
        </div>
        <div className="text-xs text-gray-600 mt-1">First Input Delay</div>
      </div>

      {/* CLS */}
      <div className={`p-4 rounded-lg border ${getScoreBg(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
        <div className="flex items-center gap-2 mb-2">
          <HardDrive className={`h-5 w-5 ${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`} />
          <span className="font-semibold text-sm">CLS</span>
        </div>
        <div className={`text-2xl font-bold ${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
          {formatScore(metrics.cls)}
        </div>
        <div className="text-xs text-gray-600 mt-1">Cumulative Layout Shift</div>
      </div>
    </div>
  );
}

// Resource hints and optimization
export function useResourceHints() {
  useEffect(() => {
    // Preconnect to external domains
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://www.google-analytics.com',
      'https://www.facebook.com',
    ];

    preconnectLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for additional domains
    const dnsPrefetchLinks = [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
    ];

    dnsPrefetchLinks.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preload critical resources
    const preloadLinks = [
      { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    ];

    preloadLinks.forEach(({ href, as, type, crossOrigin }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      if (type) link.type = type;
      if (crossOrigin) link.crossOrigin = crossOrigin;
      document.head.appendChild(link);
    });

  }, []);
}

// Lazy loading with performance tracking
interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  onLoad?: () => void;
}

export function LazyLoad({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" />,
  rootMargin = '50px',
  threshold = 0.1,
  onLoad,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasLoaded(true);
          onLoad?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, onLoad]);

  return (
    <div ref={ref}>
      {hasLoaded ? children : fallback}
    </div>
  );
}

// Bundle analyzer component
interface BundleAnalyzerProps {
  className?: string;
}

export function BundleAnalyzer({ className = '' }: BundleAnalyzerProps) {
  const [bundleSize, setBundleSize] = useState<number | null>(null);

  useEffect(() => {
    // This would typically fetch from a build analysis endpoint
    // For demo purposes, we'll simulate it
    const checkBundleSize = async () => {
      try {
        // In a real implementation, this would fetch from /_next/static/chunks/
        // or use webpack-bundle-analyzer data
        const response = await fetch('/api/bundle-size');
        const data = await response.json();
        setBundleSize(data.totalSize);
      } catch (error) {
        // Fallback: estimate based on performance timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          // Rough estimation
          setBundleSize(navigation.transferSize || null);
        }
      }
    };

    checkBundleSize();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      <h3 className="font-semibold text-gray-900 mb-2">Bundle Size</h3>
      <div className="text-2xl font-bold text-gray-700">
        {bundleSize ? formatBytes(bundleSize) : 'Calculating...'}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        Total JavaScript bundle size
      </div>
    </div>
  );
}

// Memory usage monitor
export function useMemoryMonitor() {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
}

// Performance observer hook
export function usePerformanceObserver(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void) {
  const observerRef = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    try {
      observerRef.current = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observerRef.current.observe({ entryTypes });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [entryTypes, callback]);
}