"use client";

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-cyan-glow`} />
      {text && <span className="text-white/70">{text}</span>}
    </div>
  );
}

interface LoadingCardProps {
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingCard({ height = '200px', className = '', style }: LoadingCardProps) {
  return (
    <div
      className={`animate-pulse rounded-[28px] border border-white/10 bg-white/5 ${className}`}
      style={{ height, ...style }}
    />
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
}

export function LoadingGrid({ count = 6, className = '' }: LoadingGridProps) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}