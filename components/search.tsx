"use client";

import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export interface SearchFilter {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'checkbox';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  icon?: ReactNode;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void;
  placeholder?: string;
  filters?: SearchFilter[];
  suggestions?: SearchSuggestion[];
  debounceMs?: number;
  showSuggestions?: boolean;
  showFilters?: boolean;
  className?: string;
  initialQuery?: string;
  initialFilters?: Record<string, any>;
}

export function AdvancedSearch({
  onSearch,
  placeholder = 'Buscar...',
  filters = [],
  suggestions = [],
  debounceMs = 300,
  showSuggestions = true,
  showFilters = true,
  className = '',
  initialQuery = '',
  initialFilters = {},
}: AdvancedSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query, activeFilters);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, activeFilters, onSearch, debounceMs]);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim() && showSuggestions) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestionsList(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestionsList(false);
    }
  }, [query, suggestions, showSuggestions]);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestionsList(false);
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestionsList) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestionsList(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const activeFiltersCount = Object.values(activeFilters).filter(value =>
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  ).length;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setShowSuggestionsList(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-glow focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showFilters && filters.length > 0 && (
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                  activeFiltersCount > 0
                    ? 'bg-cyan-glow text-black'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-label="Filtros"
              >
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="bg-black text-white text-xs rounded-full px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestionsList && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                index === selectedSuggestionIndex ? 'bg-cyan-50' : ''
              }`}
            >
              {suggestion.icon}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{suggestion.text}</div>
                {suggestion.category && (
                  <div className="text-sm text-gray-500">{suggestion.category}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filters panel */}
      {isFiltersOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filters.map(filter => (
              <div key={filter.key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>

                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-glow focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    {filter.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && (
                  <div className="space-y-2">
                    {filter.options?.map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={(activeFilters[filter.key] || []).includes(option.value)}
                          onChange={(e) => {
                            const current = activeFilters[filter.key] || [];
                            const updated = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v: string) => v !== option.value);
                            handleFilterChange(filter.key, updated);
                          }}
                          className="rounded border-gray-300 text-cyan-glow focus:ring-cyan-200"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                      value={activeFilters[filter.key] || filter.min}
                      onChange={(e) => handleFilterChange(filter.key, Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{filter.min}</span>
                      <span>{activeFilters[filter.key] || filter.min}</span>
                      <span>{filter.max}</span>
                    </div>
                  </div>
                )}

                {filter.type === 'checkbox' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeFilters[filter.key] || false}
                      onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                      className="rounded border-gray-300 text-cyan-glow focus:ring-cyan-200"
                    />
                    <span className="text-sm">{filter.label}</span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Search with recent searches and trending
interface SmartSearchProps extends Omit<AdvancedSearchProps, 'suggestions'> {
  recentSearches?: string[];
  trendingSearches?: string[];
  onRecentSearchSelect?: (query: string) => void;
  maxRecentSearches?: number;
}

export function SmartSearch({
  recentSearches = [],
  trendingSearches = [],
  onRecentSearchSelect,
  maxRecentSearches = 5,
  ...props
}: SmartSearchProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const suggestions: SearchSuggestion[] = [
    ...recentSearches.slice(0, maxRecentSearches).map(search => ({
      id: `recent-${search}`,
      text: search,
      category: 'Recente',
    })),
    ...trendingSearches.map(search => ({
      id: `trending-${search}`,
      text: search,
      category: 'Em alta',
    })),
  ];

  return (
    <AdvancedSearch
      {...props}
      suggestions={suggestions}
      onSearch={(query, filters) => {
        if (query.trim()) {
          // Add to recent searches
          const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, maxRecentSearches);
          localStorage.setItem('recentSearches', JSON.stringify(updated));
        }
        props.onSearch(query, filters);
      }}
    />
  );
}

// Search results component
interface SearchResultsProps {
  query: string;
  results: any[];
  totalResults: number;
  isLoading: boolean;
  renderResult: (result: any, index: number) => ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function SearchResults({
  query,
  results,
  totalResults,
  isLoading,
  renderResult,
  onLoadMore,
  hasNextPage,
  emptyMessage = 'Nenhum resultado encontrado',
  className = '',
}: SearchResultsProps) {
  return (
    <div className={className}>
      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">
          {query && (
            <span>
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => renderResult(result, index))}

          {/* Load more */}
          {hasNextPage && onLoadMore && (
            <div className="text-center py-4">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-cyan-glow text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Carregando...' : 'Carregar mais'}
              </button>
            </div>
          )}
        </div>
      ) : !isLoading ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {query ? 'Nenhum resultado encontrado' : 'Digite para buscar'}
          </h3>
          <p className="text-gray-500">
            {query
              ? `Tente ajustar sua busca ou verificar a ortografia de "${query}"`
              : 'Comece digitando para ver sugestões e resultados'
            }
          </p>
        </div>
      ) : null}
    </div>
  );
}