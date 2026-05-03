// lib/design-tokens.ts — MDH3D Premium Design System
export const designTokens = {
  primary: {
    base: '#0A0A0F',
    accent: '#6366F1',
    glow: 'rgba(99,102,241,0.15)',
  },
  conversion: {
    cta: '#10B981',
    ctaHover: '#059669',
    urgency: '#F59E0B',
    success: '#10B981',
    error: '#EF4444',
  },
  background: {
    base: '#FFFFFF',
    surface: '#F8FAFC',
    elevated: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    muted: '#94A3B8',
    inverse: '#FFFFFF',
  },
  shadows: {
    soft: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgba(99,102,241,0.3)',
  },
  spacing: {
    unit: 4, // 4px base
  },
  typography: {
    scale: 1.25, // modular scale ratio
    fontTitle: 'var(--font-sans)',
    fontBody: 'var(--font-sans)',
  },
} as const;

export type DesignTokens = typeof designTokens;
