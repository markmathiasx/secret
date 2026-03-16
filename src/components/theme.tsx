"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'auto',
  storageKey = 'mdh-theme',
  attribute = 'data-theme',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      setTheme(stored as Theme);
    }
  }, [storageKey]);

  // Update resolved theme based on theme setting and system preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'auto' && enableSystem) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme === 'dark' ? 'dark' : 'light');
      }
    };

    updateResolvedTheme();

    if (theme === 'auto' && enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, enableSystem]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(attribute, resolvedTheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1f2937' : '#ffffff');
    }
  }, [resolvedTheme, attribute]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme toggle button
interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', size = 'md', showLabel = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center rounded-lg border border-gray-300
        bg-white text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none
        focus:ring-2 focus:ring-cyan-glow focus:ring-offset-2 transition-colors
        dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
        ${sizeClasses[size]} ${className}
      `}
      aria-label={`Alternar tema. Tema atual: ${theme === 'auto' ? 'automático' : resolvedTheme}`}
    >
      {resolvedTheme === 'dark' ? (
        <SunIcon className={iconSizeClasses[size]} />
      ) : (
        <MoonIcon className={iconSizeClasses[size]} />
      )}
      {showLabel && (
        <span className="ml-2 text-sm">
          {theme === 'auto' ? 'Auto' : resolvedTheme === 'dark' ? 'Escuro' : 'Claro'}
        </span>
      )}
    </button>
  );
}

// Icons
function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

// Custom theme hook for component-specific theming
export function useThemeClass(baseClass: string, darkClass?: string) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark' && darkClass) {
    return `${baseClass} ${darkClass}`;
  }

  return baseClass;
}

// Theme-aware component wrapper
interface ThemedComponentProps {
  children: ReactNode;
  className?: string;
  lightClass?: string;
  darkClass?: string;
}

export function ThemedComponent({
  children,
  className = '',
  lightClass = '',
  darkClass = '',
}: ThemedComponentProps) {
  const themeClass = useThemeClass(
    className,
    darkClass || (lightClass ? `${className} ${lightClass.replace('light:', 'dark:')}` : undefined)
  );

  return <div className={themeClass}>{children}</div>;
}

// CSS custom properties for dynamic theming
export const themeVariables = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f9fafb',
    '--text-primary': '#111827',
    '--text-secondary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--accent-color': '#06b6d4',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  dark: {
    '--bg-primary': '#1f2937',
    '--bg-secondary': '#111827',
    '--text-primary': '#f9fafb',
    '--text-secondary': '#d1d5db',
    '--border-color': '#374151',
    '--accent-color': '#06b6d4',
    '--shadow': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
  },
};

// Apply theme variables
export function applyThemeVariables(theme: 'light' | 'dark') {
  const root = document.documentElement;
  const variables = themeVariables[theme];

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

// High contrast mode support
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion support
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}