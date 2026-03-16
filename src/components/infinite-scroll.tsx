"use client";

import { useEffect, useRef, useCallback, useState, ReactNode } from 'react';
import { LoadingSpinner } from './loading-states';

interface InfiniteScrollProps {
  children: ReactNode;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
}

export function InfiniteScroll({
  children,
  hasNextPage,
  isLoading,
  onLoadMore,
  threshold = 100,
  rootMargin = '100px',
  className = '',
  loadingComponent,
  endMessage,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      onLoadMore();
    }
  }, [hasNextPage, isLoading, onLoadMore]);

  useEffect(() => {
    if (isLoading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin,
      }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, isLoading, rootMargin]);

  return (
    <div className={className}>
      {children}

      {/* Loading indicator */}
      {isLoading && (
        <div ref={loadingRef} className="flex justify-center py-8">
          {loadingComponent || <LoadingSpinner />}
        </div>
      )}

      {/* End message */}
      {!hasNextPage && !isLoading && endMessage && (
        <div className="flex justify-center py-8 text-gray-500">
          {endMessage}
        </div>
      )}

      {/* Invisible trigger for intersection observer */}
      {hasNextPage && !isLoading && (
        <div
          ref={loadingRef}
          className="h-4"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// Hook for manual infinite scroll control
export function useInfiniteScroll(
  hasNextPage: boolean,
  isLoading: boolean,
  onLoadMore: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const { threshold = 100, rootMargin = '100px' } = options;
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      onLoadMore();
    }
  }, [hasNextPage, isLoading, onLoadMore]);

  useEffect(() => {
    if (isLoading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin,
      }
    );

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, isLoading, rootMargin]);

  return triggerRef;
}

// Virtualized infinite scroll for large lists
interface VirtualizedInfiniteScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  hasNextPage: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  overscan?: number;
}

export function VirtualizedInfiniteScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  hasNextPage,
  isLoading,
  onLoadMore,
  className = '',
  overscan = 5,
}: VirtualizedInfiniteScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Load more when near bottom
    if (
      hasNextPage &&
      !isLoading &&
      newScrollTop + containerHeight >= totalHeight - itemHeight * 3
    ) {
      onLoadMore();
    }
  }, [containerHeight, totalHeight, itemHeight, hasNextPage, isLoading, onLoadMore]);

  return (
    <div
      ref={scrollRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}

// Pull to refresh functionality
interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  className?: string;
  pullText?: string;
  refreshingText?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className = '',
  pullText = 'Puxe para atualizar',
  refreshingText = 'Atualizando...',
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(distance);
    }
  }, [startY, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = progress * 0.8;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-4 bg-white border-b"
          style={{
            transform: `translateY(${Math.max(-100 + progress * 100, -100)}%)`,
            opacity,
          }}
        >
          <div className="flex items-center gap-2 text-gray-600">
            {isRefreshing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>{refreshingText}</span>
              </>
            ) : (
              <>
                <div
                  className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full transition-transform"
                  style={{ transform: `rotate(${progress * 360}deg)` }}
                />
                <span>{pullText}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
}