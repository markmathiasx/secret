"use client";

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 300,
  className = '',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2 + scrollX;
        y = trigger.top - tooltip.height - 8 + scrollY;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2 - tooltip.width / 2 + scrollX;
        y = trigger.bottom + 8 + scrollY;
        break;
      case 'left':
        x = trigger.left - tooltip.width - 8 + scrollX;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2 + scrollY;
        break;
      case 'right':
        x = trigger.right + 8 + scrollX;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2 + scrollY;
        break;
    }

    // Adjust if tooltip goes off screen
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 8) x = 8;
    if (x + tooltip.width > viewportWidth - 8) x = viewportWidth - tooltip.width - 8;
    if (y < 8) y = 8;
    if (y + tooltip.height > viewportHeight - 8) y = viewportHeight - tooltip.height - 8;

    setCoords({ x, y });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, position, updatePosition]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      hideTooltip();
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
        className="inline-block"
        tabIndex={0}
        role="button"
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`
            fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
            pointer-events-none transition-opacity duration-200 max-w-xs
            ${className}
          `}
          style={{
            left: coords.x,
            top: coords.y,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
              ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
            `}
          />
        </div>,
        document.body
      )}
    </>
  );
}

// Tooltip with trigger types
interface TooltipTriggerProps extends Omit<TooltipProps, 'children'> {
  trigger: ReactNode;
}

export function TooltipTrigger({ trigger, ...props }: TooltipTriggerProps) {
  return <Tooltip {...props}>{trigger}</Tooltip>;
}

// Preset tooltips for common use cases
export function InfoTooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <Tooltip content={content} position="top" className="bg-blue-900">
      {children}
    </Tooltip>
  );
}

export function WarningTooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <Tooltip content={content} position="top" className="bg-yellow-900">
      {children}
    </Tooltip>
  );
}

export function ErrorTooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <Tooltip content={content} position="top" className="bg-red-900">
      {children}
    </Tooltip>
  );
}

// Rich tooltip with title and description
interface RichTooltipProps extends Omit<TooltipProps, 'content'> {
  title: string;
  description?: string;
  shortcut?: string;
}

export function RichTooltip({ title, description, shortcut, position = 'top', ...props }: RichTooltipProps) {
  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div className="font-semibold">{title}</div>
          {description && <div className="text-xs opacity-90">{description}</div>}
          {shortcut && (
            <div className="text-xs opacity-75 font-mono bg-black/20 px-1 py-0.5 rounded">
              {shortcut}
            </div>
          )}
        </div>
      }
      position={position}
      {...props}
    />
  );
}