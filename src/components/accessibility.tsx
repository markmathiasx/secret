"use client";

import { useEffect } from 'react';

export function AccessibilityProvider() {
  useEffect(() => {
    // Skip link functionality
    const handleSkipLink = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.querySelector('.skip-link') as HTMLAnchorElement;
        if (skipLink && document.activeElement === skipLink) {
          e.preventDefault();
          const main = document.querySelector('main') || document.querySelector('[role="main"]');
          if (main) {
            (main as HTMLElement).focus();
          }
        }
      }
    };

    // Focus trap for modals
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
        modals.forEach(modal => {
          const closeBtn = modal.querySelector('[aria-label="Fechar"], [aria-label="Close"]') as HTMLElement;
          if (closeBtn) {
            closeBtn.click();
          }
        });
      }
    };

    // High contrast mode detection
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };

    // Reduced motion detection
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('reduced-motion', e.matches);
    };

    document.addEventListener('keydown', handleSkipLink);
    document.addEventListener('keydown', handleEscape);
    mediaQuery.addEventListener('change', handleContrastChange);
    motionQuery.addEventListener('change', handleMotionChange);

    // Initial checks
    document.documentElement.classList.toggle('high-contrast', mediaQuery.matches);
    document.documentElement.classList.toggle('reduced-motion', motionQuery.matches);

    return () => {
      document.removeEventListener('keydown', handleSkipLink);
      document.removeEventListener('keydown', handleEscape);
      mediaQuery.removeEventListener('change', handleContrastChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return null;
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link fixed left-4 top-4 z-[100] -translate-y-full transform rounded-lg bg-cyan-glow px-4 py-2 text-black transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-glow focus:ring-offset-2 focus:ring-offset-black"
    >
      Pular para conteúdo principal
    </a>
  );
}

export function FocusTrap({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (!modal) return;

    const focusableContent = modal.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0] as HTMLElement;
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return <>{children}</>;
}