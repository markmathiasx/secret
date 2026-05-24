"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SafeBackgroundVideoProps = {
  src?: string | null;
  poster?: string | null;
  fallbackVisual?: ReactNode;
  overlay?: ReactNode;
  reducedMotionBehavior?: "poster" | "fallback" | "none";
  className?: string;
  videoClassName?: string;
  overlayClassName?: string;
  fallbackClassName?: string;
  objectPosition?: string;
};

export function SafeBackgroundVideo({
  src,
  poster,
  fallbackVisual,
  overlay,
  reducedMotionBehavior = "poster",
  className,
  videoClassName,
  overlayClassName,
  fallbackClassName,
  objectPosition = "center",
}: SafeBackgroundVideoProps) {
  const shouldReduceMotion = useReducedMotion();
  const localSrc = src && !/^https?:\/\//i.test(src) ? src : null;
  const showVideo = Boolean(localSrc) && !shouldReduceMotion;
  const showPosterFallback = Boolean(poster) && (!shouldReduceMotion || reducedMotionBehavior === "poster");
  const showCustomFallback = !showVideo && Boolean(fallbackVisual) && (!shouldReduceMotion || reducedMotionBehavior === "fallback" || !poster);
  const showGeneratedFallback = !showVideo && !showPosterFallback && !showCustomFallback && reducedMotionBehavior !== "none";

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {showPosterFallback ? (
        <div
          className={cn("absolute inset-0 bg-cover bg-center", showVideo ? "opacity-0" : "opacity-100", fallbackClassName)}
          style={{ backgroundImage: `url("${poster}")`, backgroundPosition: objectPosition }}
        />
      ) : null}

      {showCustomFallback ? (
        <div className={cn("absolute inset-0", fallbackClassName)}>{fallbackVisual}</div>
      ) : null}

      {showGeneratedFallback ? (
        <div className={cn("mdh-cad-fallback absolute inset-0", fallbackClassName)} />
      ) : null}

      {showGeneratedFallback ? <div className="mdh-cad-fallback-lines absolute inset-0" /> : null}

      {showVideo ? (
        <video
          className={cn("absolute inset-0 h-full w-full object-cover", videoClassName)}
          src={localSrc ?? undefined}
          poster={poster ?? undefined}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          style={{ objectPosition }}
        />
      ) : null}

      {overlay ?? (
        <div
          className={cn(
            "absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88),rgba(2,6,23,0.46)_46%,rgba(2,6,23,0.76))]",
            overlayClassName
          )}
        />
      )}
    </div>
  );
}
