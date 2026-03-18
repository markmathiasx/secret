"use client";

import { useState, useEffect, useRef, useCallback, ReactNode, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onItemClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onItemClick,
  keyExtractor,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleItemClick = useCallback((item: T, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  }, [onItemClick]);

  return (
    <div
      ref={containerRef}
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
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={keyExtractor ? keyExtractor(item, actualIndex) : actualIndex}
                style={{ height: itemHeight }}
                onClick={() => handleItemClick(item, actualIndex)}
                className={onItemClick ? 'cursor-pointer' : ''}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Grid virtualization
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  onItemClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className = '',
  gap = 0,
  overscan = 5,
  onItemClick,
  keyExtractor,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * rowHeight;
  const totalWidth = itemsPerRow * (itemWidth + gap) - gap;

  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );

    const startCol = Math.max(0, Math.floor(scrollLeft / (itemWidth + gap)) - overscan);
    const endCol = Math.min(
      itemsPerRow - 1,
      Math.ceil((scrollLeft + containerWidth) / (itemWidth + gap)) + overscan
    );

    return { startRow, endRow, startCol, endCol };
  }, [scrollTop, scrollLeft, rowHeight, containerHeight, itemWidth, gap, containerWidth, itemsPerRow, totalRows, overscan]);

  const visibleItems = useMemo(() => {
    const items: any[] = [];
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
        const index = row * itemsPerRow + col;
        if (index < items.length) {
          items.push({
            item: items[index],
            index,
            row,
            col,
          });
        }
      }
    }
    return items;
  }, [visibleRange, itemsPerRow]);

  const offsetY = visibleRange.startRow * rowHeight;
  const offsetX = visibleRange.startCol * (itemWidth + gap);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  const handleItemClick = useCallback((item: T, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  }, [onItemClick]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {visibleItems.map(({ item, index, row, col }) => {
            const itemOffsetX = (col - visibleRange.startCol) * (itemWidth + gap);
            const itemOffsetY = (row - visibleRange.startRow) * rowHeight;

            return (
              <div
                key={keyExtractor ? keyExtractor(item, index) : index}
                style={{
                  position: 'absolute',
                  left: itemOffsetX,
                  top: itemOffsetY,
                  width: itemWidth,
                  height: itemHeight,
                }}
                onClick={() => handleItemClick(item, index)}
                className={onItemClick ? 'cursor-pointer' : ''}
              >
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Infinite virtualized list with data fetching
interface InfiniteVirtualizedListProps<T> {
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  loadMore: (startIndex: number, endIndex: number) => Promise<T[]>;
  totalItems?: number;
  className?: string;
  overscan?: number;
  threshold?: number;
  onItemClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function InfiniteVirtualizedList<T>({
  itemHeight,
  containerHeight,
  renderItem,
  loadMore,
  totalItems,
  className = '',
  overscan = 5,
  threshold = 10,
  onItemClick,
  keyExtractor,
}: InfiniteVirtualizedListProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedRangesRef = useRef<Set<string>>(new Set());

  const loadItems = useCallback(async (startIndex: number, endIndex: number) => {
    const rangeKey = `${startIndex}-${endIndex}`;
    if (loadedRangesRef.current.has(rangeKey) || loading) return;

    setLoading(true);
    try {
      const newItems = await loadMore(startIndex, endIndex);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => {
          const updated = [...prev];
          newItems.forEach((item, idx) => {
            const actualIndex = startIndex + idx;
            if (actualIndex >= updated.length) {
              updated.push(item);
            } else {
              updated[actualIndex] = item;
            }
          });
          return updated;
        });
        loadedRangesRef.current.add(rangeKey);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  }, [loadMore, loading]);

  const handleRangeChange = useCallback((startIndex: number, endIndex: number) => {
    if (hasMore && endIndex >= items.length - threshold) {
      loadItems(items.length, items.length + 50); // Load next 50 items
    }
  }, [hasMore, items.length, threshold, loadItems]);

  // Initial load
  useEffect(() => {
    loadItems(0, 50);
  }, [loadItems]);

  return (
    <VirtualizedList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={(item, index) => {
        if (!item) {
          return (
            <div
              style={{ height: itemHeight }}
              className="flex items-center justify-center bg-gray-100 animate-pulse"
            >
              Carregando...
            </div>
          );
        }
        return renderItem(item, index);
      }}
      className={className}
      overscan={overscan}
      onItemClick={onItemClick}
      keyExtractor={keyExtractor}
    />
  );
}

// Masonry-style virtualized grid
interface MasonryVirtualizedGridProps<T> {
  items: T[];
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  getItemHeight: (item: T, index: number) => number;
  className?: string;
  gap?: number;
  overscan?: number;
  onItemClick?: (item: T, index: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function MasonryVirtualizedGrid<T>({
  items,
  containerWidth,
  containerHeight,
  renderItem,
  getItemHeight,
  className = '',
  gap = 0,
  overscan = 5,
  onItemClick,
  keyExtractor,
}: MasonryVirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate column layout
  const minColumnWidth = 200;
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (minColumnWidth + gap)));
  const columnWidth = (containerWidth - (columns - 1) * gap) / columns;

  const columnHeights = useMemo(() => {
    const heights = new Array(columns).fill(0);
    const positions: Array<{ top: number; left: number; height: number }> = [];

    items.forEach((item, index) => {
      const itemHeight = getItemHeight(item, index);
      const shortestColumn = heights.indexOf(Math.min(...heights));

      positions[index] = {
        top: heights[shortestColumn],
        left: shortestColumn * (columnWidth + gap),
        height: itemHeight,
      };

      heights[shortestColumn] += itemHeight + gap;
    });

    return { heights, positions, totalHeight: Math.max(...heights) };
  }, [items, columns, columnWidth, gap, getItemHeight]);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / 100) * 10 - overscan * 10); // Rough estimate
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / 100) * 10 + overscan * 10
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, idx) => ({
        item,
        index: visibleRange.startIndex + idx,
        position: columnHeights.positions[visibleRange.startIndex + idx],
      }))
      .filter(({ position }) =>
        position.top < scrollTop + containerHeight + 100 &&
        position.top + position.height > scrollTop - 100
      );
  }, [items, visibleRange, columnHeights.positions, scrollTop, containerHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleItemClick = useCallback((item: T, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  }, [onItemClick]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        style={{
          width: containerWidth,
          height: columnHeights.totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map(({ item, index, position }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : index}
            style={{
              position: 'absolute',
              top: position.top,
              left: position.left,
              width: columnWidth,
              height: position.height,
            }}
            onClick={() => handleItemClick(item, index)}
            className={onItemClick ? 'cursor-pointer' : ''}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}